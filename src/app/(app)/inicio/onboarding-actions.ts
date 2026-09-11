'use server'

import { revalidatePath } from 'next/cache'

import { formError, formErrorFor, formOk, type FormState } from '@/lib/form-state'
import { createAppointment } from '@/server/appointments'
import { requireUser } from '@/server/auth'
import { createGoal } from '@/server/goals'
import { createPatient } from '@/server/patients'
import { createSession, SessionLinkError } from '@/server/sessions'

/**
 * The four steps of "Primeros pasos", done from Inicio itself (P21).
 *
 * Thomas's QA: the card listed things to do and sent you somewhere else to do
 * each one. Carolina chose that each step be doable right there. These are thin
 * on purpose — each is the same server function the full screen uses, with the
 * fewest fields that make sense on a first day; the full forms are one link away
 * from each step.
 *
 * Every one returns to Inicio, where the step it completed crosses itself out.
 */

function refresh() {
  revalidatePath('/inicio')
  revalidatePath('/pacientes')
  revalidatePath('/agenda')
}

/**
 * Just the name. The optional fields go as empty strings, exactly as the full
 * patient form sends them when left blank — a key that is missing is not the
 * same thing to every schema (see the P7 commit for how that bit).
 */
export async function firstPatientAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await createPatient(user.id, {
      fullName: formData.get('fullName'),
      dateOfBirth: '',
      school: '',
      schoolLevel: '',
      healthInsurer: '',
      phone: '',
      referralReason: '',
      startDate: '',
      sessionFee: '',
      expectedSessionsPerMonth: '',
    })
  } catch (error) {
    return formErrorFor(error, 'No pudimos guardar el paciente. Probá de nuevo.')
  }

  refresh()
  return formOk()
}

export async function firstGoalAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  try {
    await createGoal(user.id, patientId, { title: formData.get('title') })
  } catch (error) {
    return formErrorFor(error, 'No pudimos guardar el objetivo. Probá de nuevo.')
  }

  refresh()
  revalidatePath(`/pacientes/${patientId}`)
  return formOk()
}

export async function firstAppointmentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await createAppointment(user.id, {
      patientId: formData.get('patientId'),
      scheduledOn: formData.get('scheduledOn'),
      startTime: formData.get('startTime'),
    })
  } catch (error) {
    return formErrorFor(error, 'No pudimos agendar la sesión. Probá de nuevo.')
  }

  refresh()
  return formOk()
}

/**
 * The note, tied to today's scheduled session when there is one — the same
 * rule as registering from the Agenda: it marks that session attended.
 */
export async function firstRecordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  try {
    await createSession(user.id, patientId, {
      heldOn: formData.get('heldOn'),
      progressNote: formData.get('progressNote'),
      appointmentId: formData.get('appointmentId') || undefined,
    })
  } catch (error) {
    if (error instanceof SessionLinkError) return formError(error.message)
    return formErrorFor(error, 'No pudimos guardar el registro. Probá de nuevo.')
  }

  refresh()
  revalidatePath(`/pacientes/${patientId}`)
  return formOk()
}
