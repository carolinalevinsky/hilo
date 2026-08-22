'use server'

import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import { requireUser, signIn, signOut, signUp } from '@/server/auth'
import { createProfile } from '@/server/practitioners'

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
