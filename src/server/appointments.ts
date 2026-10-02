import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { today } from '@/lib/dates'
import { QUARTER_HOUR, QUARTER_HOUR_MESSAGE } from '@/lib/week'

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
 *
 * Tres archivos: la regla en `schedules.ts`, cómo se vuelve fechas en
 * `occurrences.ts`, y acá cada sesión en la agenda. Era uno solo de 729 líneas.
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

/**
 * La hora a la que empieza algo, siempre en un cuarto de hora.
 *
 * Es la misma regla que ya tenía la reserva pública, ahora compartida: ver
 * `QUARTER_HOUR` en `src/lib/week.ts` por el porqué.
 *
 * El diálogo de agendar ofrece nada más que :00, :15, :30 y :45, pero un
 * formulario se postea sin pasar por el diálogo, así que la regla vive acá. De
 * paso se aprieta el rango: `\d{2}:\d{2}` aceptaba 99:99, y eso lo rechazaba
 * Postgres después, con un error que no le dice nada a nadie.
 */
const QuarterHour = z.string().regex(QUARTER_HOUR, QUARTER_HOUR_MESSAGE)

export const ScheduleInput = z.object({
  patientId: z.uuid('Elegí un paciente.'),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: QuarterHour,
  durationMinutes: z.coerce.number().int().min(5).max(480).default(45),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']).default('weekly'),
  startsOn: z.iso.date().default(() => today()),
})

export const AppointmentInput = z.object({
  patientId: z.uuid('Elegí un paciente.'),
  scheduledOn: z.iso.date('Revisá la fecha.'),
  startTime: QuarterHour,
  durationMinutes: z.coerce.number().int().min(5).max(480).default(45),
  note: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
})

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

  // Primero se sacan de Google. Se borraban sólo acá, y los eventos quedaban
  // en el calendario de la profesional con el nombre o las iniciales de un
  // paciente que acaba de pedir que lo borren.
  const { data: synced } = await db
    .from('appointments')
    .select('id')
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .eq('status', 'scheduled')
    .gte('scheduled_on', today())
    .not('gcal_event_id', 'is', null)

  for (const { id } of synced ?? []) {
    await removeAppointment(practitionerId, id)
  }

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
 * Una cita por su id, o `null`.
 *
 * Para Planificación, que la recibe de la URL (`?sesion=`) desde "Preparar" en
 * la Agenda. La Agenda pagina semanas hacia adelante sin límite, así que puede
 * ser una sesión que el selector de Planificación no alcanza a listar.
 *
 * Lo que no es un uuid se descarta antes de preguntarle a Postgres, igual que en
 * `getAppointmentFor`.
 */
export async function getAppointment(
  practitionerId: string,
  appointmentId: string,
): Promise<(NextAppointment & { patient_id: string }) | null> {
  if (!z.uuid().safeParse(appointmentId).success) return null

  const db = await getDb()
  const { data, error } = await db
    .from('appointments')
    .select('id, patient_id, scheduled_on, start_time')
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return data
}

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

// ─── Appointments ───────────────────────────────────────────────────────────

/**
 * Whether this practitioner has anything on the agenda yet, ever.
 *
 * For "Primeros pasos" on Inicio (P21), the same way `hasAnyGoal` is: `head:
 * true` reads an index and returns no rows.
 */
export async function hasAnyAppointment(practitionerId: string): Promise<boolean> {
  const db = await getDb()
  const { count, error } = await db
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .limit(1)

  if (error) throw error
  return (count ?? 0) > 0
}

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

/**
 * Lo que el planificador necesita saber de la sesión que está preparando: la
 * nota previa y cuánto dura.
 *
 * Las dos juntas en una lectura porque se piden juntas, en la misma pantalla y
 * en el mismo momento. La nota es la misma que se escribe al agendar
 * (`appointments.note`); el largo es contra lo que se suma el plan.
 *
 * Es la misma nota que se escribe al agendar: `appointments.note`. No hay una
 * "nota del plan" aparte a propósito — dos campos que quieren decir lo mismo
 * terminan diciendo cosas distintas, y quien agendó el martes esperaría ver el
 * viernes lo que escribió.
 */
export async function planSessionContext(
  practitionerId: string,
  appointmentId: string,
): Promise<{ note: string | null; durationMinutes: number | null }> {
  const db = await getDb()
  const { data, error } = await db
    .from('appointments')
    .select('note, duration_minutes')
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return { note: data?.note ?? null, durationMinutes: data?.duration_minutes ?? null }
}

const AppointmentNote = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value ? value : null))

export async function setAppointmentNote(
  practitionerId: string,
  appointmentId: string,
  note: unknown,
) {
  const value = AppointmentNote.parse(note ?? '')
  const db = await getDb()

  const { error } = await db
    .from('appointments')
    .update({ note: value })
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'update', 'appointment', appointmentId)

  // Sin tocar Google: el evento que se crea allá lleva la hora y el paciente,
  // y su descripción es fija (`google-calendar.ts:72`). La nota es clínica y no
  // tiene por qué salir de Ombúa a un calendario que puede estar compartido.
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

