'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import {
  createPatient,
  removePatientPhoto,
  savePatientPhoto,
  setPatientArchived,
  softDeletePatient,
  updatePatient,
} from '@/server/patients'

/**
 * Server Actions for patients. Thin: read the form, call `src/server/patients`,
 * revalidate, redirect.
 */

function readPatientForm(formData: FormData) {
  return {
    fullName: formData.get('fullName'),
    dateOfBirth: formData.get('dateOfBirth'),
    ageGroup: formData.get('ageGroup') ?? 'children',
    school: formData.get('school'),
    schoolLevel: formData.get('schoolLevel'),
    healthInsurer: formData.get('healthInsurer'),
    phone: formData.get('phone'),
    referralReason: formData.get('referralReason'),
    startDate: formData.get('startDate'),
    sessionFee: formData.get('sessionFee'),
    billingFrequency: formData.get('billingFrequency') ?? 'monthly',
    expectedSessionsPerMonth: formData.get('expectedSessionsPerMonth'),
  }
}

/**
 * The photo is optional and its failure must not lose the patient. If the upload
 * fails the record still exists and the practitioner can try the photo again
 * from the patient's page — which is much better than losing a form they filled
 * in while a family waited.
 */
async function savePhotoIfPresent(
  practitionerId: string,
  patientId: string,
  formData: FormData,
) {
  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) return

  try {
    await savePatientPhoto(practitionerId, patientId, {
      contentType: file.type,
      bytes: await file.arrayBuffer(),
    })
  } catch (error) {
    console.error('[patients] no se pudo guardar la foto', { patientId, error })
  }
}

export async function createPatientAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  let patientId: string
  try {
    const patient = await createPatient(user.id, readPatientForm(formData))
    patientId = patient.id
  } catch (error) {
    return formError(messageFor(error))
  }

  await savePhotoIfPresent(user.id, patientId, formData)

  revalidatePath('/pacientes')
  redirect(`/pacientes/${patientId}`)
}

export async function updatePatientAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  try {
    await updatePatient(user.id, patientId, readPatientForm(formData))
  } catch (error) {
    return formError(messageFor(error))
  }

  await savePhotoIfPresent(user.id, patientId, formData)

  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/pacientes/${patientId}`)
}

export async function removePhotoAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await removePatientPhoto(user.id, patientId)
  revalidatePath(`/pacientes/${patientId}`)
}

export async function setArchivedAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))
  const archived = formData.get('archived') === 'true'

  await setPatientArchived(user.id, patientId, archived)
  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${patientId}`)
}

export async function deletePatientAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await softDeletePatient(user.id, patientId)
  revalidatePath('/pacientes')
  redirect('/pacientes')
}

/**
 * Zod's first issue message is already written in Spanish for the practitioner
 * (see the schemas in `src/server/patients.ts`). Anything else is a bug, and a
 * bug should not put a stack trace in front of someone mid-session.
 */
function messageFor(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: { message: string }[] }).issues
    return issues[0]?.message ?? 'Revisá los datos e intentá de nuevo.'
  }
  return 'No pudimos guardar. Probá de nuevo en un momento.'
}
