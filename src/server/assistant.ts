import { ageLabel } from '@/lib/age'
import { disciplineLabel } from '@/lib/disciplines'

import type { ChatMessage } from './ai'
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
 *
 * ─── And the conversation ──────────────────────────────────────────────────
 *
 * This is a thread, so the turns before the current question travel with it —
 * that is what makes "¿y con Malena?" mean anything. It is a real cost and it
 * was chosen knowing it: whatever the practitioner typed earlier leaves the app
 * again on every question of the same conversation.
 *
 * Two things keep it bounded. `HISTORY_LIMIT` caps how far back goes, so an
 * afternoon of questions does not become one enormous request. And the thread
 * lives only in the browser tab — `parseHistory` reads it off the request body,
 * and nothing here writes it down. Closing the panel ends the conversation,
 * which is also the only "delete" a transcript can honestly offer.
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
 * `streamChat` and carries the rest.
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
    'Es una conversación: si la consulta se apoya en lo que ya venían hablando, seguí el hilo sin repetir lo dicho.',
  ].join(' ')
}

/** The roster, as text. */
export function assistantRoster(context: AssistantContext): string {
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
    `Sus pacientes:\n${roster}`,
    `Hoy: ${agenda}.`,
    `Reservas pendientes de responder: ${context.pendingBookings}.`,
  ].join('\n\n')
}

/**
 * Who Hilo is, and then the roster.
 *
 * The roster sits in the system prompt rather than inside the question, and that
 * is what makes a thread affordable: it travels once per request instead of once
 * per turn, and it is always today's — the patient added ten minutes ago is in
 * the next answer, and a stale copy from four questions ago is not sitting in
 * the conversation contradicting it.
 */
export function assistantSystemPrompt(context: AssistantContext): string {
  return [assistantInstructions(context.discipline), assistantRoster(context)].join('\n\n')
}

/**
 * How much of the conversation travels: five exchanges.
 *
 * A cap, not a preference. Without one, every question of a long afternoon would
 * carry every question before it — a request that grows without bound, costs
 * more each time, and sends the same clinical sentence out again on its
 * fortieth trip. Five is enough for "¿y con Malena?" to mean something, which is
 * the whole reason the thread exists.
 */
export const HISTORY_LIMIT = 10

/** One turn cannot be longer than this. Questions are capped at 500 by the route. */
const TURN_LIMIT = 2_000

/**
 * The conversation as the browser sent it, made safe to forward.
 *
 * The thread lives in the tab, so this arrives in the request body like any
 * other user input: it is not trusted, and none of it is treated as an
 * instruction — it is just the previous turns of the same box. What comes out
 * starts with the practitioner and alternates strictly, because that is the
 * shape the API takes and because a forged or half-written body should cost a
 * dropped turn rather than a 400 in the middle of a question.
 */
export function parseHistory(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return []

  const turns: ChatMessage[] = []

  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue

    const { role, content } = entry as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') continue
    if (typeof content !== 'string') continue

    const text = content.trim().slice(0, TURN_LIMIT)
    if (!text) continue
    if (role !== (turns.length % 2 === 0 ? 'user' : 'assistant')) continue

    turns.push({ role, content: text })
  }

  // A question whose answer is missing is the tail of a request that failed. It
  // goes, so the new question is not the second `user` turn in a row.
  if (turns.length % 2 === 1) turns.pop()

  return turns.slice(-HISTORY_LIMIT)
}

/** The turns that travel, oldest first, with the new question last. */
export function assistantMessages(history: ChatMessage[], question: string): ChatMessage[] {
  return [...history, { role: 'user' as const, content: question }]
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
