import { toDateInput } from '@/lib/dates'
import { currentPeriod } from '@/lib/periods'

import { listAppointments } from './appointments'
import { getDb } from './db'
import { bestMaterialFor, listMaterials, type Material } from './materials'
import { monthlyLedger } from './payments'

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
   * What this session is for: the goal chosen in "Plan de la semana", or the one
   * that has moved least. Null when the patient has no goals yet.
   */
  focus: { id: string; title: string; progress: number } | null
  /** True when `focus` was picked deliberately rather than suggested. */
  focusChosen: boolean
  suggestedMaterial: Material | null
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
  const until = new Date()
  until.setDate(until.getDate() + days)

  return planForRange(practitionerId, discipline, toDateInput(new Date()), toDateInput(until))
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
): Promise<PlannedSession[]> {
  const [appointments, materials] = await Promise.all([
    listAppointments(practitionerId, from, to),
    listMaterials(practitionerId, { discipline }),
  ])

  const upcoming = appointments.filter(
    (appointment) => appointment.status !== 'cancelled' && appointment.patients,
  )
  if (upcoming.length === 0) return []

  const db = await getDb()
  const { data: goals } = await db
    .from('goals')
    .select('id, patient_id, title, progress')
    .eq('practitioner_id', practitionerId)
    .eq('is_active', true)
    .in('patient_id', [...new Set(upcoming.map((appointment) => appointment.patient_id))])
    .order('position')

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

    // A choice made in "Plan de la semana" wins over the suggestion. v1's
    // default was the lowest-scoring goal and it came back on every reload
    // because nothing was stored; here the suggestion is only what you get
    // until you decide otherwise.
    const chosen = appointment.focus_goal_id
      ? (own.find((goal) => goal.id === appointment.focus_goal_id) ?? null)
      : null
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
 * open Hilo between two patients: what happened last time, which goal has moved
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
  const today = toDateInput(new Date())
  const planned = (await planUpcoming(practitionerId, discipline, 0)).filter(
    (session) => session.scheduledOn === today,
  )
  if (planned.length === 0) return []

  const patientIds = [...new Set(planned.map((session) => session.patientId))]
  const db = await getDb()

  const [{ data: notes }, ledger] = await Promise.all([
    db
      .from('sessions')
      .select('patient_id, held_on, progress_note')
      .eq('practitioner_id', practitionerId)
      .in('patient_id', patientIds)
      .not('progress_note', 'is', null)
      .lt('held_on', today)
      .order('held_on', { ascending: false }),
    monthlyLedger(practitionerId, currentPeriod()),
  ])

  // The query is ordered newest first, so the first note seen for a patient is
  // the one to keep.
  const lastNote = new Map<string, string>()
  for (const note of notes ?? []) {
    if (note.progress_note && !lastNote.has(note.patient_id)) {
      lastNote.set(note.patient_id, note.progress_note)
    }
  }

  const owes = new Map(
    ledger.rows.map((row) => [row.patientId, (row.outstanding ?? 0) > 0]),
  )

  return planned.map((session) => {
    const alerts: TodaySession['alerts'] = []

    const stalled = session.goals.find((goal) => goal.progress < STALLED_BELOW)
    if (stalled) alerts.push({ kind: 'goal', text: `${stalled.title} viene lento` })

    if (owes.get(session.patientId)) alerts.push({ kind: 'payment', text: 'pago pendiente' })

    return { ...session, lastNote: lastNote.get(session.patientId) ?? null, alerts }
  })
}
