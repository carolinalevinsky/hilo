'use server'

import { revalidatePath } from 'next/cache'

import { formError, formOk, type FormState } from '@/lib/form-state'
import {
  APPOINTMENT_STATUSES,
  createAppointment,
  createSchedule,
  deactivateSchedule,
  deleteAppointment,
  setAppointmentStatus,
} from '@/server/appointments'
import { requireUser } from '@/server/auth'

function messageFor(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: { message: string }[] }).issues
    return issues[0]?.message ?? 'Revisá los datos.'
  }
  return 'No pudimos guardar. Probá de nuevo.'
}

export async function createScheduleAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await createSchedule(user.id, {
      patientId: formData.get('patientId'),
      weekday: formData.get('weekday'),
      startTime: formData.get('startTime'),
      durationMinutes: formData.get('durationMinutes') ?? 45,
      frequency: formData.get('frequency') ?? 'weekly',
      startsOn: formData.get('startsOn'),
    })
  } catch (error) {
    return formError(messageFor(error))
  }

  revalidatePath('/agenda')
  return formOk('Listo, el horario quedó fijo.')
}

export async function createAppointmentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await createAppointment(user.id, {
      patientId: formData.get('patientId'),
      scheduledOn: formData.get('scheduledOn'),
      startTime: formData.get('startTime'),
      durationMinutes: formData.get('durationMinutes') ?? 45,
      note: formData.get('note'),
    })
  } catch (error) {
    return formError(messageFor(error))
  }

  revalidatePath('/agenda')
  return formOk('Turno agendado.')
}

export async function setAppointmentStatusAction(formData: FormData) {
  const user = await requireUser()
  const status = String(formData.get('status'))

  if (!APPOINTMENT_STATUSES.includes(status as (typeof APPOINTMENT_STATUSES)[number])) {
    return
  }

  await setAppointmentStatus(
    user.id,
    String(formData.get('appointmentId')),
    status as (typeof APPOINTMENT_STATUSES)[number],
  )
  revalidatePath('/agenda')
  revalidatePath('/inicio')
}

export async function deleteAppointmentAction(formData: FormData) {
  const user = await requireUser()

  await deleteAppointment(user.id, String(formData.get('appointmentId')))
  revalidatePath('/agenda')
  revalidatePath('/inicio')
}

export async function deactivateScheduleAction(formData: FormData) {
  const user = await requireUser()

  await deactivateSchedule(user.id, String(formData.get('scheduleId')))
  revalidatePath('/agenda')
}
