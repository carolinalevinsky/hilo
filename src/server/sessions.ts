import { z } from 'zod'

import type { Database } from '@/lib/database.types'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * Sessions — the clinical record of what actually happened.
 *
 * A session is not an appointment. The appointment (M4) is what was scheduled
 * and may be cancelled or missed; the session is the note written afterwards.
 * v1 conflated them, which is why it could not answer "how many did she miss?"
 * or "how many did I actually bill?".
 *
 * `progress_note` is the most valuable text in the database: it is what the AI
 * reads when it drafts a report, and it is the reason a report can be drafted at
 * all rather than written from memory.
 */

export type Session = Database['public']['Tables']['sessions']['Row']

export type SessionWithGoals = Session & {
  session_goals: { goal_id: string; goals: { title: string } | null }[]
}

export const SessionInput = z.object({
  heldOn: z.iso.date('Revisá la fecha de la sesión.'),
  progressNote: z.string().trim().min(1, 'Contá cómo salió la sesión.'),
  privateNote: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  /** The goals worked in this session. */
  goalIds: z.array(z.uuid()).default([]),
})

export async function createSession(
  practitionerId: string,
  patientId: string,
  input: unknown,
) {
  const data = SessionInput.parse(input)
  const db = await getDb()

  const { data: session, error } = await db
    .from('sessions')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      held_on: data.heldOn,
      progress_note: data.progressNote,
      private_note: data.privateNote,
    })
    .select()
    .single()

  if (error) throw error

  await linkGoals(practitionerId, session.id, data.goalIds)
  await logAction(practitionerId, 'create', 'session', session.id)
  return session
}

export async function updateSession(
  practitionerId: string,
  sessionId: string,
  input: unknown,
) {
  const data = SessionInput.parse(input)
  const db = await getDb()

  const { data: session, error } = await db
    .from('sessions')
    .update({
      held_on: data.heldOn,
      progress_note: data.progressNote,
      private_note: data.privateNote,
    })
    .eq('id', sessionId)
    .eq('practitioner_id', practitionerId)
    .select()
    .single()

  if (error) throw error

  // Replace rather than diff: the set is small and "these are the goals now" is
  // easier to be sure about than a computed patch.
  const { error: clearError } = await db
    .from('session_goals')
    .delete()
    .eq('session_id', sessionId)
    .eq('practitioner_id', practitionerId)
  if (clearError) throw clearError

  await linkGoals(practitionerId, sessionId, data.goalIds)
  await logAction(practitionerId, 'update', 'session', sessionId)
  return session
}

async function linkGoals(practitionerId: string, sessionId: string, goalIds: string[]) {
  if (goalIds.length === 0) return

  const db = await getDb()
  const { error } = await db.from('session_goals').insert(
    goalIds.map((goalId) => ({
      practitioner_id: practitionerId,
      session_id: sessionId,
      goal_id: goalId,
    })),
  )

  if (error) throw error
}

export async function listSessions(
  practitionerId: string,
  patientId: string,
  limit = 100,
): Promise<SessionWithGoals[]> {
  const db = await getDb()

  const { data, error } = await db
    .from('sessions')
    .select('*, session_goals(goal_id, goals(title))')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .order('held_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getSession(practitionerId: string, sessionId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('sessions')
    .select('*, session_goals(goal_id)')
    .eq('id', sessionId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function countSessions(practitionerId: string, patientId?: string) {
  const db = await getDb()

  let query = db
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)

  if (patientId) query = query.eq('patient_id', patientId)

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

/**
 * Deletes a session. The one thing in Hilo that is genuinely removed rather than
 * soft-deleted, because a session that did not happen is a typo, not history —
 * and leaving it in would corrupt both the count of sessions held and what a
 * report says about the treatment.
 */
export async function deleteSession(practitionerId: string, sessionId: string) {
  const db = await getDb()

  const { error } = await db
    .from('sessions')
    .delete()
    .eq('id', sessionId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'delete', 'session', sessionId)
}
