import type { Database } from '@/lib/database.types'

import { logAction } from './audit'
import { getDb } from './db'
import { listGoalProgress, listGoals } from './goals'
import { getPatient } from './patients'
import { listTrash, type TrashItem } from './trash'

/**
 * Everything Ombúa holds about one patient, assembled in one place.
 *
 * This is the right of access under Ley N.º 18.331 (art. 14) and the patient's
 * ownership of their historia clínica under Ley N.º 18.335: the person the data
 * is about — or whoever has their patria potestad — can ask what is held, and be
 * given it in an intelligible form. v1 had a button for it. v2 had nothing,
 * which is the kind of gap that is invisible until someone asks.
 *
 * ─── Todo, no casi todo ────────────────────────────────────────────────────
 *
 * La primera versión dejaba afuera lo que la familia misma había firmado y
 * contestado —el consentimiento, "Antes de empezar", las escalas—, la
 * asistencia, y el historial de versiones de los informes, que es justamente la
 * prueba de qué se entregó. Y pedía "hasta 10.000 filas" a una API que corta en
 * 1.000 sin avisar (`max_rows` en `supabase/config.toml`), así que una historia
 * larga salía recortada y con cara de completa. Ahora cada lista se pide por
 * páginas hasta que no queda nada.
 *
 * Lo que está en la papelera se nombra al final: no se muestra en pantalla, pero
 * se sigue guardando, y "qué tienen sobre mí" incluye eso.
 *
 * ─── The private note ──────────────────────────────────────────────────────
 *
 * **`sessions.private_note` is deliberately excluded, and its existence is
 * deliberately declared.** It was a second field on the session form, offered as
 * "Para vos. No entra en ningún informe" — where a practitioner wrote a hunch, a
 * worry, or something a parent said that they were still thinking about. The
 * form no longer offers it (see `sessions.ts`), so no new rows have one, but the
 * rows written while it existed still do and this export still owes them the
 * same treatment.
 *
 * Excluding it silently would be the easy thing and the wrong one: it is still
 * personal data about the patient, and pretending it does not exist is what
 * makes an access request adversarial. So the export leaves the content out and
 * says, in one line, that working notes exist and can be asked for. The family
 * knows what to ask; the practitioner keeps somewhere to think out loud.
 *
 * If a request ever escalates to the URCDP, that line is the difference between
 * a judgement call and a concealment.
 */

type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type PatientExport = {
  generatedAt: string
  practitioner: { fullName: string; discipline: string }
  patient: Awaited<ReturnType<typeof getPatient>>
  goals: Awaited<ReturnType<typeof listGoals>>
  goalProgress: Awaited<ReturnType<typeof listGoalProgress>>
  sessions: {
    id: string
    heldOn: string
    progressNote: string | null
    goals: string[]
  }[]
  appointments: {
    date: string
    startTime: string
    durationMinutes: number
    status: string
    note: string | null
  }[]
  assessments: Row<'assessments'>[]
  reports: Row<'reports'>[]
  /** Lo que decía cada informe o evaluación antes de cada cambio, y lo firmado. */
  documentVersions: Row<'document_versions'>[]
  consents: Row<'consents'>[]
  intakeResponses: Row<'intake_responses'>[]
  scaleResponses: {
    scale: string
    answers: number[]
    total: number
    difficulty: number | null
    selfHarmFlag: boolean | null
    submittedAt: string
    reviewedAt: string | null
  }[]
  payments: {
    id: string
    period: string
    amount: number
    paidOn: string | null
    method: string | null
  }[]
  /** Lo que está en la papelera: apartado de la vista, todavía guardado. */
  inTrash: TrashItem[]
  /** How many sessions carry a private note, without any of their content. */
  privateNoteCount: number
}

/** Cuántas filas se piden por vez. Debajo del `max_rows` de PostgREST. */
const PAGE = 500

/**
 * Todas las filas de una consulta, página por página.
 *
 * `page(from, to)` arma la consulta con su `.range(from, to)` y un orden
 * estable; esto la repite hasta que una página vuelve incompleta.
 */
export async function everyRow<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < PAGE) return all
  }
}

