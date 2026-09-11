import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { today, toDateInput } from '@/lib/dates'

import { logAction } from './audit'
import { getDb } from './db'
import { pushAppointment, removeAppointment } from './google-calendar'

/**
 * Scheduling.
 *
 * A `schedule` is the rule ("Tomás, Mondays at 09:00, every week"). An
 * `appointment` is one occurrence of it, on a real date. The rule is edited
 * once; the occurrences are what get cancelled, missed, and counted.
 *
 * Occurrences are materialised a few weeks ahead rather than computed on the
 * fly. Computing them would mean a cancelled appointment has nowhere to be
 * recorded — you cannot mark a row that does not exist — and "she missed three
 * in July" is exactly the question the agenda has to answer.
 */

export type Schedule = Database['public']['Tables']['schedules']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']

export type AppointmentWithPatient = Appointment & {
  patients: { id: string; full_name: string; color: string | null } | null
  /**
   * El registro escrito de esta sesión, si ya existe. Es una lista porque así lo
   * devuelve PostgREST, pero tiene uno como mucho: lo garantiza el único parcial
   * de `20260911090000_session_belongs_to_its_appointment.sql`.
   */
  sessions: { id: string }[]
}

export type ScheduleWithPatient = Schedule & {
  patients: { id: string; full_name: string; color: string | null } | null
}

export const APPOINTMENT_STATUSES = [
  'scheduled',
  'attended',
  'cancelled',
  'no_show',
] as const

export const ScheduleInput = z.object({
  patientId: z.uuid('Elegí un paciente.'),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Revisá la hora.'),
  durationMinutes: z.coerce.number().int().min(5).max(480).default(45),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']).default('weekly'),
  startsOn: z.iso.date().default(() => today()),
})

