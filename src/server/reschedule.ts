import { z } from 'zod'

import { today, toDateInput } from '@/lib/dates'
import { QUARTER_HOUR, QUARTER_HOUR_MESSAGE } from '@/lib/week'

import { logAction } from './audit'
import { getDb } from './db'
import { pushAppointment, removeAppointment } from './google-calendar'

/**
 * "Cambiar día u hora" de una sesión agendada.
 *
 * No existía: pasar la sesión del martes al jueves era quitarla de la agenda y
 * agendarla de nuevo, y en el camino se perdían el plan preparado y la nota
 * previa, que cuelgan de la sesión. Mover la fila los conserva: sigue siendo la
 * misma sesión, en otro momento.
 *
 * Una sesión de un horario fijo pregunta, como cualquier calendario:
 *
 *   **Sólo esta vez** (`once`): se mueve esta fila y la fecha original se anota
 *   como excepción del horario, para que no vuelva a aparecer al armar la
 *   semana (el mismo mecanismo que "Quitar de la agenda → Sólo esta vez").
 *
 *   **De acá en adelante** (`series`): el horario viejo termina el día anterior
 *   a esta sesión y empieza uno nuevo con el día, la hora y la duración nuevos,
 *   con la misma frecuencia. Esta sesión pasa al horario nuevo, así que conserva
 *   su plan; las siguientes del horario viejo que todavía estaban agendadas se
 *   sacan (también de Google) y las arma el horario nuevo.
 *
 * Sólo se mueve lo agendado. Una sesión que ya pasó y se marcó "Vino" o "No
 * vino" es historia; una cancelada se vuelve a agendar primero.
 */

export const RescheduleInput = z.object({
  appointmentId: z.uuid(),
  scheduledOn: z.iso.date('Revisá la fecha.'),
  startTime: z.string().regex(QUARTER_HOUR, QUARTER_HOUR_MESSAGE),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  scope: z.enum(['once', 'series']).default('once'),
})

/** Un motivo para no mover, en castellano, para mostrar tal cual. */
export class RescheduleError extends Error {}

function dayBefore(date: string) {
  const day = new Date(`${date}T00:00:00`)
  day.setDate(day.getDate() - 1)
  return toDateInput(day)
}

function weekdayOf(date: string) {
  return new Date(`${date}T00:00:00`).getDay()
}

