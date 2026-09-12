import { z } from 'zod'

import type { Database } from '@/lib/database.types'

import { setAppointmentStatus } from './appointments'
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
 *
 * The form used to offer a second note, `private_note`, held out of reports and
 * out of the patient's data export. It is no longer written: two textareas in a
 * row read as one question asked twice, and a distinction nobody notices is one
 * nobody relies on. The column and the rows already in it are left alone — the
 * timeline still shows them and `patient-export.ts` still declares them — but
 * nothing new lands there. Everything written now is clinical record.
 */

export type Session = Database['public']['Tables']['sessions']['Row']

export type SessionWithGoals = Session & {
  session_goals: { goal_id: string; goals: { title: string } | null }[]
}

export const SessionInput = z.object({
  heldOn: z.iso.date('Revisá la fecha de la sesión.'),
  progressNote: z.string().trim().min(1, 'Contá cómo salió la sesión.'),
  /** The goals worked in this session. */
  goalIds: z.array(z.uuid()).default([]),
  /**
   * The agenda slot this record writes up, when the form was opened from it.
   * Absent when someone came in unscheduled, which the column always allowed.
   * Only `createSession` reads it: a record does not move to another slot.
   */
  appointmentId: z.uuid().optional(),
})

/**
 * Why a record could not be tied to its agenda slot. The message is written to
 * be read — the form shows it as is.
 */
export class SessionLinkError extends Error {}

/**
 * The two rules the schema enforces on `appointment_id`
 * (`20260911090000_session_belongs_to_its_appointment.sql`), turned into
 * sentences. They are checked there and not here so that no other write path can
 * forget them; this only names what the database already refused.
 */
function linkError(error: { code?: string; message: string }) {
  if (error.code === '23505' && error.message.includes('sessions_one_per_appointment')) {
    return new SessionLinkError('Esa sesión de la agenda ya tiene su registro.')
  }
  if (error.code === '23503' && error.message.includes('sessions_appointment_same_patient')) {
    return new SessionLinkError(
      'No encontramos esa sesión en tu agenda. Puede que se haya borrado.',
    )
  }
  return null
}

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
      appointment_id: data.appointmentId ?? null,
      held_on: data.heldOn,
      progress_note: data.progressNote,
    })
    .select()
    .single()

  if (error) throw linkError(error) ?? error

  await linkGoals(practitionerId, session.id, data.goalIds)
  await logAction(practitionerId, 'create', 'session', session.id)

  if (data.appointmentId) await markAttended(practitionerId, data.appointmentId)
  return session
}

/**
 * Writing the record is the proof that the patient came, so the slot says so —
 * including over a "No vino" clicked by mistake. Without this the agenda and the
 * record are two unrelated facts about one visit and can disagree forever.
 *
 * A failure here does not undo the record, for the same reason goal progress
 * does not (`session-actions.ts`): the note is the clinical record, the status is
 * a summary of it. Throwing would also make the form report a failure for a
 * record that was saved, and retrying would then hit the one-per-slot rule.
 */
async function markAttended(practitionerId: string, appointmentId: string) {
  try {
    await setAppointmentStatus(practitionerId, appointmentId, 'attended')
  } catch (error) {
    console.error('[sessions] no se pudo marcar la sesión como "vino"', {
      appointmentId,
      error,
    })
  }
}

/** The record already written for an agenda slot, if there is one. */
export async function sessionForAppointment(practitionerId: string, appointmentId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('sessions')
    .select('id')
    .eq('practitioner_id', practitionerId)
    .eq('appointment_id', appointmentId)
    .maybeSingle()

  if (error) throw error
  return data?.id ?? null
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
