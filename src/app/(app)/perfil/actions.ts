'use server'

import { revalidatePath } from 'next/cache'

import { formError, formOk, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { updateCalendarPrivacy, updatePractitioner } from '@/server/practitioners'

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

/**
 * Guarda qué se ve de un paciente en Google Calendar.
 *
 * Revalida `/agenda` además del perfil: los links "Agregar a Google Calendar"
 * del menú de cada sesión se arman en el servidor con este valor, así que
 * quedarían con el título anterior hasta que algo más los volviera a pedir. Un
 * link cacheado que todavía lleva el nombre después de haberlo desactivado es
 * exactamente el fallo que esta configuración existe para evitar.
 */
export async function updateCalendarPrivacyAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await updateCalendarPrivacy(user.id, {
      calendarPrivacy: formData.get('calendarPrivacy'),
    })
  } catch {
    return formError('No pudimos guardar el cambio. Probá de nuevo.')
  }

  revalidatePath('/perfil')
  revalidatePath('/agenda')
  return formOk('Listo, guardamos tu elección.')
}