export const AppointmentInput = z.object({
  patientId: z.uuid('Elegí un paciente.'),
  scheduledOn: z.iso.date('Revisá la fecha.'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Revisá la hora.'),
  durationMinutes: z.coerce.number().int().min(5).max(480).default(45),
  note: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
})

// ─── Schedules ──────────────────────────────────────────────────────────────

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

/**
 * Saca de la agenda lo que todavía no pasó, para un paciente que se archiva o
 * se borra.
 *
 * De hoy en adelante y sólo lo que sigue `scheduled`: el pasado queda intacto
 * porque esas sesiones ocurrieron —o se faltó a ellas— y en cualquiera de los
 * dos casos son historia. Una sesión ya marcada como asistida o ausente
 * tampoco se toca, aunque estuviera fechada mañana: alguien la registró a
 * mano y no es de este código deshacerlo.
 */
export async function clearUpcomingFor(practitionerId: string, patientId: string) {
  const db = await getDb()

  const { error } = await db
    .from('appointments')
    .delete()
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .eq('status', 'scheduled')
    .gte('scheduled_on', today())

  if (error) throw error
}

/**
 * Da de baja todos los horarios fijos de un paciente.
 *
 * Es la salida explícita de las dos que ofrece el diálogo de archivar, y la
 * única para un paciente borrado. A diferencia de archivar y conservar, esto no
 * se deshace desarchivando: la regla queda marcada como terminada.
 *
 * No borra sesiones. Quien llama ya pasó por `clearUpcomingFor`, y hacerlo dos
 * veces sólo serviría para que las dos mitades se desincronicen algún día.
 */
export async function deactivateSchedulesFor(practitionerId: string, patientId: string) {
  const db = await getDb()

  const { error } = await db
    .from('schedules')
    .update({ is_active: false, ends_on: today() })
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .eq('is_active', true)

  if (error) throw error
}

/**
 * La próxima sesión agendada de un paciente, si hay alguna.
 *
 * La ficha decía "Próxima sesión" y no decía cuándo era, que es la única cosa
 * que alguien va a mirar ahí. El dato existía en `appointments` y la pantalla no
 * lo pedía.
 *
 * Sólo `scheduled`: una cancelada no es la próxima, y una ya marcada como
 * asistida está en el pasado aunque su fecha diga otra cosa.
 */
export async function nextAppointmentFor(
  practitionerId: string,
  patientId: string,
): Promise<NextAppointment | null> {
  const db = await getDb()

  const { data, error } = await db
    .from('appointments')
    .select('id, scheduled_on, start_time')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .eq('status', 'scheduled')
    .gte('scheduled_on', today())
    .order('scheduled_on', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export type NextAppointment = { id: string; scheduled_on: string; start_time: string }

/**
 * La próxima sesión de cada uno de estos pacientes, en una sola consulta.
 *
 * Misma regla que `nextAppointmentFor` —sólo `scheduled`, de hoy en adelante—
 * y tiene que seguir siéndolo: es la que decide a qué sesión pertenece lo que se
 * preparó sin sesión (ver `session-plans.ts`), y si las dos dijeran distinto la
 * ficha y la Agenda mostrarían planes distintos para la misma sesión.
 */
export async function nextAppointments(
  practitionerId: string,
  patientIds: string[],
): Promise<Map<string, NextAppointment>> {
  const next = new Map<string, NextAppointment>()
  if (patientIds.length === 0) return next

  const db = await getDb()
  const { data, error } = await db
    .from('appointments')
    .select('id, patient_id, scheduled_on, start_time')
    .eq('practitioner_id', practitionerId)
    .in('patient_id', patientIds)
    .eq('status', 'scheduled')
    .gte('scheduled_on', today())
    .order('scheduled_on', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error

  // Ordered soonest first, so the first one seen for a patient is theirs.
  for (const row of data ?? []) {
    if (!next.has(row.patient_id)) {
      next.set(row.patient_id, {
        id: row.id,
        scheduled_on: row.scheduled_on,
        start_time: row.start_time,
      })
    }
  }
  return next
}

// ─── Materialising occurrences ──────────────────────────────────────────────

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
  const { error } = await db
    .from('appointments')
    .upsert(rows, { onConflict: 'schedule_id,scheduled_on', ignoreDuplicates: true })

  if (error) throw error
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

// ─── Appointments ───────────────────────────────────────────────────────────

export async function createAppointment(practitionerId: string, input: unknown) {
  const data = AppointmentInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('appointments')
    .insert({
      practitioner_id: practitionerId,
      patient_id: data.patientId,
      scheduled_on: data.scheduledOn,
      start_time: data.startTime,
      duration_minutes: data.durationMinutes,
      note: data.note,
      source: 'manual',
    })
    .select()
    .single()

  if (error) throw error
  await logAction(practitionerId, 'create', 'appointment', row.id)

  // Después de guardar y sin poder deshacerlo. Ver la regla en
  // `google-calendar.ts`: que Google falle no puede impedir agendar. Si no
  // llega, la fila queda con `gcal_event_id` en null y la reconciliación la
  // encuentra después.
  await pushAppointment(practitionerId, row.id)

  return row
}

/**
 * Una cita de este paciente, o `null`.
 *
 * El id llega de la URL (`?agenda=`), así que puede ser cualquier cosa: lo que no
 * es un uuid se descarta antes de preguntarle a Postgres, que si no contesta con
 * un error de sintaxis y la página se cae. Y se filtra por paciente además de
 * por profesional, porque el registro que se abre con ella es el de ese paciente.
 */
export async function getAppointmentFor(
  practitionerId: string,
  patientId: string,
  appointmentId: string,
) {
  if (!z.uuid().safeParse(appointmentId).success) return null

  const db = await getDb()
  const { data, error } = await db
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function setAppointmentStatus(
  practitionerId: string,
  appointmentId: string,
  status: (typeof APPOINTMENT_STATUSES)[number],
) {
  const db = await getDb()

  const { error } = await db
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'update', 'appointment', appointmentId)

  // Cancelar saca la hora del calendario; volver a agendarla la repone. Los
  // otros dos estados —"vino", "no vino"— son cosas que se anotan después de que
  // la hora pasó y no cambian que haya ocupado ese lugar.
  if (status === 'cancelled') await removeAppointment(practitionerId, appointmentId)
  else if (status === 'scheduled') await pushAppointment(practitionerId, appointmentId)
}

export async function deleteAppointment(practitionerId: string, appointmentId: string) {
  const db = await getDb()

  // Antes de borrar la fila, porque después no queda de dónde sacar el id del
  // evento y quedaría dando vueltas en Google para siempre.
  await removeAppointment(practitionerId, appointmentId)

  const { error } = await db
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'delete', 'appointment', appointmentId)
}

export async function listAppointments(
  practitionerId: string,
  from: string,
  to: string,
): Promise<AppointmentWithPatient[]> {
  const db = await getDb()

  // `!inner` y no un filtro después: un paciente borrado sale de la grilla, no
  // sale sin nombre. Es derecho al olvido (Ley N.º 18.331) y la fila entera es
  // lo que no corresponde mostrar.
  //
  // Sólo `deleted_at`. Un paciente archivado terminó el tratamiento y sus
  // sesiones pasadas son historia que se sigue pudiendo mirar; las futuras se
  // borran al archivar, así que no hay nada que esconder acá.
  const { data, error } = await db
    .from('appointments')
    .select('*, patients!inner(id, full_name, color), sessions(id)')
    .eq('practitioner_id', practitionerId)
    .is('patients.deleted_at', null)
    .gte('scheduled_on', from)
    .lte('scheduled_on', to)
    .order('scheduled_on', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data
}

