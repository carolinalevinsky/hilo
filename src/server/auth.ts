import { getDb } from './db'

/**
 * Resolves the signed-in practitioner, or throws.
 *
 * Every function in `src/server/` that touches practitioner data takes a
 * `practitionerId` as its first argument. It is never read from a cookie, a
 * header, or a module-level variable inside those functions — the caller
 * resolves it here and passes it down.
 *
 * That single choice is what makes the backend testable (pass any id) and
 * portable (the same function works behind a route handler, a worker, or a
 * queue consumer).
 */
export async function requireUser() {
  const db = await getDb()
  const { data, error } = await db.auth.getUser()

  if (error || !data.user) {
    throw new Error('not_authenticated')
  }

  return { id: data.user.id, email: data.user.email ?? '' }
}

/**
 * Like `requireUser`, but returns null instead of throwing. For pages that
 * render differently when signed out rather than redirecting.
 */
export async function getUser() {
  const db = await getDb()
  const { data } = await db.auth.getUser()
  return data.user ? { id: data.user.id, email: data.user.email ?? '' } : null
}
