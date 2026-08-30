'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { formError, formOk, type FormState } from '@/lib/form-state'
import { internalPath } from '@/lib/safe-path'
import {
  requestPasswordReset,
  setNewPassword,
  signIn,
  signOut,
  signUp,
} from '@/server/auth'

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

export async function signUpAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await signUp({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    discipline: formData.get('discipline'),
    acceptedTerms: formData.get('acceptedTerms') === 'on',
  })

  if (!result.ok) return formError(result.message)

  // With confirmation on there is no session yet, so there is nowhere to send
  // them — the form shows "revisá tu correo" instead. With it off, which is how
  // Hilo runs today, they are already signed in.
  if (result.needsConfirmation) {
    return formOk('Te mandamos un correo para confirmar la cuenta.')
  }

  // `redirect` works by throwing, so it stays outside any try/catch.
  redirect('/inicio')
}

export async function signInAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
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
  redirect('/entrar')
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
