import { z } from 'zod'

import { suggestedActivity } from '@/lib/activity-bank'

import { nextAppointmentFor, nextAppointments } from './appointments'
import { getDb } from './db'
import {
  bestMaterialFor,
  listMaterials,
  topMaterialsFor,
  type Material,
  type MaterialSummary,
} from './materials'

/**
 * What is prepared for a session.
 *
 * v1's "Planificar sesión" (`legacy/index.html:2855`), which is the half of
 * Planificación the rewrite dropped. The rewrite put a read-only list of the
 * coming week in its place — useful, but a different thing: it told you what was
 * ahead and gave you nothing to do about it.
 *
 * The idea worth keeping is that planning is the part of this job that takes the
 * longest, and almost all of it is deciding. So: the goals that have moved least
 * are already sorted and each has a suggested activity and a matched material,
 * one click adds it, and what you assemble persists until you register the
 * session.
 *
 * Nothing here is automatic. Hilo proposes an order; the practitioner builds the
 * list.
 */

export type PlanItem = {
  id: string
  title: string | null
  position: number
  goalId: string | null
  material: Pick<Material, 'id' | 'title' | 'area' | 'focus'> | null
}

// ─── Which session a plan is for ────────────────────────────────────────────
//
// A plan is for one session in the agenda (P14). It used to be one list per
// patient, and "Plan de la semana" in the Agenda kept a separate goal per
// appointment; the two never saw each other. The rule that joins them:
//
//   - A row tied to a session (`appointment_id`) belongs to that session.
//   - A row tied to none belongs to the patient's **next** session. Those are the
//     rows prepared before plans had a session, and the ones prepared for a
//     patient with nothing scheduled yet. Once there is a next session they are
//     for it, which is what "Próxima sesión de Tomás" always meant.
//
// It is written twice, and the two must agree: `scopeFilter` says it to Postgres
// for one patient, `belongsTo` says it to rows already in memory for many. The
// tests in `session-plans.test.ts` hold them to the same cases.

type Scope = {
  /** The session, or `null` for a patient with nothing scheduled. */
  appointmentId: string | null
  /** Whether rows with no session count: only for the patient's next one. */
  includesLoose: boolean
}

const AppointmentId = z.uuid()

/**
 * The scope of "the plan" for a patient's session.
 *
 * `appointmentId` left out means the next session, which is what every screen
 * that only knows the patient — the ficha, "Sumar a la sesión" from a material —
 * means by "the plan".
 */
async function scopeFor(
  practitionerId: string,
  patientId: string,
  appointmentId?: string | null,
): Promise<Scope> {
  const next = await nextAppointmentFor(practitionerId, patientId)
  const target =
    appointmentId === undefined
      ? (next?.id ?? null)
      : appointmentId === null
        ? null
        : // Validated because it goes into a PostgREST filter string below.
          AppointmentId.parse(appointmentId)

  return { appointmentId: target, includesLoose: target === null || target === next?.id }
}

function scopeFilter(scope: Scope) {
  if (!scope.appointmentId) return 'appointment_id.is.null'
  const own = `appointment_id.eq.${scope.appointmentId}`
  return scope.includesLoose ? `${own},appointment_id.is.null` : own
}

/** `scopeFilter`'s rule, for rows already loaded. */
function belongsTo(
  row: { appointment_id: string | null },
  appointmentId: string,
  nextOfPatient: string | undefined,
) {
  return (
    row.appointment_id === appointmentId ||
    (row.appointment_id === null && nextOfPatient === appointmentId)
  )
}

/**
 * What is planned for one of a patient's sessions, in the order it will be
 * worked. Without `appointmentId`, the next session's.
 */
export async function listPlanItems(
  practitionerId: string,
  patientId: string,
  appointmentId?: string | null,
): Promise<PlanItem[]> {
  const scope = await scopeFor(practitionerId, patientId, appointmentId)
  const db = await getDb()

  const { data, error } = await db
    .from('session_plan_items')
    .select('id, title, position, goal_id, materials (id, title, area, focus)')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .or(scopeFilter(scope))
    .order('position')
    .order('created_at')

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    position: row.position,
    goalId: row.goal_id,
    material: row.materials ?? null,
  }))
}

