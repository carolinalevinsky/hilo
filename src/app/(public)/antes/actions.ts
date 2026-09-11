'use server'

import { headers } from 'next/headers'

import { formError, formErrorFor, formOk, type FormState } from '@/lib/form-state'
import { submitIntake } from '@/server/patient-forms'

/**
 * The family sends "Antes de empezar".
 *
 * No `requireUser`: whoever holds the link is the one allowed to answer it, and
 * the database function checks the token. The token is bound by the page, not
 * read from the form, so the form cannot point the answers at another link.
 *
 * On a validation error everything typed comes back — a parent who mistyped an
 * email must not lose three paragraphs about their child's history.
 */
export async function submitIntakeAction(
  token: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value
  }

  const userAgent = (await headers()).get('user-agent')

  let result
  try {
    result = await submitIntake(token, values, userAgent)
  } catch (error) {
    return formErrorFor(error, 'No pudimos enviar la ficha. Probá de nuevo en un rato.', values)
  }

  if (result === 'ok') return formOk()
  if (result === 'submitted') return formError('Esta ficha ya se envió. No hace falta hacer nada más.')
  if (result === 'expired') {
    return formError('Este link venció. Pedile uno nuevo a quien te lo mandó.', values)
  }
  return formError('Este link no es válido. Pedile uno nuevo a quien te lo mandó.', values)
}
