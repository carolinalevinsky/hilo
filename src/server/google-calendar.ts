import { calendarEventTitle } from '@/lib/calendar-privacy'
import { TIME_ZONE } from '@/lib/dates'

import { getDb } from './db'
import { connectionFor } from './google'

/**
 * Escribir en el calendario de Google lo que pasa en Hilo.
 *
 * Aparte de `google.ts` a propósito: aquél guarda la credencial que no vence y
 * es el sexto lugar del proyecto con clave de servicio; éste sólo recibe un
 * token de una hora y habla por HTTP. Mantenerlos separados es lo que evita que
 * el permiso más alto se le pegue a un archivo que va a crecer.
 *
 * ─── La regla que gobierna todo este archivo ───────────────────────────────
 *
 * **Que Google falle no puede impedir agendar.** Si la cuenta no está conectada,
 * si el token no sirve, si Google está caído o tarda: la sesión se guarda igual
 * en Hilo y estas funciones se van en silencio. Un consultorio no puede quedarse
 * sin poder anotar una hora porque una empresa de otro país tuvo un mal día.
 *
 * Lo que no significa perder el cambio. Una sesión que no llegó a Google queda
 * con `gcal_event_id` en null, y eso es exactamente lo que después busca la
 * reconciliación para mandarla. El silencio de acá es "todavía no", no "nunca".
 */

const API = 'https://www.googleapis.com/calendar/v3/calendars'

type AppointmentForSync = {
  id: string
  patient_id: string
  scheduled_on: string
  start_time: string
  duration_minutes: number
  gcal_event_id: string | null
}

/** "15:00:00" o "15:00" → "15:00:00", que es lo que espera Google. */
function withSeconds(time: string): string {
  return time.length === 5 ? `${time}:00` : time
}

function endOf(date: string, time: string, minutes: number): string {
  const start = new Date(`${date}T${withSeconds(time)}`)
  const end = new Date(start.getTime() + minutes * 60_000)

  const pad = (value: number) => String(value).padStart(2, '0')
  return (
    `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}` +
    `T${pad(end.getHours())}:${pad(end.getMinutes())}:00`
  )
}

/**
 * El cuerpo del evento.
 *
 * Nada de esto lleva contenido clínico. El título sale de lo que la profesional
 * eligió en su perfil —"Ocupado", iniciales o nombre de pila— y la descripción
 * es una frase fija. La nota de la sesión, el motivo de consulta y los objetivos
 * no aparecen acá, y no hay configuración que los agregue.
 *
 * La hora va como hora de pared con el nombre de la zona al lado. Ver
 * `TIME_ZONE` en `src/lib/dates.ts` para por qué no se convierte a UTC.
 */
export function eventBody(appointment: AppointmentForSync, title: string) {
  return {
    summary: title,
    description: 'Agendado desde Hilo',
    start: {
      dateTime: `${appointment.scheduled_on}T${withSeconds(appointment.start_time)}`,
      timeZone: TIME_ZONE,
    },
    end: {
      dateTime: endOf(
        appointment.scheduled_on,
        appointment.start_time,
        appointment.duration_minutes,
      ),
      timeZone: TIME_ZONE,
    },
    // Para reconocer del otro lado qué eventos son nuestros. La sincronización
    // de vuelta lo necesita: sin esto no habría forma de distinguir una sesión
    // de Hilo de un almuerzo que la profesional agendó a mano, y tocar lo que no
    // es nuestro sería peor que no sincronizar.
    extendedProperties: {
      private: { hilo_appointment_id: appointment.id },
    },
  }
}

async function callGoogle(
  accessToken: string,
  path: string,
  init: { method: string; body?: unknown },
): Promise<Response | null> {
  try {
    return await fetch(`${API}/${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    })
  } catch {
    // Ver la regla de arriba: agendar no se cae porque la red falle.
    return null
  }
}

/**
 * Manda una sesión a Google: la crea si es nueva, la actualiza si ya estaba.
 *
 * Devuelve `true` sólo si Google la aceptó. Nadie tiene que esperar ese
 * resultado para seguir — se devuelve para que la reconciliación pueda contar
 * cuántas entraron.
 */
export async function pushAppointment(
  practitionerId: string,
  appointmentId: string,
): Promise<boolean> {
  const connection = await connectionFor(practitionerId)
  if (!connection) return false

  const db = await getDb()

  const { data: appointment } = await db
    .from('appointments')
    .select('id, patient_id, scheduled_on, start_time, duration_minutes, gcal_event_id')
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (!appointment) return false

  const [{ data: patient }, { data: practitioner }] = await Promise.all([
    db.from('patients').select('full_name').eq('id', appointment.patient_id).maybeSingle(),
    db
      .from('practitioners')
      .select('calendar_privacy')
      .eq('id', practitionerId)
      .maybeSingle(),
  ])

  if (!patient) return false

  const title = calendarEventTitle(patient.full_name, practitioner?.calendar_privacy)
  const body = eventBody(appointment, title)

  const existing = appointment.gcal_event_id
  const response = await callGoogle(
    connection.accessToken,
    existing
      ? `${connection.calendarId}/events/${existing}`
      : `${connection.calendarId}/events`,
    { method: existing ? 'PATCH' : 'POST', body },
  )

  if (!response) return false

  // 404 y 410: el evento existía para Hilo y ya no del lado de Google — lo
  // borraron a mano. Se limpia el id y se crea de cero, porque insistir contra
  // un evento que no está es fallar para siempre en silencio.
  if (existing && (response.status === 404 || response.status === 410)) {
    await db
      .from('appointments')
      .update({ gcal_event_id: null })
      .eq('id', appointmentId)
      .eq('practitioner_id', practitionerId)

    return pushAppointment(practitionerId, appointmentId)
  }

  if (!response.ok) return false

  if (!existing) {
    const created = (await response.json()) as { id?: string }
    if (!created.id) return false

    await db
      .from('appointments')
      .update({ gcal_event_id: created.id })
      .eq('id', appointmentId)
      .eq('practitioner_id', practitionerId)
  }

  return true
}

/**
 * Saca de Google una sesión que se canceló o se quitó de la agenda.
 *
 * Borra el evento en vez de marcarlo cancelado: un evento cancelado de Google
 * sigue ocupando su lugar en la grilla, tachado, y una agenda llena de horas
 * tachadas no se lee. En Hilo la cancelación queda registrada igual, que es
 * donde importa.
 *
 * El `gcal_event_id` se limpia pase lo que pase. Si Google no contestó, el
 * evento puede quedar allá huérfano — molesto, pero preferible a que Hilo crea
 * que sigue existiendo y después intente actualizar algo que no controla.
 */
export async function removeAppointment(
  practitionerId: string,
  appointmentId: string,
): Promise<void> {
  const db = await getDb()

  const { data: appointment } = await db
    .from('appointments')
    .select('gcal_event_id')
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (!appointment?.gcal_event_id) return

  const connection = await connectionFor(practitionerId)
  if (connection) {
    await callGoogle(
      connection.accessToken,
      `${connection.calendarId}/events/${appointment.gcal_event_id}`,
      { method: 'DELETE' },
    )
  }

  await db
    .from('appointments')
    .update({ gcal_event_id: null })
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
}