/** One line of a plan, as the Agenda and Inicio show it. */
export type PlanLine = { goalId: string | null; title: string }

/**
 * The plan of each of these sessions, in two queries rather than one per row.
 *
 * What "Plan de la semana" and Inicio read: the same rows the planner writes, so
 * preparing a session in Planificación is what the Agenda shows for it.
 */
export async function plansForAppointments(
  practitionerId: string,
  appointments: { id: string; patient_id: string }[],
): Promise<Map<string, PlanLine[]>> {
  const plans = new Map<string, PlanLine[]>()
  if (appointments.length === 0) return plans

  const patientIds = [...new Set(appointments.map((appointment) => appointment.patient_id))]
  const db = await getDb()

  const [{ data: rows, error }, next] = await Promise.all([
    db
      .from('session_plan_items')
      .select('patient_id, appointment_id, goal_id, title, materials (title)')
      .eq('practitioner_id', practitionerId)
      .in('patient_id', patientIds)
      .order('position')
      .order('created_at'),
    nextAppointments(practitionerId, patientIds),
  ])

  if (error) throw error

  for (const appointment of appointments) {
    const nextId = next.get(appointment.patient_id)?.id
    plans.set(
      appointment.id,
      (rows ?? [])
        .filter(
          (row) =>
            row.patient_id === appointment.patient_id &&
            belongsTo(row, appointment.id, nextId),
        )
        .map((row) => ({
          goalId: row.goal_id,
          title: row.title ?? row.materials?.title ?? 'Actividad',
        })),
    )
  }

  return plans
}

export type PreparedPlan = {
  patientId: string
  fullName: string
  color: string | null
  /** The session it is for, or `null` when the patient has none scheduled. */
  appointment: { id: string; scheduledOn: string; startTime: string } | null
  items: string[]
}

/**
 * Every session with something prepared, soonest first.
 *
 * A plan was reachable from exactly two places: the planner, if you happened to
 * have that patient selected, and that patient's own ficha. Neither answers the
 * question you actually have on Tuesday morning — "what did I leave ready?" —
 * and a plan you have to remember you made is one you re-make from memory.
 *
 * Grouped by session, not by patient: two sessions of the same child in one
 * week are two plans. Rows with no session join the patient's next one, by the
 * rule at the top of this file; a patient with nothing scheduled goes last.
 */
export async function upcomingPlans(practitionerId: string): Promise<PreparedPlan[]> {
  const db = await getDb()

  const { data, error } = await db
    .from('session_plan_items')
    .select(
      'patient_id, appointment_id, title, position, patients (id, full_name, color), materials (title), appointments (id, scheduled_on, start_time)',
    )
    .eq('practitioner_id', practitionerId)
    .order('position')
    .order('created_at')

  if (error) throw error

  const rows = (data ?? []).filter((row) => row.patients)
  const next = await nextAppointments(practitionerId, [
    ...new Set(rows.map((row) => row.patient_id)),
  ])

  const plans = new Map<string, PreparedPlan>()

  for (const row of rows) {
    const session = row.appointments ?? next.get(row.patient_id) ?? null
    const key = `${row.patient_id}:${session?.id ?? 'none'}`

    const entry = plans.get(key) ?? {
      patientId: row.patient_id,
      fullName: row.patients!.full_name,
      color: row.patients!.color,
      appointment: session
        ? { id: session.id, scheduledOn: session.scheduled_on, startTime: session.start_time }
        : null,
      items: [],
    }
    entry.items.push(row.title ?? row.materials?.title ?? 'Actividad')
    plans.set(key, entry)
  }

  const when = (plan: PreparedPlan) =>
    plan.appointment ? `${plan.appointment.scheduledOn} ${plan.appointment.startTime}` : '~'

  return [...plans.values()].sort(
    (a, b) => when(a).localeCompare(when(b)) || a.fullName.localeCompare(b.fullName, 'es'),
  )
}

