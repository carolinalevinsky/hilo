/**
 * The shape every Server Action returns to a form.
 *
 * One shape for all of them, so `useActionState` looks the same everywhere and
 * the error strip is one component.
 *
 * It lives here rather than beside the actions because a `'use server'` file may
 * only export async functions — exporting the initial-state constant from there
 * fails the build with a message that does not obviously say so.
 */
export type FormState = {
  /** True only after a successful write. Drives the green confirmation. */
  ok: boolean
  /** Already in Rioplatense Spanish: it is rendered verbatim under the form. */
  message: string | null
}

export const EMPTY_FORM_STATE: FormState = { ok: false, message: null }

export function formError(message: string): FormState {
  return { ok: false, message }
}

export function formOk(message: string | null = null): FormState {
  return { ok: true, message }
}
