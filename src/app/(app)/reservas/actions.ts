'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/server/auth'
import {
  dismissBookingRequest,
  getBookingRequest,
  markBookingConfirmed,
} from '@/server/booking'
import { today } from '@/lib/dates'
import { createAppointment, createSchedule } from '@/server/appointments'
import { createPatient } from '@/server/patients'

export async function dismissBookingAction(formData: FormData) {
  const user = await requireUser()

  await dismissBookingRequest(user.id, String(formData.get('requestId')))
  revalidatePath('/reservas')
  revalidatePath('/inicio')
}

/**
 * Turns a request into a patient, in one click.
 *
 * This is the moment the feature pays for itself. A family typed their name, a
 * phone, and a day that suits them; retyping all three into the patient form is
 * exactly the sort of small friction that makes someone stop using the booking
 * link and go back to WhatsApp.
 *
 * What the family asked for goes on the agenda when it says enough:
 *
 *   - **A date and a time** (the form since P7): one appointment on that day —
 *     a first interview is one meeting, not a standing slot. Unless the date
 *     has already passed by the time the request is answered; then nothing is
 *     scheduled rather than something in the past.
 *   - **A weekday and a time** (requests from before P7): a standing weekly
 *     schedule, as it always did.
 *   - Anything less: nothing is scheduled and the practitioner arranges it.
 */
export async function confirmBookingAction(formData: FormData) {
  const user = await requireUser()
  const requestId = String(formData.get('requestId'))

  const request = await getBookingRequest(user.id, requestId)
  if (!request) redirect('/reservas')

  const patient = await createPatient(user.id, {
    fullName: request.name,
    phone: request.phone,
    referralReason: request.note,
  })

  if (request.preferred_date && request.preferred_time) {
    if (request.preferred_date >= today()) {
      await createAppointment(user.id, {
        patientId: patient.id,
        scheduledOn: request.preferred_date,
        startTime: request.preferred_time.slice(0, 5),
      })
    }
  } else if (request.preferred_weekday !== null && request.preferred_time) {
    await createSchedule(user.id, {
      patientId: patient.id,
      weekday: request.preferred_weekday,
      startTime: request.preferred_time.slice(0, 5),
      frequency: 'weekly',
    })
  }

  await markBookingConfirmed(user.id, requestId, patient.id)

  revalidatePath('/reservas')
  revalidatePath('/pacientes')
  revalidatePath('/agenda')
  redirect(`/pacientes/${patient.id}`)
}