export async function rescheduleAppointment(practitionerId: string, input: unknown) {
  const data = RescheduleInput.parse(input)
  const db = await getDb()

  const { data: appointment, error } = await db
    .from('appointments')
    .select('id, patient_id, schedule_id, scheduled_on, status')
    .eq('id', data.appointmentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  if (!appointment) throw new RescheduleError('No encontramos esa sesión.')
  if (appointment.status !== 'scheduled') {
    throw new RescheduleError(
      appointment.status === 'cancelled'
        ? 'Está cancelada. Volvé a agendarla primero y después la movés.'
        : 'Ya pasó y tiene la asistencia marcada, así que no se mueve.',
    )
  }

  const moved = {
    scheduled_on: data.scheduledOn,
    start_time: data.startTime,
    duration_minutes: data.durationMinutes,
  }

  if (data.scope === 'series' && appointment.schedule_id && data.scheduledOn < today()) {
    throw new RescheduleError('Un horario fijo nuevo arranca de hoy en adelante. Elegí una fecha desde hoy.')
  }

  if (data.scope === 'series' && appointment.schedule_id) {
    await moveSeries(practitionerId, appointment, data, moved)
  } else {
    await moveOnce(practitionerId, appointment, moved)
  }

  await logAction(practitionerId, 'update', 'appointment', appointment.id)

  // El evento de Google se actualiza con la fecha nueva (PATCH sobre el mismo
  // evento). Si Google no contesta, la reconciliación de la Agenda lo reintenta.
  await pushAppointment(practitionerId, appointment.id)
}

type Row = { id: string; patient_id: string; schedule_id: string | null; scheduled_on: string }
type Moved = { scheduled_on: string; start_time: string; duration_minutes: number }

async function moveOnce(practitionerId: string, appointment: Row, moved: Moved) {
  const db = await getDb()

  if (appointment.schedule_id && moved.scheduled_on !== appointment.scheduled_on) {
    // Ese día el horario ya tiene su propia sesión: dos filas del mismo horario
    // en la misma fecha no pueden existir (y serían dos sesiones iguales).
    const { data: clash, error: clashError } = await db
      .from('appointments')
      .select('id')
      .eq('practitioner_id', practitionerId)
      .eq('schedule_id', appointment.schedule_id)
      .eq('scheduled_on', moved.scheduled_on)
      .neq('id', appointment.id)
      .maybeSingle()
    if (clashError) throw clashError
    if (clash) {
      throw new RescheduleError(
        'Ese día ya hay una sesión de este mismo horario fijo. Elegí otro día, o mové esa primero.',
      )
    }

    // La fecha original, como excepción: sin esto el horario la volvía a crear
    // la próxima vez que se arma la semana.
    const { error: skipError } = await db.from('schedule_skips').upsert(
      {
        practitioner_id: practitionerId,
        schedule_id: appointment.schedule_id,
        skipped_on: appointment.scheduled_on,
      },
      { onConflict: 'schedule_id,skipped_on', ignoreDuplicates: true },
    )
    if (skipError) throw skipError
  }

  const { error } = await db
    .from('appointments')
    .update(moved)
    .eq('id', appointment.id)
    .eq('practitioner_id', practitionerId)
  if (error) throw error
}

async function moveSeries(
  practitionerId: string,
  appointment: Row,
  data: z.infer<typeof RescheduleInput>,
  moved: Moved,
) {
  const db = await getDb()

  const { data: schedule, error } = await db
    .from('schedules')
    .select('id, frequency')
    .eq('id', appointment.schedule_id!)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()
  if (error) throw error
  if (!schedule) throw new RescheduleError('No encontramos el horario fijo de esta sesión.')

  // Primero el horario nuevo y esta sesión adentro de él. Si algo falla más
  // abajo, lo peor que queda es el viejo todavía activo — nada se perdió.
  const { data: next, error: createError } = await db
    .from('schedules')
    .insert({
      practitioner_id: practitionerId,
      patient_id: appointment.patient_id,
      weekday: weekdayOf(data.scheduledOn),
      start_time: data.startTime,
      duration_minutes: data.durationMinutes,
      frequency: schedule.frequency,
      starts_on: data.scheduledOn,
    })
    .select('id')
    .single()
  if (createError) throw createError

  const { error: moveError } = await db
    .from('appointments')
    .update({ ...moved, schedule_id: next.id })
    .eq('id', appointment.id)
    .eq('practitioner_id', practitionerId)
  if (moveError) throw moveError

  // El viejo termina el día antes de esta sesión. Lo anterior queda como está.
  const { error: endError } = await db
    .from('schedules')
    .update({ is_active: false, ends_on: dayBefore(appointment.scheduled_on) })
    .eq('id', schedule.id)
    .eq('practitioner_id', practitionerId)
  if (endError) throw endError

  // Las que el viejo ya había armado para después, todavía agendadas: se
  // sacan, primero de Google y después de acá. Las arma el horario nuevo, en
  // su día. Una ya marcada ("Vino", "No vino") no se toca.
  const { data: leftovers, error: leftoversError } = await db
    .from('appointments')
    .select('id')
    .eq('practitioner_id', practitionerId)
    .eq('schedule_id', schedule.id)
    .eq('status', 'scheduled')
    .gte('scheduled_on', appointment.scheduled_on)
  if (leftoversError) throw leftoversError

  for (const { id } of leftovers ?? []) {
    await removeAppointment(practitionerId, id)
  }

  if ((leftovers ?? []).length > 0) {
    const { error: deleteError } = await db
      .from('appointments')
      .delete()
      .in(
        'id',
        (leftovers ?? []).map((row) => row.id),
      )
      .eq('practitioner_id', practitionerId)
    if (deleteError) throw deleteError
  }
}
