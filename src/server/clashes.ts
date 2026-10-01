import { listAppointments, listSchedules, materialiseAppointments } from './appointments'

/**
 * ¿Se pisa este horario con otra sesión?
 *
 * Agendar desde la agenda no pregunta: la profesional ve la grilla mientras
 * elige, y dos sesiones a la misma hora pueden ser a propósito (una pareja, un
 * grupo). Convertir una reserva en paciente es otra cosa: agenda sola, con la
 * fecha y la hora que pidió la familia, sin que nadie mire la grilla. Antes
 * podía dejar dos pacientes a las 10 del martes y no decir nada.
 */

export type Clash = { patientName: string; startTime: string }

/** Minutos desde la medianoche de "HH:MM" o "HH:MM:SS". */
function minutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number)
  return hours! * 60 + mins!
}

export function timesOverlap(startA: string, lengthA: number, startB: string, lengthB: number): boolean {
  const a = minutes(startA)
  const b = minutes(startB)
  return a < b + lengthB && b < a + lengthA
}

/**
 * La primera sesión de ese día que se pisa con `[start, start + length)`.
 *
 * Los horarios fijos se materializan antes para ese día: una sesión que la
 * regla todavía no escribió como fila también ocupa el lugar. Las canceladas
 * no cuentan.
 */
export async function findClash(
  practitionerId: string,
  date: string,
  start: string,
  length: number,
): Promise<Clash | null> {
  await materialiseAppointments(practitionerId, date, date)
  const sameDay = await listAppointments(practitionerId, date, date)

  const hit = sameDay.find(
    (appointment) =>
      appointment.status !== 'cancelled' &&
      timesOverlap(start, length, appointment.start_time, appointment.duration_minutes),
  )

  return hit
    ? { patientName: hit.patients?.full_name ?? 'otro paciente', startTime: hit.start_time.slice(0, 5) }
    : null
}

/**
 * Lo mismo para un horario fijo semanal: el primero activo, el mismo día de la
 * semana, que se pisa. Sólo para las reservas viejas, que pedían un día de la
 * semana y se convertían en horario fijo.
 */
export async function findScheduleClash(
  practitionerId: string,
  weekday: number,
  start: string,
  length: number,
): Promise<Clash | null> {
  const schedules = await listSchedules(practitionerId)

  const hit = schedules.find(
    (schedule) =>
      schedule.weekday === weekday &&
      timesOverlap(start, length, schedule.start_time, schedule.duration_minutes),
  )

  return hit
    ? { patientName: hit.patients?.full_name ?? 'otro paciente', startTime: hit.start_time.slice(0, 5) }
    : null
}
