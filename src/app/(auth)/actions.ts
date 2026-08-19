'use server'

import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import { signIn, signOut, signUp } from '@/server/auth'

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

  // Handed back so the form can refill itself. Forgetting to tick the terms is
  // the most likely way to fail this form, and retyping your name and email
  // because of a checkbox is the kind of small insult that makes someone give
  // up on signing up at all.
  //
  // The password is deliberately absent — see `FormState`.
  if (!result.ok) {
    return formError(result.message, {
      fullName: String(formData.get('fullName') ?? ''),
      email: String(formData.get('email') ?? ''),
      discipline: String(formData.get('discipline') ?? ''),
      acceptedTerms: formData.get('acceptedTerms') === 'on' ? 'on' : '',
    })
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

  const back = formData.get('volver')
  const destination = typeof back === 'string' && back.startsWith('/') ? back : '/inicio'
  redirect(destination)
}

export async function signOutAction() {
  await signOut()
  redirect('/entrar')
}
