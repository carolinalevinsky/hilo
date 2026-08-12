import { getDb, getServiceDb } from './db'

/**
 * The audit trail.
 *
 * This exists because Hilo holds health data protected by Ley N.º 18.331, and
 * "who touched which record, and when" is a question that has to be answerable.
 * It is about twenty lines of code, not enterprise ceremony.
 *
 * ─── Why the service role ──────────────────────────────────────────────────
 *
 * `audit_log` has a SELECT policy and no INSERT policy: a practitioner can read
 * their own trail and cannot write to it. That is the point — a log a user can
 * forge is not a log. So the write has to bypass RLS, which is one of the four
 * allowed uses of `getServiceDb()` (see `eslint.config.mjs`).
 *
 * The safety cost is contained: this file writes to exactly one table and never
 * reads, so a missing `practitioner_id` filter cannot leak anything.
 *
 * ─── Why it never throws ───────────────────────────────────────────────────
 *
 * A failed audit write must not roll back the clinical action it describes. If
 * saving a session succeeds and logging it fails, the session still saved. The
 * error is reported to the server logs and the caller carries on.
 */

type Action = 'create' | 'update' | 'archive' | 'delete' | 'export' | 'generate' | 'view'

type Entity =
  | 'practitioner'
  | 'patient'
  | 'goal'
  | 'session'
  | 'appointment'
  | 'assessment'
  | 'report'
  | 'payment'
  | 'booking_request'

export async function logAction(
  practitionerId: string,
  action: Action,
  entity: Entity,
  entityId?: string | null,
) {
  try {
    const db = getServiceDb()
    const { error } = await db.from('audit_log').insert({
      practitioner_id: practitionerId,
      action,
      entity,
      entity_id: entityId ?? null,
    })
    if (error) throw error
  } catch (error) {
    console.error('[audit] no se pudo registrar la acción', {
      practitionerId,
      action,
      entity,
      entityId,
      error,
    })
  }
}

/**
 * The practitioner's own trail, newest first. Read through the session, so RLS
 * is what limits it to their rows.
 */
export async function listAuditLog(practitionerId: string, limit = 50) {
  const db = await getDb()

  const { data, error } = await db
    .from('audit_log')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
