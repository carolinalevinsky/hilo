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

/**
 * El mensaje de un error de validación, o `null` si no lo es.
 *
 * Zod tira un error con `issues`, y ahí adentro está la frase en castellano que
 * se escribió al definir el esquema — "Escribí tu nombre y apellido.", "Elegí
 * una de las tres opciones.". Es la única que le sirve a quien está mirando el
 * formulario: le dice qué corregir.
 */
export function validationMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('issues' in error)) return null
  const issues = (error as { issues: { message: string }[] }).issues
  return issues[0]?.message ?? 'Revisá los datos e intentá de nuevo.'
}

/**
 * Lo que una acción de formulario devuelve cuando algo falló.
 *
 * Separa las dos cosas que un `catch` suele juntar, y que no se parecen en
 * nada: **un dato mal escrito es de quien lo escribió, y cualquier otra cosa es
 * nuestra.** Al primero se le contesta con la frase del esquema, que dice qué
 * corregir. Al segundo se le contesta con `fallback` —una frase neutra, porque
 * nadie a mitad de su trabajo tiene que leer un error de Postgres— y se escribe
 * en el log del servidor, que es el único lugar donde alguien puede llegar a
 * enterarse.
 *
 * Esa segunda mitad es la que faltaba. Cuatro archivos tenían su propia copia de
 * la primera y ninguno escribía nada, así que un fallo real de la base
 * desaparecía sin dejar rastro; y `perfil/actions.ts`, que se quedó sin copia,
 * contestaba "Probá de nuevo" a un nombre de una sola letra — probar de nuevo lo
 * mismo daba lo mismo, para siempre.
 */
export function formErrorFor(
  error: unknown,
  fallback: string,
  values?: Record<string, string>,
): FormState {
  const invalid = validationMessage(error)
  if (invalid) return formError(invalid, values)

  console.error('[form]', error)
  return formError(fallback, values)
}
