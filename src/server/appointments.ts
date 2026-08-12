import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { toDateInput } from '@/lib/dates'

import { logAction } from './audit'
import { getDb } from './db'

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
  startsOn: z.iso.date().default(() => toDateInput(new Date())),
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
 * Turns a rule off and clears the occurrences it had already produced from today
 * onwards. The past is left exactly as it was — those appointments happened, or
 * were missed, and either way they are history.
 */
export async function deactivateSchedule(practitionerId: string, scheduleId: string) {
  const db = await getDb()

  const { error } = await db
    .from('schedules')
    .update({ is_active: false, ends_on: toDateInput(new Date()) })
    .eq('id', scheduleId)
    .eq('practitioner_id', practitionerId)
  if (error) throw error

  const { error: cleanupError } = await db
    .from('appointments')
    .delete()
    .eq('practitioner_id', practitionerId)
    .eq('schedule_id', scheduleId)
    .eq('status', 'scheduled')
    .gte('scheduled_on', toDateInput(new Date()))

  if (cleanupError) throw cleanupError
}

export async function listSchedules(
  practitionerId: string,
  patientId?: string,
): Promise<ScheduleWithPatient[]> {
  const db = await getDb()

  let query = db
    .from('schedules')
    .select('*, patients(id, full_name, color)')
    .eq('practitioner_id', practitionerId)
    .eq('is_active', true)

  if (patientId) query = query.eq('patient_id', patientId)

  const { data, error } = await query
    .order('weekday', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data
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
  return row
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
}

export async function deleteAppointment(practitionerId: string, appointmentId: string) {
  const db = await getDb()

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

  const { data, error } = await db
    .from('appointments')
    .select('*, patients(id, full_name, color)')
    .eq('practitioner_id', practitionerId)
    .gte('scheduled_on', from)
    .lte('scheduled_on', to)
    .order('scheduled_on', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data
}

/** Today's appointments, for the dashboard. */
export async function listToday(practitionerId: string) {
  const today = toDateInput(new Date())
  return listAppointments(practitionerId, today, today)
}
