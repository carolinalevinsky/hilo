import type { Database } from '@/lib/database.types'
import { toDateInput } from '@/lib/dates'

import { deleteAppointment, type Schedule } from './appointments'
import { deactivateSchedule, listSchedules } from './schedules'
import { getDb } from './db'

/**
 * Los horarios fijos hechos fechas: cuándo cae cada regla, escribirlas como
 * filas de la agenda y sacarlas de ella. Salió de `appointments.ts`, que con
 * esto pasaba las 700 líneas.
 */

/**
 * Creates the appointments each active rule implies between two dates, skipping
 * any that already exist.
 *
 * Called when the agenda loads. It is safe to re-run: the unique constraint on
 * `(schedule_id, scheduled_on)` means a second pass inserts nothing, and
 * `ignoreDuplicates` turns the collision into a no-op rather than an error.
 *
 * Three weeks ahead is the window. Far enough that next week is always there,
 * short enough that changing a rule does not leave months of stale rows behind.
 */
export async function materialiseAppointments(
  practitionerId: string,
  from: string,
  to: string,
) {
  const schedules = await listSchedules(practitionerId)
  if (schedules.length === 0) return

  const rows: Database['public']['Tables']['appointments']['Insert'][] = []

  for (const schedule of schedules) {
    for (const date of occurrencesBetween(schedule, from, to)) {
      rows.push({
        practitioner_id: practitionerId,
        patient_id: schedule.patient_id,
        schedule_id: schedule.id,
        scheduled_on: date,
        start_time: schedule.start_time,
        duration_minutes: schedule.duration_minutes,
        source: 'schedule',
      })
    }
  }

  if (rows.length === 0) return

  const db = await getDb()

  // Las fechas que se quitaron "sólo esta vez" (P5). Sin esto, una sesión de
  // horario fijo borrada volvía en la próxima carga: la deduplicación de abajo es
  // por la fila, y una fila borrada no deja nada contra qué deduplicar.
  const { data: skips, error: skipsError } = await db
    .from('schedule_skips')
    .select('schedule_id, skipped_on')
    .eq('practitioner_id', practitionerId)
    .gte('skipped_on', from)
    .lte('skipped_on', to)

  if (skipsError) throw skipsError

  const skipped = new Set((skips ?? []).map((skip) => `${skip.schedule_id}:${skip.skipped_on}`))
  const wanted = rows.filter((row) => !skipped.has(`${row.schedule_id}:${row.scheduled_on}`))
  if (wanted.length === 0) return

  const { error } = await db
    .from('appointments')
    .upsert(wanted, { onConflict: 'schedule_id,scheduled_on', ignoreDuplicates: true })

  if (error) throw error
}

export type RemoveScope = 'once' | 'series'

/**
 * "Quitar de la agenda" (P5).
 *
 * Una sesión suelta se borra y listo. Una que vino de un horario fijo pregunta,
 * como cualquier calendario con eventos que se repiten:
 *
 *   - **Sólo esta vez** (`once`): se anota la fecha en `schedule_skips` y se
 *     borra la sesión. La regla sigue; esta fecha no vuelve.
 *   - **Todas las de este horario** (`series`): se da de baja la regla
 *     (`deactivateSchedule`, que saca las de mañana en adelante) y se borra esta
 *     también — aunque sea de hoy, que la baja deja a propósito. La fecha se
 *     anota igual: la regla termina hoy inclusive, y sin la excepción la sesión
 *     de hoy volvería a aparecer.
 *
 * Lo pasado no se toca en ningún caso: esas sesiones ocurrieron, o se faltó a
 * ellas, y son historia.
 */
export async function removeFromAgenda(
  practitionerId: string,
  appointmentId: string,
  scope: RemoveScope = 'once',
) {
  const db = await getDb()

  const { data: appointment, error } = await db
    .from('appointments')
    .select('id, schedule_id, scheduled_on')
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  if (!appointment) return

  if (appointment.schedule_id) {
    const { error: skipError } = await db.from('schedule_skips').upsert(
      {
        practitioner_id: practitionerId,
        schedule_id: appointment.schedule_id,
        skipped_on: appointment.scheduled_on,
      },
      { onConflict: 'schedule_id,skipped_on', ignoreDuplicates: true },
    )
    if (skipError) throw skipError

    if (scope === 'series') await deactivateSchedule(practitionerId, appointment.schedule_id)
  }

  await deleteAppointment(practitionerId, appointmentId)
}

/**
 * The dates a rule falls on within a window.
 *
 * Exported because it is pure arithmetic with edge cases worth testing directly
 * — biweekly counting from the wrong anchor is the classic way this goes quietly
 * wrong, and it is invisible until someone misses a session.
 */
export function occurrencesBetween(
  schedule: Pick<Schedule, 'weekday' | 'frequency' | 'starts_on' | 'ends_on'>,
  from: string,
  to: string,
): string[] {
  const anchor = new Date(`${schedule.starts_on}T00:00:00`)
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  const stop = schedule.ends_on ? new Date(`${schedule.ends_on}T00:00:00`) : null

  // The first occurrence on or after the anchor that falls on the right weekday.
  const firstOccurrence = new Date(anchor)
  const shift = (schedule.weekday - anchor.getDay() + 7) % 7
  firstOccurrence.setDate(anchor.getDate() + shift)

  const dates: string[] = []
  const cursor = new Date(firstOccurrence)

  // Monthly means "the same weekday, four weeks apart" rather than "the 14th".
  // That is what a practitioner means by "once a month" for a standing session:
  // the slot stays the same, which a calendar-month rule would not preserve.
  const stepDays = schedule.frequency === 'weekly' ? 7 : schedule.frequency === 'biweekly' ? 14 : 28

  // Saltar de una hasta la ventana, en vez de llegar paso a paso.
  //
  // La guarda de abajo contaba desde `starts_on`, así que la gastaba el tiempo
  // transcurrido y no el trabajo a hacer: un horario semanal empezado hace más
  // de siete años y medio agotaba las 400 vueltas antes de llegar a la semana
  // que se está mirando, y dejaba de generar sesiones sin decir nada. Una
  // profesional con un paciente de años lo habría visto; nadie más.
  //
  // Con el salto, la guarda cubre la ventana pedida —siete días, tres semanas,
  // un año— que es lo que tiene que acotar.
  if (cursor < start) {
    const daysBehind = Math.floor((start.getTime() - cursor.getTime()) / 86_400_000)
    cursor.setDate(cursor.getDate() + Math.floor(daysBehind / stepDays) * stepDays)
  }

  // A guard, not a limit: any rule stepping at least a week reaches a year's
  // window in well under this. It exists so a bad `starts_on` cannot spin.
  for (let guard = 0; guard < 400; guard += 1) {
    if (cursor > end) break
    if (stop && cursor > stop) break
    if (cursor >= start) dates.push(toDateInput(cursor))
    cursor.setDate(cursor.getDate() + stepDays)
  }

  return dates
}
