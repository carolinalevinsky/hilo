'use server'

import { revalidatePath } from 'next/cache'

import { formError, formOk, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { updatePractitioner } from '@/server/practitioners'

export async function updateProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await updatePractitioner(user.id, {
      fullName: formData.get('fullName'),
      discipline: formData.get('discipline'),
      phone: formData.get('phone'),
    })
  } catch {
    return formError('No pudimos guardar los cambios. Probá de nuevo.')
  }

  // The sidebar shows the name and discipline, so the whole shell is stale.
  revalidatePath('/', 'layout')
  return formOk('Listo, guardamos tus datos.')
}
