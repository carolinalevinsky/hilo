'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, formOk, type FormState } from '@/lib/form-state'
import { createSchedule } from '@/server/appointments'
import { requireUser } from '@/server/auth'
import { createGoal } from '@/server/goals'
import {
  createPatient,
  ensurePatientRoom,
  removePatientPhoto,
  rotatePatientRoom,
  savePatientPhoto,
  setPatientArchived,
  setPatientVideoUrl,
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
    guardianName: formData.get('guardianName'),
    guardianRelationship: formData.get('guardianRelationship'),
    guardianEmail: formData.get('guardianEmail'),
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

/**
 * The first goal typed on the alta, if there was one.
 *
 * A goal is its own row, not a column on the patient — so this is a second
 * write, made here only so that somebody who already knows what they are going
 * to work on does not have to say it again on the ficha.
 *
 * Swallows its own failure for the same reason `savePhotoIfPresent` does: the
 * patient exists by now, and turning a failed extra into a form error would
 * hide the patient that was actually created. It is not silent in practice —
 * the redirect lands on the ficha, where a missing goal is visible immediately.
 */
async function saveFirstGoalIfPresent(
  practitionerId: string,
  patientId: string,
  formData: FormData,
) {
  const title = String(formData.get('firstGoal') ?? '').trim()
  if (!title) return

  try {
    await createGoal(practitionerId, patientId, { title, progress: 0 })
  } catch (error) {
    console.error('[patients] no se pudo crear el primer objetivo', { patientId, error })
  }
}

/**
 * The standing appointment typed on the alta, if there was one.
 *
 * **The hour is the switch.** Weekday and frequency are selects and always come
 * back with a value; the hour is the only field somebody has to deliberately
 * fill, so an empty hour means "I have not decided yet" and nothing is written.
 *
 * The rule it writes is the same one the "Agendar sesión" dialog writes, and
 * the Agenda turns it into occurrences on its own — see `materialiseAppointments`.
 *
 * Returns whether anything was written, so the caller only revalidates the
 * Agenda when there is a reason to.
 */
async function saveScheduleIfPresent(
  practitionerId: string,
  patientId: string,
  formData: FormData,
) {
  const startTime = String(formData.get('startTime') ?? '').trim()
  if (!startTime) return false

  try {
    await createSchedule(practitionerId, {
      patientId,
      weekday: formData.get('weekday'),
      startTime,
      frequency: formData.get('frequency') ?? 'weekly',
    })
    return true
  } catch (error) {
    console.error('[patients] no se pudo agendar el horario', { patientId, error })
    return false
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
  await saveFirstGoalIfPresent(user.id, patientId, formData)
  const scheduled = await saveScheduleIfPresent(user.id, patientId, formData)

  revalidatePath('/pacientes')
  if (scheduled) revalidatePath('/agenda')
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
  // `keep` por defecto: es la opción que no pierde nada, y es la que
  // corresponde cuando el paciente no tiene ningún horario fijo y la pantalla
  // no llegó a preguntar.
  const schedules = formData.get('schedules') === 'deactivate' ? 'deactivate' : 'keep'

  await setPatientArchived(user.id, patientId, archived, schedules)
  revalidatePath('/pacientes')
  revalidatePath('/agenda')
  revalidatePath(`/pacientes/${patientId}`)
}

export async function deletePatientAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await softDeletePatient(user.id, patientId)
  revalidatePath('/pacientes')
  revalidatePath('/agenda')
  redirect('/pacientes')
}

/** Makes the room the first time it is asked for, and keeps it after that. */
export async function openConsultationAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await ensurePatientRoom(user.id, patientId)
  revalidatePath(`/pacientes/${patientId}`)
}

/**
 * Una sala nueva, que es la única forma de sacar de la sesión a quien tenga el
 * link viejo. Ver `rotatePatientRoom`.
 */
export async function rotateRoomAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await rotatePatientRoom(user.id, patientId)
  revalidatePath(`/pacientes/${patientId}`)
}

/** The practitioner's own Zoom or Meet, which wins over Hilo's room. */
export async function saveVideoUrlAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  try {
    await setPatientVideoUrl(user.id, patientId, formData.get('videoUrl'))
  } catch (error) {
    return formError(messageFor(error))
  }

  revalidatePath(`/pacientes/${patientId}`)
  return formOk('Guardado.')
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
