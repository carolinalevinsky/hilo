'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/server/auth'
import { today } from '@/lib/dates'
import { formError, formErrorFor, type FormState, typedValues } from '@/lib/form-state'
import { createAppointment, createSchedule } from '@/server/appointments'
import {
  claimBookingRequest,
  dismissBookingRequest,
  getBookingRequest,
  markBookingConfirmed,
  releaseBookingRequest,
} from '@/server/booking'
import { findClash, findScheduleClash } from '@/server/clashes'
import { createPatient } from '@/server/patients'
import { withDone } from '@/lib/done'

export async function dismissBookingAction(formData: FormData) {
  const user = await requireUser()

  await dismissBookingRequest(user.id, String(formData.get('requestId')))
  revalidatePath('/reservas')
  revalidatePath('/inicio')
}

/**
 * Turns a request into a patient.
 *
 * This is the moment the feature pays for itself. A family typed their name, a
 * phone, and a day that suits them; retyping all three into the patient form is
 * exactly the sort of small friction that makes someone stop using the booking
 * link and go back to WhatsApp.
 *
 * **El nombre se confirma antes.** Quien llena la reserva casi siempre es la
 * madre o el padre, y esto ponía su nombre en la ficha del niño. Ahora el
 * diálogo propone el nombre de "¿Para quién es la consulta?" —o el de quien
 * escribió, si eso quedó vacío— y, cuando escribió otra persona, la guarda como
 * responsable del paciente.
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
 *
 * **Y si choca, pregunta.** Antes agendaba sin mirar la grilla y podía dejar
 * dos pacientes a la misma hora. `scheduling` es `check` la primera vez; con
 * un choque vuelve con el aviso y dos salidas: `skip` (sin agendar) o `force`
 * (agendar igual).
 */
export async function confirmBookingAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const requestId = String(formData.get('requestId'))
  const scheduling = String(formData.get('scheduling') ?? 'check')
  const patientName = String(formData.get('patientName') ?? '').trim()
  const writerIsGuardian = formData.get('writerIsGuardian') === 'on'
  const values = typedValues(formData)

  if (!patientName) return formError('Escribí el nombre del paciente.', values)

  const pending = await getBookingRequest(user.id, requestId)
  if (!pending || pending.status !== 'pending') redirect('/reservas')

  const plan = schedulingPlan(pending)

  if (plan && scheduling === 'check') {
    const clash =
      plan.kind === 'once'
        ? await findClash(user.id, plan.date, plan.time, DEFAULT_LENGTH)
        : await findScheduleClash(user.id, plan.weekday, plan.time, DEFAULT_LENGTH)

    if (clash) {
      return formError(
        `Ese horario se pisa con ${clash.patientName}, a las ${clash.startTime}.`,
        { ...values, clash: '1' },
      )
    }
  }

  // Reclamada antes de crear nada: un doble clic creaba dos pacientes y dos
  // turnos. Ver `claimBookingRequest`.
  const request = await claimBookingRequest(user.id, requestId)
  if (!request) redirect('/reservas')

  const guardian = writerIsGuardian && request.name.trim() !== patientName

  let patient: Awaited<ReturnType<typeof createPatient>>
  try {
    patient = await createPatient(user.id, {
      fullName: patientName,
      phone: request.phone,
      referralReason: request.note,
      guardianName: guardian ? request.name : undefined,
    })
  } catch (error) {
    await releaseBookingRequest(user.id, requestId)
    return formErrorFor(error, 'No pudimos crear el paciente. Probá de nuevo.', values)
  }

  // Confirmada con su paciente antes de agendar: si agendar falla, el paciente
  // ya existe y la reserva no puede quedar reclamada y sin dueño.
  await markBookingConfirmed(user.id, requestId, patient.id)

  if (plan && scheduling !== 'skip') {
    if (plan.kind === 'once') {
      await createAppointment(user.id, {
        patientId: patient.id,
        scheduledOn: plan.date,
        startTime: plan.time,
      })
    } else {
      await createSchedule(user.id, {
        patientId: patient.id,
        weekday: plan.weekday,
        startTime: plan.time,
        frequency: 'weekly',
      })
    }
  }

  revalidatePath('/reservas')
  revalidatePath('/pacientes')
  revalidatePath('/agenda')
  redirect(withDone(`/pacientes/${patient.id}`, 'reserva-convertida'))
}

/** Lo que se agenda al convertir, o `null` si la reserva no dice lo suficiente. */
function schedulingPlan(request: {
  preferred_date: string | null
  preferred_weekday: number | null
  preferred_time: string | null
}):
  | { kind: 'once'; date: string; time: string }
  | { kind: 'weekly'; weekday: number; time: string }
  | null {
  if (!request.preferred_time) return null
  const time = request.preferred_time.slice(0, 5)

  if (request.preferred_date) {
    return request.preferred_date >= today()
      ? { kind: 'once', date: request.preferred_date, time }
      : null
  }
  if (request.preferred_weekday !== null) {
    return { kind: 'weekly', weekday: request.preferred_weekday, time }
  }
  return null
}

/** Lo que dura una sesión agendada sin decir cuánto: el default de la agenda. */
const DEFAULT_LENGTH = 45
