import { suggestedActivity } from '@/lib/activity-bank'

import { getDb } from './db'
import {
  bestMaterialFor,
  listMaterials,
  type Material,
  type MaterialSummary,
} from './materials'

/**
 * The prepared next session.
 *
 * v1's "Planificar sesión" (`legacy/index.html:2855`), which is the half of
 * Planificación the rewrite dropped. The rewrite put a read-only list of the
 * coming week in its place — useful, but a different thing: it told you what was
 * ahead and gave you nothing to do about it.
 *
 * The idea worth keeping is that planning is the part of this job that takes the
 * longest, and almost all of it is deciding. So: the goals that have moved least
 * are already sorted and each has a suggested activity and a matched material,
 * one click adds it, and what you assemble persists on the patient as "the next
 * session" until you register it.
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

/** What is currently planned for one patient, in the order it will be worked. */
export async function listPlanItems(
  practitionerId: string,
  patientId: string,
): Promise<PlanItem[]> {
  const db = await getDb()

  const { data, error } = await db
    .from('session_plan_items')
    .select('id, title, position, goal_id, materials (id, title, area, focus)')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
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

export type PlanSuggestion = {
  goalId: string
  title: string
  progress: number
  /** What to actually do about it, from v1's activity bank. */
  activity: string
  material: MaterialSummary | null
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
    listPlanItems(practitionerId, patientId),
  ])

  if (error) throw error

  const already = new Set(items.map((item) => item.goalId).filter(Boolean))

  return (goals ?? []).map((goal) => ({
    goalId: goal.id,
    title: goal.title,
    progress: goal.progress,
    activity: suggestedActivity(goal.title),
    material: bestMaterialFor(goal.title, materials),
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
 * Add a goal to the plan, with the material Hilo matched to it.
 *
 * The title is copied rather than read through `goal_id` — see the migration.
 * The goal is re-read here rather than trusted from the form because a form
 * field is whatever the browser sent, and `.eq('practitioner_id', …)` is what
 * makes "add goal X" mean "add a goal that is mine".
 */
export async function addGoalToPlan(
  practitionerId: string,
  patientId: string,
  goalId: string,
  discipline: string,
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

  const materials = await listMaterials(practitionerId, { discipline })
  const material = bestMaterialFor(goal.title, materials)

  const { error } = await db.from('session_plan_items').insert({
    practitioner_id: practitionerId,
    patient_id: patientId,
    goal_id: goal.id,
    material_id: material?.id ?? null,
    title: goal.title,
    position: await nextPosition(practitionerId, patientId),
  })

  if (error) throw error
}

/** Add a material on its own — v1's "Agregar" in the library search. */
export async function addMaterialToPlan(
  practitionerId: string,
  patientId: string,
  materialId: string,
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

  const { error } = await db.from('session_plan_items').insert({
    practitioner_id: practitionerId,
    patient_id: patientId,
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

export async function clearPlan(practitionerId: string, patientId: string) {
  const db = await getDb()

  const { error } = await db
    .from('session_plan_items')
    .delete()
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)

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
