import { ageLabel } from '@/lib/age'
import { disciplineLabel } from '@/lib/disciplines'

import { getDb } from './db'

/**
 * "Preguntale a Hilo" — the in-app assistant.
 *
 * v1's `chatSend` (`legacy/index.html:2590`), with its offline `chatReply`
 * (`legacy/index.html:2561`) kept as the fallback rather than thrown away: when
 * the AI is unreachable the practitioner still gets a real answer about their
 * own data, because the useful half of these questions is arithmetic over rows
 * this app already has.
 *
 * ─── What is sent to Anthropic ─────────────────────────────────────────────
 *
 * The roster only: patient first names, ages, average progress, and goal titles
 * with their percentages. **Not the session notes.**
 *
 * v1 sent the last progress note of every patient on every question. That is a
 * copy of clinical text about every person on someone's caseload leaving the
 * country because they typed "hola" — and it buys very little, because the
 * questions this box answers ("what should I work on with Tomás", "how is
 * everyone doing") are answered by the goals. The report and assessment flows
 * do send notes, for one named patient, when the practitioner has asked for a
 * document about that patient. That is a decision they made about one person;
 * this box is not.
 */

export type AssistantPatient = {
  id: string
  fullName: string
  firstName: string
  age: string | null
  averageProgress: number
  goals: { title: string; progress: number }[]
}

export type AssistantContext = {
  discipline: string
  patients: AssistantPatient[]
  sessionsToday: { firstName: string; startTime: string }[]
  pendingBookings: number
}

/** Everything the assistant is allowed to know, read through the session. */
export async function gatherAssistantContext(
  practitionerId: string,
  discipline: string,
  today: string,
): Promise<AssistantContext> {
  const db = await getDb()

  const [{ data: patients }, { data: goals }, { data: appointments }, { count }] =
    await Promise.all([
      db
        .from('patients')
        .select('id, full_name, date_of_birth')
        .eq('practitioner_id', practitionerId)
        .is('deleted_at', null)
        .is('archived_at', null)
        .order('full_name'),
      db
        .from('goals')
        .select('patient_id, title, progress')
        .eq('practitioner_id', practitionerId)
        .eq('is_active', true)
        .order('position'),
      db
        .from('appointments')
        .select('start_time, patients (full_name)')
        .eq('practitioner_id', practitionerId)
        .eq('scheduled_on', today)
        .neq('status', 'cancelled')
        .order('start_time'),
      db
        .from('booking_requests')
        .select('id', { count: 'exact', head: true })
        .eq('practitioner_id', practitionerId)
        .eq('status', 'pending'),
    ])

  const goalsByPatient = new Map<string, { title: string; progress: number }[]>()
  for (const goal of goals ?? []) {
    const list = goalsByPatient.get(goal.patient_id)
    const entry = { title: goal.title, progress: goal.progress }
    if (list) list.push(entry)
    else goalsByPatient.set(goal.patient_id, [entry])
  }

  return {
    discipline: disciplineLabel(discipline),
    patients: (patients ?? []).map((patient) => {
      const own = goalsByPatient.get(patient.id) ?? []
      return {
        id: patient.id,
        fullName: patient.full_name,
        firstName: firstName(patient.full_name),
        age: ageLabel(patient.date_of_birth),
        averageProgress: average(own.map((goal) => goal.progress)),
        goals: own,
      }
    }),
    sessionsToday: (appointments ?? []).map((appointment) => ({
      firstName: firstName(appointment.patients?.full_name ?? ''),
      startTime: (appointment.start_time ?? '').slice(0, 5),
    })),
    pendingBookings: count ?? 0,
  }
}

/**
 * The system prompt, transcribed from v1 (`legacy/index.html:2594`).
 *
 * Its three rules are the ones that matter and they are the same as the report
 * prompt's: do not invent a patient, say so when one is not in the context, keep
 * it short. The clinical instruction block in `ai.ts` is prepended to this by
 * `streamCompletion` and carries the rest.
 */
export function assistantInstructions(discipline: string): string {
  return [
    `Sos Hilo, copiloto clínico de un/a profesional de ${discipline} en Uruguay.`,
    'Respondés en español rioplatense, usando "vos", claro y cálido, sin rodeos.',
    'Podés dar orientación clínica general y sugerencias de trabajo.',
    'No inventás datos de pacientes que no estén en el contexto: si te preguntan por alguien que no aparece, decilo.',
    'No hacés diagnósticos cerrados y no afirmás resultados que no estén en los datos.',
    'Respuestas breves: dos o tres frases, salvo que te pidan más.',
    'Escribís en texto plano, sin markdown ni viñetas.',
  ].join(' ')
}

/** The roster, as text. */
export function assistantUserPrompt(context: AssistantContext, question: string): string {
  const roster = context.patients.length
    ? context.patients
        .map((patient) => {
          const goals = patient.goals.length
            ? patient.goals.map((goal) => `${goal.title} ${goal.progress}%`).join('; ')
            : 'sin objetivos cargados'
          return `- ${patient.fullName} (${patient.age ?? 'edad s/d'}): avance ${patient.averageProgress}%. Objetivos: ${goals}`
        })
        .join('\n')
    : '(todavía sin pacientes)'

  const agenda = context.sessionsToday.length
    ? context.sessionsToday
        .map((session) => `${session.firstName} ${session.startTime}`)
        .join(', ')
    : 'sin sesiones agendadas'

  return [
    `Mis pacientes:\n${roster}`,
    `Hoy: ${agenda}.`,
    `Reservas pendientes de responder: ${context.pendingBookings}.`,
    `Consulta: ${question}`,
  ].join('\n\n')
}