export async function buildPatientExport(
  practitionerId: string,
  patientId: string,
  practitioner: { full_name: string; discipline: string },
): Promise<PatientExport | null> {
  const patient = await getPatient(practitionerId, patientId)
  if (!patient) return null

  const db = await getDb()
  const mine = { practitioner_id: practitionerId, patient_id: patientId }

  const [
    goals,
    goalProgress,
    sessions,
    appointments,
    assessments,
    reports,
    consents,
    intakeResponses,
    scaleResponses,
    payments,
    inTrash,
  ] = await Promise.all([
    listGoals(practitionerId, patientId, { includeInactive: true }),
    listGoalProgress(practitionerId, patientId),
    everyRow((from, to) =>
      db
        .from('sessions')
        .select('id, held_on, progress_note, private_note, session_goals(goals(title))')
        .match(mine)
        .order('held_on', { ascending: false })
        .order('id')
        .range(from, to),
    ),
    everyRow((from, to) =>
      db
        .from('appointments')
        .select('scheduled_on, start_time, duration_minutes, status, note, id')
        .match(mine)
        .order('scheduled_on', { ascending: false })
        .order('id')
        .range(from, to),
    ),
    everyRow((from, to) =>
      db
        .from('assessments')
        .select('*')
        .match(mine)
        .order('assessed_on', { ascending: false })
        .order('id')
        .range(from, to),
    ),
    everyRow((from, to) =>
      db
        .from('reports')
        .select('*')
        .match(mine)
        .order('issued_on', { ascending: false })
        .order('id')
        .range(from, to),
    ),
    everyRow((from, to) =>
      db.from('consents').select('*').match(mine).order('signed_at').order('id').range(from, to),
    ),
    everyRow((from, to) =>
      db
        .from('intake_responses')
        .select('*')
        .match(mine)
        .order('submitted_at')
        .order('id')
        .range(from, to),
    ),
    everyRow((from, to) =>
      db
        .from('scale_responses')
        .select('scale, answers, total, difficulty, self_harm_flag, submitted_at, reviewed_at, id')
        .match(mine)
        .order('submitted_at')
        .order('id')
        .range(from, to),
    ),
    everyRow((from, to) =>
      db
        .from('payments')
        .select('id, period, amount, paid_on, method')
        .match(mine)
        .order('period', { ascending: false })
        .order('id')
        .range(from, to),
    ),
    listTrash(practitionerId, patientId),
  ])

  const reportIds = reports.map((report) => report.id)
  const assessmentIds = assessments.map((assessment) => assessment.id)
  const documentVersions =
    reportIds.length + assessmentIds.length === 0
      ? []
      : await everyRow((from, to) =>
          db
            .from('document_versions')
            .select('*')
            .eq('practitioner_id', practitionerId)
            .or(
              [
                reportIds.length ? `report_id.in.(${reportIds.join(',')})` : null,
                assessmentIds.length ? `assessment_id.in.(${assessmentIds.join(',')})` : null,
              ]
                .filter(Boolean)
                .join(','),
            )
            .order('created_at')
            .order('id')
            .range(from, to),
        )

  // v1 never recorded that anyone looked at a record. Reading a whole clinical
  // history in one go is exactly the event an audit log exists for.
  await logAction(practitionerId, 'export', 'patient', patientId)

  return {
    generatedAt: new Date().toISOString(),
    practitioner: {
      fullName: practitioner.full_name,
      discipline: practitioner.discipline,
    },
    patient,
    goals,
    goalProgress,
    sessions: sessions.map((session) => ({
      id: session.id,
      heldOn: session.held_on,
      progressNote: session.progress_note,
      // `private_note` is read only to be counted below, and never copied into
      // this shape. A field that never enters the object cannot leak out of it
      // through a later `JSON.stringify` of "the whole thing".
      goals: (session.session_goals ?? [])
        .map((link) => link.goals?.title)
        .filter((title): title is string => Boolean(title)),
    })),
    appointments: appointments.map((appointment) => ({
      date: appointment.scheduled_on,
      startTime: appointment.start_time,
      durationMinutes: appointment.duration_minutes,
      status: appointment.status,
      note: appointment.note,
    })),
    assessments,
    reports,
    documentVersions,
    consents,
    intakeResponses,
    scaleResponses: scaleResponses.map((response) => ({
      scale: response.scale,
      answers: response.answers,
      total: response.total,
      difficulty: response.difficulty,
      selfHarmFlag: response.self_harm_flag,
      submittedAt: response.submitted_at,
      reviewedAt: response.reviewed_at,
    })),
    payments: payments.map((payment) => ({
      id: payment.id,
      period: payment.period,
      amount: payment.amount,
      paidOn: payment.paid_on,
      method: payment.method,
    })),
    inTrash,
    privateNoteCount: sessions.filter((session) => session.private_note?.trim()).length,
  }
}