export type PlanSuggestion = {
  goalId: string
  title: string
  progress: number
  /** What to actually do about it, from v1's activity bank. */
  activity: string
  /**
   * The materials that fit this goal, best first — up to three.
   *
   * It used to be one. One is an answer, and an answer you did not ask for is
   * either right or useless; three is a choice, which is what a practitioner is
   * actually making at this point. Empty when nothing in the library scores.
   */
  materials: MaterialSummary[]
  /** True when this goal is already in the plan, so the button says "Agregado". */
  added: boolean
}

/**
 * The goals to work on next, worst first, each with a suggestion.
 *
 * v1 sorted every active goal by progress ascending and showed all of them —
 * not a top three. A practitioner scanning their own patient's goals wants the
 * whole list in a useful order, and truncating it would hide exactly the goal
 * that has not moved since April.
 */
export async function planSuggestions(
  practitionerId: string,
  patientId: string,
  discipline: string,
  appointmentId?: string | null,
): Promise<PlanSuggestion[]> {
  const db = await getDb()

  const [{ data: goals, error }, materials, items] = await Promise.all([
    db
      .from('goals')
      .select('id, title, progress')
      .eq('practitioner_id', practitionerId)
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('progress'),
    listMaterials(practitionerId, { discipline }),
    listPlanItems(practitionerId, patientId, appointmentId),
  ])

  if (error) throw error

  const already = new Set(items.map((item) => item.goalId).filter(Boolean))

  return (goals ?? []).map((goal) => ({
    goalId: goal.id,
    title: goal.title,
    progress: goal.progress,
    activity: suggestedActivity(goal.title),
    materials: topMaterialsFor(goal.title, materials, 3),
    added: already.has(goal.id),
  }))
}

/** Where the next item goes: after everything already there. */
async function nextPosition(practitionerId: string, patientId: string): Promise<number> {
  const db = await getDb()

  const { data } = await db
    .from('session_plan_items')
    .select('position')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data?.position ?? -1) + 1
}

/**
 * Add a goal to a session's plan, with a material attached to it.
 *
 * `materialId` is the one the practitioner picked from the three offered. When
 * it is absent — the goal was added without choosing, or from a screen that does
 * not offer the choice — Hilo falls back to its own best match, which is what
 * this function always used to do.
 *
 * The title is copied rather than read through `goal_id` — see the migration.
 * The goal is re-read here rather than trusted from the form because a form
 * field is whatever the browser sent, and `.eq('practitioner_id', …)` is what
 * makes "add goal X" mean "add a goal that is mine". The chosen material gets
 * the same treatment for the same reason. The session needs no such read: the
 * composite foreign key refuses one that is not this patient's.
 */
export async function addGoalToPlan(
  practitionerId: string,
  patientId: string,
  goalId: string,
  discipline: string,
  materialId?: string | null,
  appointmentId?: string | null,
) {
  const db = await getDb()

  const { data: goal, error: goalError } = await db
    .from('goals')
    .select('id, title')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .eq('id', goalId)
    .maybeSingle()

  if (goalError) throw goalError
  if (!goal) throw new Error('Ese objetivo no existe.')

  let chosenId: string | null = null

  if (materialId) {
    // Through RLS, so an id from somebody else's library resolves to nothing
    // and the item is simply saved without a material.
    const { data: material } = await db
      .from('materials')
      .select('id')
      .eq('id', materialId)
      .maybeSingle()
    chosenId = material?.id ?? null
  } else {
    const materials = await listMaterials(practitionerId, { discipline })
    chosenId = bestMaterialFor(goal.title, materials)?.id ?? null
  }

  const scope = await scopeFor(practitionerId, patientId, appointmentId)

  const { error } = await db.from('session_plan_items').insert({
    practitioner_id: practitionerId,
    patient_id: patientId,
    appointment_id: scope.appointmentId,
    goal_id: goal.id,
    material_id: chosenId,
    title: goal.title,
    position: await nextPosition(practitionerId, patientId),
  })

  if (error) throw error
}

/**
 * An activity the practitioner typed, belonging to no goal and no material.
 *
 * The planner could only assemble things Hilo already knew about: a goal, or a
 * material from the library. Half of what goes into a session is neither — "el
 * juego de la oca con sílabas", "terminar la lámina de la vez pasada" — and
 * having nowhere to put it is what makes a planner feel like it is planning
 * somebody else's session.
 *
 * `session_plan_items.title` already existed for the goal copy, so this needs no
 * schema change: an item with a title and no goal and no material is exactly
 * this.
 */
