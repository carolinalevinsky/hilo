'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/server/auth'
import { applyIntakeResponse, createIntakeLink, PatientFormError } from '@/server/patient-forms'

import { currentOrigin } from '../origin'

/**
 * Makes a new "Antes de empezar" link and hands it back to the ficha.
 *
 * Returned to the browser once and never again: only its hash is stored, so a
 * lost link is replaced, not recovered. The address is built from this
 * request's real origin (see `currentOrigin`), because the link is going to a
 * family's phone and has to open there.
 */
export async function createIntakeLinkAction(
  patientId: string,
): Promise<{ url: string } | { error: string }> {
  const user = await requireUser()

  try {
    const token = await createIntakeLink(user.id, patientId)
    const origin = await currentOrigin()
    revalidatePath(`/pacientes/${patientId}`)
    return { url: `${origin}/antes/${token}` }
  } catch (error) {
    if (error instanceof PatientFormError) return { error: error.message }
    console.error('[intake] no se pudo crear el link', { patientId, error })
    return { error: 'No pudimos crear el link. Probá de nuevo.' }
  }
}

/** "Pasar a la ficha". See `applyIntakeResponse` for what it does and does not copy. */
export async function applyIntakeAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await applyIntakeResponse(user.id, String(formData.get('responseId')))
  revalidatePath(`/pacientes/${patientId}`)
}
