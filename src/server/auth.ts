import { z } from 'zod'

import { DISCIPLINE_IDS } from '@/lib/disciplines'

import { getDb } from './db'

/**
 * Sign-up, sign-in, and resolving who is asking.
 *
 * Supabase Auth is reached only from here. Everything else in `src/server/`
 * takes a `practitionerId` as an argument — it is never read from a cookie, a
 * header, or a module-level variable inside those functions. The caller
 * resolves it here and passes it down.
 *
 * That single choice is what makes the backend testable (pass any id) and
 * portable (the same function works behind a route handler, a worker, or a
 * queue consumer).
 */

/**
 * Resolves the signed-in practitioner, or throws.
 *
 * Pages call this and let the error reach the middleware-protected boundary;
 * anything reachable while signed out uses `getUser()` instead.
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

// ─── Sign-up ────────────────────────────────────────────────────────────────

export const SignUpInput = z.object({
  fullName: z.string().trim().min(2, 'Escribí tu nombre y apellido.'),
  email: z.email('Revisá el correo, parece que falta algo.'),
  password: z.string().min(6, 'La contraseña necesita al menos 6 caracteres.'),
  discipline: z.enum(DISCIPLINE_IDS, { message: 'Elegí tu profesión.' }),
  acceptedTerms: z.literal(true, {
    message: 'Necesitamos que aceptes los términos para crear la cuenta.',
  }),
})

/**
 * The result shape every auth function returns.
 *
 * Expected failures — a taken email, a wrong password — are values, not
 * exceptions: they are things a practitioner does, not bugs. The `message` is
 * already in Spanish because it is shown verbatim under the form.
 */
export type AuthResult = { ok: true } | { ok: false; message: string }

/**
 * Creates the account. The `practitioners` row is NOT created here — a trigger
 * on `auth.users` does it (see the M1 migration), which is why `full_name` and
 * `discipline` travel as sign-up metadata.
 *
 * Doing it in a trigger rather than here matters the day email confirmation is
 * switched on in production: `signUp` returns no session then, so there would be
 * no authenticated request in which this function could insert the profile.
 */
export async function signUp(input: unknown): Promise<AuthResult> {
  const parsed = SignUpInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: firstMessage(parsed.error) }
  }

  const { fullName, email, password, discipline } = parsed.data
  const db = await getDb()

  const { error } = await db.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, discipline } },
  })

  if (error) {
    if (error.code === 'user_already_exists' || error.status === 422) {
      return {
        ok: false,
        message: 'Ya hay una cuenta con ese correo. Probá entrar en vez de crearla.',
      }
    }
    return { ok: false, message: 'No pudimos crear la cuenta. Probá de nuevo en un momento.' }
  }

  return { ok: true }
}

// ─── Sign-in ────────────────────────────────────────────────────────────────

export const SignInInput = z.object({
  email: z.email('Revisá el correo, parece que falta algo.'),
  password: z.string().min(1, 'Escribí tu contraseña.'),
})

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = SignInInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: firstMessage(parsed.error) }
  }

  const db = await getDb()
  const { error } = await db.auth.signInWithPassword(parsed.data)

  if (error) {
    // Deliberately the same message for "no such account" and "wrong password".
    // Telling them apart tells a stranger which emails have accounts here, and
    // the accounts belong to health professionals.
    return { ok: false, message: 'El correo o la contraseña no coinciden.' }
  }

  return { ok: true }
}

export async function signOut() {
  const db = await getDb()
  await db.auth.signOut()
}

function firstMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Revisá los datos e intentá de nuevo.'
}