/**
 * The answer when there is no AI — a key that is not configured, an outage, an
 * exhausted quota.
 *
 * This is v1's `chatReply`, kept deliberately. It is a handful of regular
 * expressions over the practitioner's own data, and for the most common
 * questions it answers as well as the model does, instantly and for free. A box
 * that says "no pude responder" is worse than one that says how Tomás is doing.
 */
export function offlineAnswer(context: AssistantContext, question: string): string {
  const asked = normalise(question)

  const named = context.patients.find((patient) =>
    asked.includes(normalise(patient.firstName)),
  )

  if (named) {
    if (named.goals.length === 0) {
      return `${named.fullName} todavía no tiene objetivos cargados. Hacé una evaluación y te ayudo a plantearlos.`
    }

    const weakest = named.goals.reduce((lowest, goal) =>
      goal.progress < lowest.progress ? goal : lowest,
    )

    return `${named.fullName}${named.age ? ` (${named.age})` : ''} va por un ${named.averageProgress}% de avance hacia sus objetivos. Lo que menos se movió es "${weakest.title}", en ${weakest.progress}%. Yo arrancaría por ahí en la próxima.`
  }

  if (/(^|\s)(hola|buenas|buen dia|buenos dias|que tal|hey)/.test(asked)) {
    return 'Hola. ¿Sobre qué paciente querés saber? Nombrame a alguno, o preguntame por la agenda, los materiales o una evaluación.'
  }

  if (/(gracias|genial|barbaro|buenisimo|perfecto|dale)/.test(asked)) {
    return '¡De nada! Cualquier cosa, acá estoy.'
  }

  if (/(agenda|turno|hoy|manana|semana|cuando)/.test(asked)) {
    return context.sessionsToday.length
      ? `Hoy tenés ${context.sessionsToday.length} ${plural(context.sessionsToday.length, 'sesión', 'sesiones')}: ${context.sessionsToday.map((session) => `${session.firstName} ${session.startTime}`).join(', ')}. En Agenda las ves en la grilla de la semana.`
      : 'Hoy no tenés sesiones agendadas. En Agenda ves la semana entera y podés cargar una.'
  }

  if (/(material|actividad|ejercicio|ficha|imprim|planific)/.test(asked)) {
    return 'En Materiales tenés la biblioteca completa, y en Planificación te armo cada sesión con el objetivo más atrasado y un material para trabajarlo.'
  }

  if (/(informe|reporte)/.test(asked)) {
    return 'En Informes tocás "Nuevo informe", elegís el paciente y para quién es (colegio, familia o mutualista), y se arma con lo que Hilo ya sabe. Vos lo editás y lo firmás.'
  }

  if (/(evalua|test|puntaje|interpret|wisc|bender|prolec|analisis)/.test(asked)) {
    return 'En la ficha del paciente cargás una evaluación con sus puntajes y te armo el borrador del análisis para que lo edites.'
  }

  // `pag`, not `pago`: "¿a quién le falta pagar?" is one of the quick chips and
  // the narrower stem missed it entirely.
  if (/(cobro|pag|factura|plata|dinero|deb)/.test(asked)) {
    return 'En Cobros ves quién está al día y quién debe, mes a mes, y podés mandar el link de pago por WhatsApp.'
  }

  if (/(estadistica|metrica|numero|dato|cuanto)/.test(asked)) {
    return 'En Estadísticas tenés tus números: pacientes activos, sesiones del mes, avance promedio y en qué objetivos trabajaste más.'
  }

  if (/(reserva|turno nuevo|paciente nuevo|consulta)/.test(asked) && context.pendingBookings) {
    return `Tenés ${context.pendingBookings} ${plural(context.pendingBookings, 'reserva', 'reservas')} sin responder en Reservas.`
  }

  return context.patients.length
    ? `Puedo contarte cómo viene cada paciente y qué trabajar en la próxima sesión. Tus pacientes son: ${context.patients.map((patient) => patient.firstName).join(', ')}. Nombrame a alguno, o preguntame por la agenda, los materiales o una evaluación.`
    : 'Todavía no tenés pacientes cargados. Agregá el primero y te cuento cómo viene, qué trabajar y con qué material.'
}

/**
 * One row, so the question counts against the monthly quota.
 *
 * Written *before* the Anthropic call, like every other quota in this codebase —
 * counting after is a bill for something the practitioner was not allowed to
 * have, and it is what lets a burst of parallel questions walk past the limit.
 */
export async function recordQuestion(practitionerId: string): Promise<string | null> {
  const db = await getDb()

  const { data, error } = await db
    .from('assistant_questions')
    .insert({ practitioner_id: practitionerId })
    .select('id')
    .single()

  if (error) throw error
  return data?.id ?? null
}

/**
 * Give the question back when Anthropic produced nothing.
 *
 * The count has to be taken before the call, but a question that fell through to
 * `offlineAnswer` did not cost one — and with no API key configured *every*
 * question would fall through, so a practitioner would burn a month's allowance
 * on answers this app computed itself. Released only when nothing arrived: a
 * truncated answer is still an answer and still cost tokens.
 *
 * Returns the release *function* rather than doing the work, and resolves the
 * database client now, because the caller runs it from inside a stream — after
 * the response has been returned and the request scope that owns the session
 * cookie is gone.
 */
export async function questionReleaser(
  practitionerId: string,
  questionId: string | null,
): Promise<() => Promise<void>> {
  if (!questionId) return async () => {}

  const db = await getDb()

  return async () => {
    const { error } = await db
      .from('assistant_questions')
      .delete()
      .eq('id', questionId)
      .eq('practitioner_id', practitionerId)

    if (error) console.error('[assistant] no se pudo devolver la pregunta', { questionId, error })
  }
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/** Lowercase, accents stripped, so "sesión" matches "sesion". */
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}
