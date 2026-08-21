import { z } from 'zod'

import type { Database } from '@/lib/database.types'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * Therapeutic goals and their progress over time.
 *
 * Nothing here writes `goal_progress`. A trigger does (see the M3 migration):
 * the chart has to equal the goal's history whichever code path moved the
 * number, and the one place that forgets would produce a chart that quietly
 * lies about a patient's progress.
 */

export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalPoint = Database['public']['Tables']['goal_progress']['Row']

export const GoalInput = z.object({
  title: z.string().trim().min(1, 'Poné el nombre del objetivo.').max(200),
  progress: z.coerce.number().int().min(0).max(100).default(0),
})

/**
 * Whether this practitioner has written a goal for anybody yet.
 *
 * For "Primeros pasos" on Inicio, which asks the question once and never again
 * after the third step is done. `head: true` reads an index and returns no rows,
 * so this costs about as much as asking whether the table is empty.
 */
export async function hasAnyGoal(practitionerId: string): Promise<boolean> {
  const db = await getDb()
  const { count, error } = await db
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .limit(1)

  if (error) throw error
  return (count ?? 0) > 0
}

export async function createGoal(
  practitionerId: string,
  patientId: string,
  input: unknown,
) {
  const data = GoalInput.parse(input)
  const db = await getDb()

  // New goals go at the end of the list, where a practitioner expects to find
  // what they just typed.
  const { data: last } = await db
    .from('goals')
    .select('position')
    .eq('patient_id', patientId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: row, error } = await db
    .from('goals')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      title: data.title,
      progress: data.progress,
      position: (last?.position ?? -1) + 1,
    })
    .select()
    .single()

  if (error) throw error

  await logAction(practitionerId, 'create', 'goal', row.id)
  return row
}

export async function updateGoal(practitionerId: string, goalId: string, input: unknown) {
  const data = GoalInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('goals')
    .update({ title: data.title, progress: data.progress })
    .eq('id', goalId)
    .eq('practitioner_id', practitionerId)
    .select()
    .single()

  if (error) throw error

  await logAction(practitionerId, 'update', 'goal', goalId)
  return row
}

/**
 * Moves the number without touching the title. This is the common write — a
 * practitioner nudges a slider after a session — and it is what the chart is
 * made of.
 */
export async function setGoalProgress(
  practitionerId: string,
  goalId: string,
  progress: number,
) {
  const value = z.coerce.number().int().min(0).max(100).parse(progress)
  const db = await getDb()

  const { error } = await db
    .from('goals')
    .update({ progress: value })
    .eq('id', goalId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
}

/**
 * Retires a goal. It stays on the record and out of the way: "we stopped
 * working on this in April" is clinical history, not clutter.
 */
export async function setGoalActive(
  practitionerId: string,
  goalId: string,
  isActive: boolean,
) {
  const db = await getDb()

  const { error } = await db
    .from('goals')
    .update({ is_active: isActive })
    .eq('id', goalId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'update', 'goal', goalId)
}

export async function listGoals(
  practitionerId: string,
  patientId: string,
  { includeInactive = false } = {},
) {
  const db = await getDb()

  let query = db
    .from('goals')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)

  if (!includeInactive) query = query.eq('is_active', true)

  const { data, error } = await query
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Every progress point for a patient's goals, oldest first — the shape the
 * chart wants.
 */
export async function listGoalProgress(practitionerId: string, patientId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('goal_progress')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .order('recorded_on', { ascending: true })

  if (error) throw error
  return data
}

/** 0–100 across a patient's active goals, for the list and the statistics. */
export function averageProgress(goals: Pick<Goal, 'progress'>[]): number {
  if (goals.length === 0) return 0
  const total = goals.reduce((sum, goal) => sum + goal.progress, 0)
  return Math.round(total / goals.length)
}
