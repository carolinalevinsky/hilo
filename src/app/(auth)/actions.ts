'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_OPTIONS, SESSION_ONLY_COOKIE } from '@/lib/auth-cookie'
import { formError, formErrorFor, formOk, type FormState } from '@/lib/form-state'
import { internalPath } from '@/lib/safe-path'
import {
  requestPasswordReset,
  requireUser,
  setNewPassword,
  signIn,
  signOut,
} from '@/server/auth'
import { acceptInvitation, InvitationError } from '@/server/invitations'
import { createProfile } from '@/server/practitioners'

import { RECOVERY_COOKIE, RECOVERY_PATH } from './recovery-cookie'

/**
 * Server Actions for the auth screens.
 *
 * Thin on purpose: read the form, hand it to `src/server/auth.ts`, redirect or
 * return the message. No validation and no Supabase call happens here — that is
 * all one layer down, where it is testable without a request.
 *
 * A `'use server'` file may only export async functions, which is why the
 * `FormState` shape and its initial value live in `src/lib/form-state.ts`.
 */

export async function signInAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // The box decides how long the session lives, and it has to be decided
  // before Supabase writes the session, which happens inside `signIn`. Ticked:
  // the 400 days `@supabase/ssr` gives every cookie. Unticked: a marker with no
  // expiry, which makes every auth cookie written from here on die with the
  // browser too. See "How long it lives" in `@/lib/auth-cookie`.
  const cookieStore = await cookies()
  if (formData.get('recordar') === 'on') {
    cookieStore.delete(SESSION_ONLY_COOKIE)
  } else {
    cookieStore.set(SESSION_ONLY_COOKIE, '1', AUTH_COOKIE_OPTIONS)
  }

  const result = await signIn({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.ok) return formError(result.message)

  // `volver` comes from the URL the proxy built when it bounced someone off a
  // page, which means it comes from the address bar. See `internalPath`.
  redirect(internalPath(formData.get('volver'), '/inicio'))
}

export async function signOutAction() {
  await signOut()
  // The choice belongs to the session it was made for.
  ;(await cookies()).delete(SESSION_ONLY_COOKIE)
  redirect('/entrar')
}

/**
 * Builds the profile for an account that never got one from the sign-up
 * trigger. See `createProfile`.
 *
 * The values are echoed back on failure, like the sign-up form — there is no
 * password here, so all of them can be.
 */
export async function completeProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  const fullName = String(formData.get('fullName') ?? '')
  const discipline = String(formData.get('discipline') ?? '')

  try {
    await createProfile(user.id, user.email, { fullName, discipline })
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'issues' in error
        ? ((error as { issues: { message: string }[] }).issues[0]?.message ??
          'Revisá los datos.')
        : error instanceof Error && error.message
          ? error.message
          : 'No pudimos guardar tu perfil. Probá de nuevo.'

    return formError(message, { fullName, discipline })
  }

  redirect('/inicio')
}

export async function requestPasswordResetAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await requestPasswordReset({ email: formData.get('email') })

  if (!result.ok) return formError(result.message)

  // Deliberately the same answer whether or not that address has an account.
  return formOk()
}

export async function setNewPasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const store = await cookies()

  // The page checks this too. It is checked again here because a Server Action
  // is an endpoint: reaching it does not require having rendered the page.
  if (store.get(RECOVERY_COOKIE)?.value !== '1') {
    return formError('Ese enlace ya no sirve. Pedí uno nuevo para cambiar la contraseña.')
  }

  const result = await setNewPassword({
    password: formData.get('password'),
    confirmation: formData.get('confirmation'),
  })

  if (!result.ok) return formError(result.message)

  // One use per link.
  store.delete({ name: RECOVERY_COOKIE, path: RECOVERY_PATH })

  redirect('/inicio')
}

/**
 * Turns an invitation link into an account, and signs them in with it.
 *
 * The sign-in is not a convenience: with no session, the redirect to `/inicio`
 * bounces straight back to `/entrar` and somebody who just chose a password is
 * asked for it again by a screen that looks like the account was not created.
 *
 * `acceptInvitation` already created the user with `email_confirm: true`, so
 * this is a plain password sign-in and cannot fail for a reason the practitioner
 * could act on — if it somehow does, sending them to `/entrar` is the honest
 * outcome: the account exists and the password they just chose works there.
 */
export async function acceptInvitationAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get('password') ?? '')

  let email: string
  try {
    const accepted = await acceptInvitation({
      token: formData.get('token'),
      password,
      acceptedTerms: formData.get('acceptedTerms') === 'on',
    })
    email = accepted.email
  } catch (error) {
    if (error instanceof InvitationError) return formError(error.message)
    return formErrorFor(error, 'No pudimos crear tu cuenta. Probá de nuevo en un momento.')
  }

  const signedIn = await signIn({ email, password })
  if (!signedIn.ok) redirect('/entrar?aviso=cuenta-creada')

  redirect('/inicio')
}
