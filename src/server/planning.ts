import { today, toDateInput, todayDate } from '@/lib/dates'
import { currentPeriod } from '@/lib/periods'

import { listAppointments } from './appointments'
import { getDb } from './db'
import { listMaterials, type MaterialSummary } from './materials'
import { bestMaterialFor } from './material-matching'
import { monthlyLedger } from './payments'
import { plansForAppointments, type PlanLine } from './session-plans'

/**
 * The session planner.
 *
 * v1's "Planificación" screen, and the idea behind it is the good one: for each
 * session coming up, show the goal that is furthest behind and a material that
 * fits it. A practitioner arriving at a session already knows their patient;
 * what they do not have is thirty seconds to remember which of six goals has not
 * moved since April.
 *
 * The lowest-progress goal is the suggestion, not an instruction. It appears
 * beside the others so it can be ignored.
 */

export type PlannedSession = {
  appointmentId: string
  patientId: string
  patientName: string
  patientColor: string | null
  scheduledOn: string
  startTime: string
  /** 'attended' | 'no_show' | 'cancelled' | 'scheduled'. */
  status: string
  goals: { id: string; title: string; progress: number }[]
  /**
   * What is prepared for this session in Planificación — the same rows the
   * planner writes (P14). Empty when nothing is.
   */
  plan: PlanLine[]
  /**
   * What this session is for: the first goal in its plan; failing that, the goal
   * picked in the old "Plan de la semana" selector; failing that, the one that
   * has moved least. Null when the patient has no goals yet.
   */
  focus: { id: string; title: string; progress: number } | null
  /** True when `focus` was decided — by the plan or the old selector — rather than suggested. */
  focusChosen: boolean
  suggestedMaterial: MaterialSummary | null
}

/**
 * The next `days` of appointments, each with its suggested focus.
 *
 * Cancelled ones are left out — there is nothing to plan for a session that is
 * not happening — but a "no vino" from earlier today stays, because the goal
 * still has not been worked.
 */
export async function planUpcoming(
  practitionerId: string,
  discipline: string,
  days = 7,
): Promise<PlannedSession[]> {
  const until = todayDate()
  until.setDate(until.getDate() + days)

  return planForRange(practitionerId, discipline, today(), toDateInput(until))
}

/**
 * The same thing for an arbitrary week — what "Plan de la semana" under the
 * agenda grid needs, because that grid pages backwards and forwards and is not
 * anchored to today.
 */
export async function planForRange(
  practitionerId: string,
  discipline: string,
  from: string,
  to: string,
  /**
   * The same rows, when the caller already has them. The Agenda loads the week's
   * appointments to draw the grid and then asks for this panel over the same
   * range — without this it fetched them a second time, on every load, for every
   * practitioner.
   */
  known?: Awaited<ReturnType<typeof listAppointments>>,
): Promise<PlannedSession[]> {
  const [appointments, materials] = await Promise.all([
    known ?? listAppointments(practitionerId, from, to),
    listMaterials(practitionerId, { discipline }),
  ])

  const upcoming = appointments.filter(
    (appointment) => appointment.status !== 'cancelled' && appointment.patients,
  )
  if (upcoming.length === 0) return []

  const db = await getDb()
  const [{ data: goals }, plans] = await Promise.all([
    db
      .from('goals')
      .select('id, patient_id, title, progress')
      .eq('practitioner_id', practitionerId)
      .eq('is_active', true)
      .in('patient_id', [...new Set(upcoming.map((appointment) => appointment.patient_id))])
      .order('position'),
    plansForAppointments(practitionerId, upcoming),
  ])

  const goalsByPatient = new Map<string, { id: string; title: string; progress: number }[]>()
  for (const goal of goals ?? []) {
    const list = goalsByPatient.get(goal.patient_id)
    const entry = { id: goal.id, title: goal.title, progress: goal.progress }
    if (list) list.push(entry)
    else goalsByPatient.set(goal.patient_id, [entry])
  }

  return upcoming.map((appointment) => {
    const own = goalsByPatient.get(appointment.patient_id) ?? []
    // A goal already at 100 is finished; suggesting it would be busywork.
    const candidates = own.filter((goal) => goal.progress < 100)
    const suggested =
      candidates.length === 0
        ? null
        : candidates.reduce((lowest, goal) =>
            goal.progress < lowest.progress ? goal : lowest,
          )

    // What was prepared decides what the session is for (P14): the first goal
    // in its plan. Before plans had a session, "Plan de la semana" kept its own
    // pick in `focus_goal_id`; the selector that wrote it is hidden now, but a
    // pick already made still counts until a plan says otherwise. The
    // suggestion is only what you get until you decide.
    const plan = plans.get(appointment.id) ?? []
    const planned =
      plan
        .map((line) => own.find((goal) => goal.id === line.goalId))
        .find((goal) => goal !== undefined) ?? null
    const picked = appointment.focus_goal_id
      ? (own.find((goal) => goal.id === appointment.focus_goal_id) ?? null)
      : null
    const chosen = planned ?? picked
    const focus = chosen ?? suggested

    return {
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      patientName: appointment.patients!.full_name,
      patientColor: appointment.patients!.color,
      scheduledOn: appointment.scheduled_on,
      startTime: appointment.start_time,
      status: appointment.status,
      goals: own,
      plan,
      focus,
      focusChosen: chosen !== null,
      suggestedMaterial: focus ? bestMaterialFor(focus.title, materials) : null,
    }
  })
}

