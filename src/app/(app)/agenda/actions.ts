'use server'

import { revalidatePath } from 'next/cache'

import { formError, formErrorFor, formOk, typedValues, type FormState } from '@/lib/form-state'
import { APPOINTMENT_STATUSES, createAppointment, setAppointmentStatus } from '@/server/appointments'
import { createSchedule, deactivateSchedule } from '@/server/schedules'
import { removeFromAgenda } from '@/server/occurrences'
import { requireUser } from '@/server/auth'
import { setAppointmentFocus } from '@/server/planning'
import { RescheduleError, rescheduleAppointment } from '@/server/reschedule'

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
    return formErrorFor(error, 'No pudimos guardar. Probá de nuevo.')
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
    return formErrorFor(error, 'No pudimos guardar. Probá de nuevo.')
  }

  revalidatePath('/agenda')
  return formOk('Sesión agendada.')
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

/** Which goal a session in "Plan de la semana" is for. */
export async function setAppointmentFocusAction(formData: FormData) {
  const user = await requireUser()
  const goalId = String(formData.get('goalId') ?? '')

  await setAppointmentFocus(
    user.id,
    String(formData.get('appointmentId')),
    goalId || null,
  )
  revalidatePath('/agenda')
  revalidatePath('/inicio')
  revalidatePath('/planificacion')
}

/**
 * "Quitar de la agenda". `scope` sólo llega desde una sesión de horario fijo,
 * que pregunta "sólo esta vez" o "todas las de este horario" (P5); cualquier
 * otro valor es "sólo esta vez", que para una sesión suelta es borrarla.
 */
export async function deleteAppointmentAction(formData: FormData) {
  const user = await requireUser()
  const scope = formData.get('scope') === 'series' ? 'series' : 'once'

  await removeFromAgenda(user.id, String(formData.get('appointmentId')), scope)
  revalidatePath('/agenda')
  revalidatePath('/inicio')
  revalidatePath('/planificacion')
}

export async function deactivateScheduleAction(formData: FormData) {
  const user = await requireUser()

  await deactivateSchedule(user.id, String(formData.get('scheduleId')))
  revalidatePath('/agenda')
}

/**
 * "Cambiar día u hora". Ver `src/server/reschedule.ts`.
 *
 * Devuelve lo que se había elegido con el error, así el diálogo no vuelve en
 * blanco cuando el día elegido choca con otra sesión del mismo horario.
 */
export async function rescheduleAppointmentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const values = typedValues(formData)

  try {
    await rescheduleAppointment(user.id, {
      appointmentId: formData.get('appointmentId'),
      scheduledOn: formData.get('scheduledOn'),
      startTime: formData.get('startTime'),
      durationMinutes: formData.get('durationMinutes'),
      scope: formData.get('scope') ?? 'once',
    })
  } catch (error) {
    if (error instanceof RescheduleError) return formError(error.message, values)
    return formErrorFor(error, 'No pudimos mover la sesión. Probá de nuevo.', values)
  }

  revalidatePath('/agenda')
  revalidatePath('/inicio')
  revalidatePath('/planificacion')
  return formOk('Sesión movida.')
}
