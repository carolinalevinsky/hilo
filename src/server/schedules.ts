import { today } from '@/lib/dates'

import { ScheduleInput, type ScheduleWithPatient } from './appointments'
import { logAction } from './audit'
import { getDb } from './db'
import { removeAppointment } from './google-calendar'

/**
 * Los horarios fijos: la regla ("Tomás, los lunes a las 9, todas las
 * semanas"). Las fechas que salen de ellas están en `occurrences.ts`, y cada
 * sesión suelta en `appointments.ts`.
 */

export async function createSchedule(practitionerId: string, input: unknown) {
  const data = ScheduleInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('schedules')
    .insert({
      practitioner_id: practitionerId,
      patient_id: data.patientId,
      weekday: data.weekday,
      start_time: data.startTime,
      duration_minutes: data.durationMinutes,
      frequency: data.frequency,
      starts_on: data.startsOn,
    })
    .select()
    .single()

  if (error) throw error
  await logAction(practitionerId, 'create', 'appointment', row.id)
  return row
}

/**
 * Turns a rule off and clears the occurrences it had already produced, from
 * tomorrow onwards. The past is left exactly as it was — those appointments
 * happened, or were missed, and either way they are history.
 *
 * **Desde mañana, no desde hoy.** `ends_on` se escribe con la fecha de hoy, o
 * sea que la regla llega hasta hoy inclusive; borrar `>= hoy` se llevaba puesta
 * la sesión de esta tarde, que según lo que la misma función acaba de escribir
 * tenía que quedar. Las dos mitades decían cosas distintas y ganaba la de abajo.
 *
 * Archivar un paciente sí borra la de hoy, y no es una incoherencia con esto:
 * ahí la decisión es sacarlo de la agenda ya. Ver `clearUpcomingFor`.
 */
export async function deactivateSchedule(practitionerId: string, scheduleId: string) {
  const db = await getDb()

  // Las de mañana en adelante que ya estaban en Google, se sacan de allá antes
  // de borrarlas acá: después no queda de dónde sacar el id del evento, y
  // quedaban en el calendario de la profesional para siempre.
  const { data: synced } = await db
    .from('appointments')
    .select('id')
    .eq('practitioner_id', practitionerId)
    .eq('schedule_id', scheduleId)
    .eq('status', 'scheduled')
    .gt('scheduled_on', today())
    .not('gcal_event_id', 'is', null)

  for (const { id } of synced ?? []) {
    await removeAppointment(practitionerId, id)
  }

  const { error } = await db
    .from('schedules')
    .update({ is_active: false, ends_on: today() })
    .eq('id', scheduleId)
    .eq('practitioner_id', practitionerId)
  if (error) throw error

  const { error: cleanupError } = await db
    .from('appointments')
    .delete()
    .eq('practitioner_id', practitionerId)
    .eq('schedule_id', scheduleId)
    .eq('status', 'scheduled')
    .gt('scheduled_on', today())

  if (cleanupError) throw cleanupError
}

export async function listSchedules(
  practitionerId: string,
  patientId?: string,
): Promise<ScheduleWithPatient[]> {
  const db = await getDb()

  // El estado del paciente manda sobre la regla. `materialiseAppointments` va
  // por acá, así que archivar a alguien alcanza para que su horario deje de
  // crear sesiones — sin tocar la regla, que es lo que hace que desarchivar lo
  // devuelva solo. La otra salida, dar el horario de baja, es una decisión
  // aparte que se pregunta al archivar y escribe `is_active`.
  let query = db
    .from('schedules')
    .select('*, patients!inner(id, full_name, color)')
    .eq('practitioner_id', practitionerId)
    .eq('is_active', true)
    .is('patients.deleted_at', null)
    .is('patients.archived_at', null)

  if (patientId) query = query.eq('patient_id', patientId)

  const { data, error } = await query
    .order('weekday', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data
}