/**
 * Which goal a session in the week is for.
 *
 * v1's "Plan de la semana" (`legacy/index.html:1498`) kept this in memory, so
 * every choice was gone on reload. The goal is re-read through the user's
 * session rather than trusted from the form: that is what makes "set the focus
 * to goal X" mean "to a goal of mine, for this patient".
 */
export async function setAppointmentFocus(
  practitionerId: string,
  appointmentId: string,
  goalId: string | null,
) {
  const db = await getDb()

  if (goalId) {
    const { data: goal, error } = await db
      .from('goals')
      .select('id')
      .eq('practitioner_id', practitionerId)
      .eq('id', goalId)
      .maybeSingle()

    if (error) throw error
    if (!goal) throw new Error('Ese objetivo no existe.')
  }

  const { error } = await db
    .from('appointments')
    .update({ focus_goal_id: goalId })
    .eq('practitioner_id', practitionerId)
    .eq('id', appointmentId)

  if (error) throw error
}

/** A goal below this has stalled, and Inicio says so. v1 used the same number. */
const STALLED_BELOW = 45

export type TodaySession = PlannedSession & {
  /** What was written after the last session with this patient, if there was one. */
  lastNote: string | null
  /** Short warnings, already worded. Empty is the normal case. */
  alerts: { kind: 'goal' | 'payment'; text: string }[]
}

/**
 * Today's sessions, each with everything you would want to remember walking
 * into the room.
 *
 * This is v1's home screen (`legacy/index.html:1088-1101`) and the reason to
 * open Ombúa between two patients: what happened last time, which goal has moved
 * least, and anything that needs saying — a goal that has stalled, a month that
 * has not been paid. v2's home listed a name and a time, which is the one thing
 * a practitioner already knows.
 *
 * It is one function rather than four calls from the page because the page must
 * not query: `CLAUDE.md` keeps every read in `src/server/`, and the alerts are a
 * rule about the practice, not a detail of layout.
 */
export async function todayBriefing(
  practitionerId: string,
  discipline: string,
): Promise<TodaySession[]> {
  const todayInUruguay = today()
  // The ledger does not depend on the plan, so it is asked for at the same time
  // instead of after it. On a day with nothing scheduled it is one query wasted;
  // on every other day it is one round trip fewer before Inicio can draw.
  const [upcoming, ledger] = await Promise.all([
    planUpcoming(practitionerId, discipline, 0),
    monthlyLedger(practitionerId, currentPeriod()),
  ])
  const planned = upcoming.filter((session) => session.scheduledOn === todayInUruguay)
  if (planned.length === 0) return []

  const patientIds = [...new Set(planned.map((session) => session.patientId))]
  const db = await getDb()

  // The newest note of each of today's patients: one row each, in parallel. It
  // used to be every note they ever had, paged 500 at a time, to keep the first
  // one of each — a patient a year in brought fifty notes to show one line.
  //
  // `today` iba sin llamar: PostgREST recibía el código de la función como
  // fecha, contestaba error, y `data ?? []` lo leía como "sin notas". La última
  // nota no apareció nunca. Ahora la fecha va bien y un error se dice.
  const notes = await Promise.all(
    patientIds.map(async (patientId) => {
      const { data, error } = await db
        .from('sessions')
        .select('patient_id, progress_note')
        .eq('practitioner_id', practitionerId)
        .eq('patient_id', patientId)
        .not('progress_note', 'is', null)
        .lt('held_on', todayInUruguay)
        .order('held_on', { ascending: false })
        .order('id')
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    }),
  )

  const lastNote = new Map<string, string>()
  for (const note of notes) {
    if (note?.progress_note) lastNote.set(note.patient_id, note.progress_note)
  }

  const owes = new Map(
    ledger.rows.map((row) => [row.patientId, (row.outstanding ?? 0) > 0]),
  )

  return planned.map((session) => {
    const alerts: TodaySession['alerts'] = []

    // Not the one "Para hoy" already names: the card said "priorizar X" and,
    // right under it, "X viene lento" — the same goal twice in two colours.
    // The alert is for a second goal that is also stuck.
    const stalled = session.goals.find(
      (goal) => goal.progress < STALLED_BELOW && goal.title !== session.focus?.title,
    )
    if (stalled) alerts.push({ kind: 'goal', text: `${stalled.title} viene lento` })

    if (owes.get(session.patientId)) alerts.push({ kind: 'payment', text: 'pago pendiente' })

    return { ...session, lastNote: lastNote.get(session.patientId) ?? null, alerts }
  })
}
