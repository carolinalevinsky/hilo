import { z } from 'zod'

import { DISCIPLINE_IDS } from '@/lib/disciplines'
import { publicConfig } from '@/lib/env'

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
 * Sign-up says one more thing than the rest: whether a session exists yet.
 *
 * With email confirmation off — how Hilo runs today — `signUp` returns a session
 * and the practitioner is working seconds later. With it on, it returns none,
 * and sending them to `/inicio` would bounce straight back to the sign-in
 * screen. The caller needs to know which happened, so it is a value here rather
 * than a guess up in the action.
 */
export type SignUpResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; message: string }

/**
 * Creates the account. The `practitioners` row is NOT created here — a trigger
 * on `auth.users` does it (see the M1 migration), which is why `full_name` and
 * `discipline` travel as sign-up metadata.
 *
 * Doing it in a trigger rather than here matters the day email confirmation is
 * switched on in production: `signUp` returns no session then, so there would be
 * no authenticated request in which this function could insert the profile.
 */
export async function signUp(input: unknown): Promise<SignUpResult> {
  const parsed = SignUpInput.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: firstMessage(parsed.error) }
  }

  const { fullName, email, password, discipline } = parsed.data
  const db = await getDb()

  const { data, error } = await db.auth.signUp({
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

  // No session means Supabase is waiting for the emailed link to be clicked.
  return { ok: true, needsConfirmation: data.session === null }
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

// ─── Confirming an emailed link ─────────────────────────────────────────────

/**
 * The link types Hilo sends. Anything else arriving at `/confirmar` is treated
 * as a bad link rather than passed through to Supabase.
 *
 * This enum is why the route handler does not import `@supabase/*` for its
 * `EmailOtpType`: the string is validated here, inside `src/server/`, which is
 * the only layer allowed to talk to Supabase at all.
 */
export const ConfirmationLink = z.object({
  tokenHash: z.string().min(1),
  type: z.enum(['signup', 'recovery', 'invite', 'email_change', 'magiclink']),
})

/**
 * Turns the hash in an email link into a session.
 *
 * This is the `{{ .TokenHash }}` half of the flow and it is the one to prefer:
 * it works when the link is opened in a different browser than the one that
 * asked for it — which is the normal case, because the request happens on a
 * laptop and the email gets opened on a phone.
 */
export async function confirmEmailLink(input: unknown): Promise<AuthResult> {
  const parsed = ConfirmationLink.safeParse(input)
  if (!parsed.success) return { ok: false, message: BAD_LINK }

  const db = await getDb()
  const { error } = await db.auth.verifyOtp({
    token_hash: parsed.data.tokenHash,
    type: parsed.data.type,
  })

  return error ? { ok: false, message: BAD_LINK } : { ok: true }
}

/**
 * The `?code=` half of the same flow, for Supabase's stock email templates.
 *
 * Hilo ships its own Spanish templates (`supabase/templates/`), which use the
 * token hash above — but a project whose templates were never customised sends
 * `{{ .ConfirmationURL }}`, and that lands here instead. Handling both is a few
 * lines and means a forgotten dashboard setting degrades instead of breaking.
 *
 * The catch, and the reason it is the fallback rather than the main path: this
 * exchange needs the PKCE verifier cookie that was written when the email was
 * requested, so it only works in the same browser. Opened on a phone, it fails —
 * and the practitioner sees a link that does not work, with nothing to explain
 * why.
 */
export async function exchangeAuthCode(code: string): Promise<AuthResult> {
  if (!code) return { ok: false, message: BAD_LINK }

  const db = await getDb()
  const { error } = await db.auth.exchangeCodeForSession(code)

  return error ? { ok: false, message: BAD_LINK } : { ok: true }
}

/**
 * One message for every way a link can fail — expired, already used, tampered
 * with, or opened in the wrong browser. Telling them apart would tell a stranger
 * which emails have accounts here, for the same reason `signIn` above does not
 * separate "no such account" from "wrong password".
 */
const BAD_LINK =
  'Ese enlace no funcionó: puede que haya vencido o que ya lo hayas usado. Pedí uno nuevo.'

// ─── Forgotten passwords ────────────────────────────────────────────────────

export const PasswordResetRequest = z.object({
  email: z.email('Revisá el correo, parece que falta algo.'),
})

/**
 * Sends the "cambiá tu contraseña" email.
 *
 * **It reports success even when there is no such account**, and that is not an
 * oversight: an answer that differs tells whoever typed the address whether a
 * health professional has an account here, which is exactly the fact that must
 * not leak. Supabase behaves the same way for the same reason.
 *
 * `redirectTo` is only read by the stock template — Hilo's own template has the
 * destination in it. It is passed anyway so that both templates land in the same
 * place.
 */
export async function requestPasswordReset(input: unknown): Promise<AuthResult> {
  const parsed = PasswordResetRequest.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstMessage(parsed.error) }

  const db = await getDb()
  await db.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicConfig.NEXT_PUBLIC_APP_URL}/confirmar?next=%2Fnueva-contrasena`,
  })

  return { ok: true }
}

export const NewPassword = z
  .object({
    password: z.string().min(6, 'La contraseña necesita al menos 6 caracteres.'),
    confirmation: z.string().min(1, 'Repetí la contraseña.'),
  })
  .refine((value) => value.password === value.confirmation, {
    message: 'Las dos contraseñas no coinciden.',
    path: ['confirmation'],
  })

/**
 * Writes the new password for whoever the current session belongs to.
 *
 * The session in question is the one `confirmEmailLink` just created from the
 * recovery link, which is what makes this safe without asking for the old
 * password: holding the link *is* the proof. What stops an already-signed-in
 * session from quietly changing the password is the marker cookie the confirm
 * route sets — see `src/app/(auth)/recovery-cookie.ts`.
 */
export async function setNewPassword(input: unknown): Promise<AuthResult> {
  const parsed = NewPassword.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstMessage(parsed.error) }

  const db = await getDb()
  const { error } = await db.auth.updateUser({ password: parsed.data.password })

  if (error) {
    if (error.code === 'same_password') {
      return { ok: false, message: 'Esa es la contraseña que ya tenías. Elegí una distinta.' }
    }
    return {
      ok: false,
      message: 'No pudimos cambiar la contraseña. Pedí un enlace nuevo e intentá otra vez.',
    }
  }

  return { ok: true }
}