export async function addActivityToPlan(
  practitionerId: string,
  patientId: string,
  title: string,
  appointmentId?: string | null,
) {
  const clean = title.trim().slice(0, 200)
  if (!clean) throw new Error('Escribí qué vas a hacer.')

  const scope = await scopeFor(practitionerId, patientId, appointmentId)
  const db = await getDb()

  const { error } = await db.from('session_plan_items').insert({
    practitioner_id: practitionerId,
    patient_id: patientId,
    appointment_id: scope.appointmentId,
    title: clean,
    position: await nextPosition(practitionerId, patientId),
  })

  if (error) throw error
}

/** Add a material on its own — v1's "Agregar" in the library search. */
export async function addMaterialToPlan(
  practitionerId: string,
  patientId: string,
  materialId: string,
  appointmentId?: string | null,
) {
  const db = await getDb()

  // Reading it first is what proves it is a material this practitioner is
  // allowed to see: the select goes through RLS, the insert does not check.
  const { data: material, error: materialError } = await db
    .from('materials')
    .select('id')
    .eq('id', materialId)
    .maybeSingle()

  if (materialError) throw materialError
  if (!material) throw new Error('Ese material no existe.')

  const scope = await scopeFor(practitionerId, patientId, appointmentId)

  const { error } = await db.from('session_plan_items').insert({
    practitioner_id: practitionerId,
    patient_id: patientId,
    appointment_id: scope.appointmentId,
    material_id: material.id,
    position: await nextPosition(practitionerId, patientId),
  })

  if (error) throw error
}

export async function removePlanItem(practitionerId: string, itemId: string) {
  const db = await getDb()

  const { error } = await db
    .from('session_plan_items')
    .delete()
    .eq('practitioner_id', practitionerId)
    .eq('id', itemId)

  if (error) throw error
}

/**
 * Retires the rows a session record was drafted from, by id.
 *
 * By id and not by `clearPlan`'s scope, on purpose. Saving the record marks the
 * session "Vino" first (`createSession`), and from that instant it is no longer
 * the patient's next session — so the rows prepared with no session stop
 * belonging to it and a scoped delete skips them. They then show up as next
 * week's plan, having just been used for today's note. The harness found it; the
 * test "retira exactamente lo que se leyó" holds it. The ids are the rows the
 * form was built from, which is exactly what registering should retire.
 *
 * Scoped by practitioner and patient, so an id from a tampered form can only
 * name rows that are already this practitioner's, for this patient.
 */
export async function removePlanItems(
  practitionerId: string,
  patientId: string,
  itemIds: string[],
) {
  const ids = itemIds.filter((id) => AppointmentId.safeParse(id).success)
  if (ids.length === 0) return

  const db = await getDb()
  const { error } = await db
    .from('session_plan_items')
    .delete()
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .in('id', ids)

  if (error) throw error
}

/**
 * Empties one session's plan — the one "Vaciar" was pressed on. Never the
 * patient's whole list: the plan for next week's session is not this one.
 * Registering a session does not use this; see `removePlanItems`.
 */
export async function clearPlan(
  practitionerId: string,
  patientId: string,
  appointmentId?: string | null,
) {
  const scope = await scopeFor(practitionerId, patientId, appointmentId)
  const db = await getDb()

  const { error } = await db
    .from('session_plan_items')
    .delete()
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .or(scopeFilter(scope))

  if (error) throw error
}

/**
 * What the prepared session says, as one line, for the session record.
 *
 * v1 wrote "Se trabajó: a, b, c." into the session note when you registered a
 * prepared session (`registrarSesionPreparada`). Same sentence, same place: it
 * is a starting point in a textarea, not a saved clinical statement.
 */
export function planSummary(items: PlanItem[]): string {
  const worked = items.map((item) => (item.title ?? item.material?.title ?? '').trim())
  const named = worked.filter(Boolean).map((text) => text.toLowerCase())
  if (named.length === 0) return ''
  return `Se trabajó: ${named.join(', ')}.`
}
