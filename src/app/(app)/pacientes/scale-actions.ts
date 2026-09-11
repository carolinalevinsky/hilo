'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/server/auth'
import { PatientFormError } from '@/server/patient-forms'
import { createScaleLink, markScaleReviewed } from '@/server/scales'

import { currentOrigin } from '../origin'

/**
 * A new link for one questionnaire. Bound to its patient and scale by the
 * ficha, so the browser only ever says "make it".
 */
export async function createScaleLinkAction(
  patientId: string,
  scale: string,
): Promise<{ url: string } | { error: string }> {
  const user = await requireUser()

  try {
    const token = await createScaleLink(user.id, patientId, scale)
    const origin = await currentOrigin()
    revalidatePath(`/pacientes/${patientId}`)
    return { url: `${origin}/antes/${token}` }
  } catch (error) {
    if (error instanceof PatientFormError) return { error: error.message }
    console.error('[scales] no se pudo crear el link', { patientId, scale, error })
    return { error: 'No pudimos crear el link. Probá de nuevo.' }
  }
}

/** "Lo vi" on an item-9 flag. */
export async function markScaleReviewedAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await markScaleReviewed(user.id, String(formData.get('responseId')))
  revalidatePath(`/pacientes/${patientId}`)
}
