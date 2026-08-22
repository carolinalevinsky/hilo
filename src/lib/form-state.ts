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
  /**
   * What the practitioner had typed, handed back so a rejected form can be
   * refilled.
   *
   * React resets an uncontrolled form once its action returns, so without this
   * a form that fails validation comes back blank — you tick the wrong box and
   * lose everything you wrote. The fields that want it read these as their
   * `defaultValue`.
   *
   * **Never put a password in here.** It would travel back to the browser and
   * sit in the DOM as an attribute. A cleared password field is a small cost;
   * that is not.
   */
  values?: Record<string, string>
}

export const EMPTY_FORM_STATE: FormState = { ok: false, message: null }

export function formError(message: string, values?: Record<string, string>): FormState {
  return { ok: false, message, values }
}

export function formOk(message: string | null = null): FormState {
  return { ok: true, message }
}
