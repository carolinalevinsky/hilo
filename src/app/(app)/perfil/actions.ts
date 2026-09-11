'use server'

import { revalidatePath } from 'next/cache'

import { DEFAULT_CONSENT_TEMPLATE } from '@/lib/consent-template'
import { formErrorFor, formOk, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { disconnect } from '@/server/google'
import { updateCalendarPrivacy, updatePractitioner } from '@/server/practitioners'
import { updateConsentTemplate } from '@/server/patient-forms'

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
  } catch (error) {
    return formErrorFor(error, 'No pudimos guardar los cambios. Probá de nuevo.')
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
  } catch (error) {
    return formErrorFor(error, 'No pudimos guardar el cambio. Probá de nuevo.')
  }

  revalidatePath('/perfil')
  revalidatePath('/agenda')
  return formOk('Listo, guardamos tu elección.')
}

/**
 * Desconecta Google Calendar.
 *
 * `disconnect` le avisa a Google además de borrar la fila, así que después de
 * esto Hilo deja de poder entrar de verdad — no se olvida de cómo. La razón
 * completa está en `src/server/google.ts`.
 */
export async function disconnectGoogleAction(): Promise<void> {
  const user = await requireUser()
  await disconnect(user.id)
  revalidatePath('/perfil')
}

/**
 * Guarda el texto del consentimiento, o vuelve al modelo de Hilo.
 *
 * Guardar un texto idéntico al modelo es lo mismo que no haberlo tocado: se
 * guarda null, y así quien nunca lo cambió sigue recibiendo las correcciones
 * que se le hagan al modelo.
 */
export async function updateConsentTemplateAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const reset = formData.get('reset') === '1'
  const written = String(formData.get('template') ?? '')
  const template = reset || written.trim() === DEFAULT_CONSENT_TEMPLATE.trim() ? null : written

  try {
    await updateConsentTemplate(user.id, { template })
  } catch (error) {
    return formErrorFor(error, 'No pudimos guardar el texto. Probá de nuevo.')
  }

  revalidatePath('/perfil')
  return formOk(
    reset
      ? 'Listo, volviste al modelo de Hilo.'
      : 'Listo. Los links que mandes desde ahora llevan este texto.',
  )
}
