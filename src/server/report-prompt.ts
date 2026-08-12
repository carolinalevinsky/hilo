import { ageLabel } from '@/lib/age'
import { formatDate } from '@/lib/dates'
import { disciplineAdjective, recipientTone, type RecipientId } from '@/lib/recipients'
import { joinEs } from '@/lib/text'
import { firstName } from '@/lib/whatsapp'

import { getDb } from './db'

/**
 * Assembling the context and the prompt for a clinical report.
 *
 * Split out of `reports.ts` because the two do different jobs: that file stores
 * rows, this one decides what the model is told. Keeping them apart is also what
 * makes the prompt snapshot-testable without a database.
 *
 * The context is drawn from what the practitioner already recorded — goals,
 * their progress, the last few session notes. That is the whole promise of the
 * product: the report is written from the record, not from memory at 11pm.
 */

export type ReportContext = {
  patientName: string
  patientFirstName: string
  age: string
  referralReason: string
  startDate: string
  goals: { title: string; progress: number }[]
  recentNotes: string[]
  sessionCount: number
}

export async function gatherReportContext(
  practitionerId: string,
  patientId: string,
): Promise<ReportContext> {
  const db = await getDb()

  const [{ data: patient }, { data: goals }, { data: sessions }, { count }] =
    await Promise.all([
      db
        .from('patients')
        .select('full_name, date_of_birth, referral_reason, start_date')
        .eq('id', patientId)
        .eq('practitioner_id', practitionerId)
        .single(),
      db
        .from('goals')
        .select('title, progress')
        .eq('patient_id', patientId)
        .eq('practitioner_id', practitionerId)
        .eq('is_active', true)
        .order('position'),
      db
        .from('sessions')
        .select('progress_note')
        .eq('patient_id', patientId)
        .eq('practitioner_id', practitionerId)
        .order('held_on', { ascending: false })
        .limit(6),
      db
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .eq('practitioner_id', practitionerId),
    ])

  if (!patient) throw new Error('patient_not_found')

  return {
    patientName: patient.full_name,
    patientFirstName: firstName(patient.full_name),
    age: ageLabel(patient.date_of_birth) ?? 'sin edad consignada',
    referralReason: patient.referral_reason ?? '',
    startDate: formatDate(patient.start_date) ?? '',
    goals: goals ?? [],
    // The private note is deliberately not here. It is the practitioner's own
    // working note and it must never reach a document that leaves the office.
    recentNotes: (sessions ?? [])
      .map((session) => session.progress_note)
      .filter((note): note is string => Boolean(note)),
    sessionCount: count ?? 0,
  }
}

/**
 * The task-specific half of the system prompt. The clinical rules live in
 * `BASE_INSTRUCTIVO` (see `ai.ts`) and are prepended to this.
 *
 * The "no bullets, no markdown" instruction is not fussiness: the output goes
 * straight into a document a professional signs, and a clinical report written
 * in bullet points does not read like one a person wrote.
 */
export function reportInstructions(disciplineId: string): string {
  const adjective = disciplineAdjective(disciplineId)

  return `Sos asistente de un/a profesional de ${adjective} en Uruguay. Escribís el CUERPO de un informe clínico en español rioplatense: claro, cálido y profesional.

Estructurá el texto en estas secciones, en este orden y sólo las que correspondan según los datos: Motivo de consulta, Objetivos del período, Avances observados, Aspectos a continuar, Recomendaciones.

Cada subtítulo va en su propia línea, corto y terminado en dos puntos, seguido de un párrafo en prosa. No uses viñetas, guiones ni asteriscos de markdown.

No pongas encabezado, datos del paciente ni firma: eso lo agrega el documento.`
}

export function reportUserPrompt({
  context,
  recipient,
  disciplineId,
  practitionerNotes,
  adjustment,
}: {
  context: ReportContext
  recipient: RecipientId
  disciplineId: string
  practitionerNotes?: string | null
  adjustment?: string | null
}): string {
  const tone = recipientTone(recipient, {
    patientName: context.patientName,
    patientFirstName: context.patientFirstName,
    age: context.age,
    disciplineAdjective: disciplineAdjective(disciplineId),
  })

  const goals =
    context.goals.length > 0
      ? context.goals.map((goal) => `${goal.title} (${goal.progress}%)`).join('; ')
      : 'sin objetivos cargados'

  const notes =
    context.recentNotes.length > 0
      ? context.recentNotes.join(' | ')
      : 'sin notas de sesión cargadas'

  const parts = [
    `Redactá el cuerpo de un "${tone.title}" dirigido a: ${tone.greeting}.`,
    `Empezá con "${tone.greeting}:" y una apertura equivalente a: ${tone.opening}`,
    `Cerrá con algo equivalente a: ${tone.closing}`,
    '',
    'Contexto del paciente:',
    `Nombre: ${context.patientName} (${context.age}).`,
    `Motivo de consulta: ${context.referralReason || 'no consignado'}.`,
    `Inicio del tratamiento: ${context.startDate || 'no consignado'}.`,
    `Sesiones registradas: ${context.sessionCount}.`,
    `Objetivos y avance: ${goals}.`,
    `Notas de las últimas sesiones: ${notes}`,
  ]

  if (practitionerNotes?.trim()) {
    parts.push(
      '',
      `Notas de la profesional para este informe (tenelas muy en cuenta): ${practitionerNotes.trim()}`,
    )
  }

  if (adjustment?.trim()) {
    parts.push('', `Ajuste solicitado por el/la profesional (respetalo): ${adjustment.trim()}`)
  }

  return parts.join('\n')
}

/**
 * The draft used when the AI is unavailable.
 *
 * v1 always produced this and only then tried to improve it with AI, which was
 * the right instinct: a practitioner who opened the screen got *something* to
 * edit either way. An outage should cost polish, not the whole document.
 *
 * Plain text with the same section headings the model is asked for, so the two
 * paths produce the same shape and the editor does not need to know which one
 * ran.
 */
export function reportFallback({
  context,
  recipient,
  disciplineId,
}: {
  context: ReportContext
  recipient: RecipientId
  disciplineId: string
}): string {
  const tone = recipientTone(recipient, {
    patientName: context.patientName,
    patientFirstName: context.patientFirstName,
    age: context.age,
    disciplineAdjective: disciplineAdjective(disciplineId),
  })

  const lines: string[] = [`${tone.greeting}:`, '', tone.opening, '']

  if (context.referralReason) {
    lines.push('Motivo de consulta:', context.referralReason, '')
  }

  if (context.goals.length > 0) {
    const titles = joinEs(context.goals.map((goal) => goal.title.toLowerCase()))
    lines.push('Objetivos del período:', `Se trabajó sobre: ${titles}.`, '')

    const advancing = context.goals.filter((goal) => goal.progress >= 60)
    if (advancing.length > 0) {
      lines.push(
        'Avances observados:',
        `Se observan avances en ${joinEs(advancing.map((goal) => goal.title.toLowerCase()))}.`,
        '',
      )
    }

    const pending = context.goals.filter((goal) => goal.progress < 50)
    if (pending.length > 0) {
      lines.push(
        'Aspectos a continuar:',
        `Se continúa trabajando en ${joinEs(pending.map((goal) => goal.title.toLowerCase()))}.`,
        '',
      )
    }
  }

  lines.push(
    'Recomendaciones:',
    'Se recomienda la continuidad de la intervención con la frecuencia actual.',
    '',
    tone.closing,
  )

  return lines.join('\n')
}
