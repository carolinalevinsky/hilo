import { listAssessments } from './assessments'
import { logAction } from './audit'
import { getDb } from './db'
import { listGoalProgress, listGoals } from './goals'
import { getPatient } from './patients'
import { listReports } from './reports'
import { listSessions } from './sessions'

/**
 * Everything Hilo holds about one patient, assembled in one place.
 *
 * This is the right of access under Ley N.º 18.331 (art. 14): the person the
 * data is about — or whoever has their patria potestad — can ask what is held,
 * and be given it in an intelligible form. v1 had a button for it. v2 had
 * nothing, which is the kind of gap that is invisible until someone asks.
 *
 * ─── The private note ──────────────────────────────────────────────────────
 *
 * **`sessions.private_note` is deliberately excluded, and its existence is
 * deliberately declared.** It is the field the form describes as "Para vos. No
 * entra en ningún informe" — where a practitioner writes a hunch, a worry, or
 * something a parent said that they are still thinking about.
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
  assessments: Awaited<ReturnType<typeof listAssessments>>
  reports: Awaited<ReturnType<typeof listReports>>
  payments: {
    id: string
    period: string
    amount: number
    paidOn: string | null
    method: string | null
  }[]
  /** How many sessions carry a private note, without any of their content. */
  privateNoteCount: number
}

export async function buildPatientExport(
  practitionerId: string,
  patientId: string,
  practitioner: { full_name: string; discipline: string },
): Promise<PatientExport | null> {
  const patient = await getPatient(practitionerId, patientId)
  if (!patient) return null

  const db = await getDb()

  const [goals, goalProgress, sessions, assessments, reports, { data: payments }] =
    await Promise.all([
      listGoals(practitionerId, patientId, { includeInactive: true }),
      listGoalProgress(practitionerId, patientId),
      // Everything, not the hundred the ficha shows. An export that stops at an
      // arbitrary limit is not an answer to "what do you hold about me".
      listSessions(practitionerId, patientId, 10_000),
      listAssessments(practitionerId, patientId, 10_000),
      listReports(practitionerId, patientId, 10_000),
      db
        .from('payments')
        .select('id, period, amount, paid_on, method')
        .eq('practitioner_id', practitionerId)
        .eq('patient_id', patientId)
        .order('period', { ascending: false }),
    ])

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
      // `private_note` is not read into this shape at all, rather than read and
      // then dropped. A field that never enters the object cannot leak out of it
      // through a later `JSON.stringify` of "the whole thing".
      goals: (session.session_goals ?? [])
        .map((link) => link.goals?.title)
        .filter((title): title is string => Boolean(title)),
    })),
    assessments,
    reports,
    payments: (payments ?? []).map((payment) => ({
      id: payment.id,
      period: payment.period,
      amount: payment.amount,
      paidOn: payment.paid_on,
      method: payment.method,
    })),
    privateNoteCount: sessions.filter((session) => session.private_note?.trim()).length,
  }
}
