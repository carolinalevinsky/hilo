import { calendarEventTitle } from '@/lib/calendar-privacy'
import { TIME_ZONE, zonedParts } from '@/lib/dates'

import { getDb } from './db'
import { connectionFor, pullStateFor, saveSyncPoint } from './google'

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

/** Guarda contra un `nextPageToken` que no avanza. 250 por página. */
const MAX_SYNC_PAGES = 40

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

/**
 * Una hora que vuelve de Google, leída como la lee alguien en Uruguay.
 *
 * Google devuelve `2026-08-24T15:00:00-03:00`. La tentación es
 * `new Date(...).getHours()`, y ahí está el error que no avisa: `getHours()`
 * devuelve la hora **del servidor**, que en Vercel es UTC. Las tres de la tarde
 * en Montevideo se guardarían como las seis, en todas las sesiones, y nada
 * fallaría.
 *
 * El `Intl.DateTimeFormat` que hace bien esa conversión vivía acá, y era el
 * único lugar de la aplicación que la hacía bien. Ahora es `zonedParts` en
 * `src/lib/dates.ts`, donde lo alcanza el resto del código — que cometía este
 * mismo error en la agenda, en las estadísticas y en la cuota mensual.
 */
export function toLocalDateTime(iso: string): { date: string; time: string } {
  return zonedParts(new Date(iso))
}

/** Cuántos minutos dura, redondeando hacia arriba al minuto. */
export function minutesBetween(startIso: string, endIso: string): number {
  const millis = new Date(endIso).getTime() - new Date(startIso).getTime()
  return Math.max(5, Math.round(millis / 60_000))
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
    // `.eq('practitioner_id', …)` además del id, como las otras cuatro consultas
    // de este archivo. Hoy RLS ya lo acota y sin esto tampoco filtraba nada —
    // pero es la única función del archivo que recibe `practitionerId` y no lo
    // usa, y eso se vuelve una fuga el día que alguien la llame desde un
    // contexto con clave de servicio: un cron de reconciliación que empuje a
    // Google las citas pendientes de todas escribiría el nombre de un paciente
    // ajeno en el calendario equivocado.
    db
      .from('patients')
      .select('full_name')
      .eq('id', appointment.patient_id)
      .eq('practitioner_id', practitionerId)
      .maybeSingle(),
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

export type GoogleEvent = {
  id?: string
  status?: string
  /** El título. Sólo lo lee `listBusyBlocks`; la sincronización no lo mira. */
  summary?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  extendedProperties?: { private?: Record<string, string> }
}

/**
 * Trae de Google lo que cambió y lo aplica en Hilo.
 *
 * ─── La regla, y no se negocia ─────────────────────────────────────────────
 *
 * **Borrar un evento en Google nunca borra una sesión en Hilo.** Cancela el
 * horario y nada más. La nota clínica es lo que después lee la IA para armar un
 * informe, y es lo único de todo esto que no se puede volver a escribir. Un dedo
 * torpe en el celular, en el auto, no puede llevarse eso puesto.
 *
 * Por eso la cancelación acá es un `update` de estado y jamás un `delete`.
 *
 * ─── Qué se toca y qué no ──────────────────────────────────────────────────
 *
 * Sólo los eventos que Hilo creó, reconocidos por la marca que se les puso al
 * escribirlos. El almuerzo, el cumpleaños y la reunión del consorcio quedan
 * donde están: tocar lo que no es nuestro sería peor que no sincronizar.
 *
 * ─── Por qué se pregunta en vez de que Google avise ────────────────────────
 *
 * Preguntar al abrir la Agenda da el mismo resultado que las notificaciones push
 * —moviste algo en el celular, lo ves al entrar— con muchísima menos maquinaria:
 * sin endpoint público, sin canales que vencen cada semana, sin un cron que los
 * renueve y sin un séptimo lugar con clave de servicio. El día que la demora
 * moleste, el push se agrega encima de esto sin rehacer nada.
 */
export async function pullFromGoogle(practitionerId: string): Promise<number> {
  const state = await pullStateFor(practitionerId)
  if (!state || !state.dueForPull) return 0

  const connection = await connectionFor(practitionerId)
  if (!connection) return 0

  const applied = await pullOnce(
    practitionerId,
    connection.accessToken,
    connection.calendarId,
    state.syncToken,
  )

  return applied
}

async function pullOnce(
  practitionerId: string,
  accessToken: string,
  calendarId: string,
  syncToken: string | null,
  retriedFromScratch = false,
  pageToken?: string,
  pageGuard = 0,
): Promise<number> {
  const params = new URLSearchParams({ maxResults: '250', showDeleted: 'true' })

  if (pageToken) params.set('pageToken', pageToken)

  if (syncToken) {
    params.set('syncToken', syncToken)
  } else {
    // La primera vez, o después de que el punto caducó: sólo desde hoy hacia
    // adelante. El pasado ya sucedió y reescribirlo con lo que diga un calendario
    // sería cambiar historia clínica por un arrastre de mouse.
    params.set('timeMin', new Date().toISOString())
    params.set('singleEvents', 'true')
  }

  const response = await callGoogle(
    accessToken,
    `${calendarId}/events?${params.toString()}`,
    { method: 'GET' },
  )

  if (!response) return 0

  // 410: el punto de sincronización caducó. Google lo dice así y la respuesta es
  // empezar de nuevo, una sola vez — reintentar en bucle contra un 410 sería un
  // bucle.
  if (response.status === 410 && !retriedFromScratch) {
    await saveSyncPoint(practitionerId, null)
    return pullOnce(practitionerId, accessToken, calendarId, null, true)
  }

  if (!response.ok) return 0

  const payload = (await response.json()) as {
    items?: GoogleEvent[]
    nextSyncToken?: string
    nextPageToken?: string
  }

  let applied = 0
  for (const event of payload.items ?? []) {
    if (await applyEvent(practitionerId, event)) applied += 1
  }

  // ─── Por qué hay que leer `nextPageToken` ─────────────────────────────────
  //
  // Con más de 250 cambios, Google devuelve una página y un `nextPageToken`, y
  // **no** manda `nextSyncToken` hasta la última. Sin esto pasaban dos cosas a
  // la vez y las dos en silencio: las páginas siguientes no se pedían nunca, y
  // el punto de sincronización se guardaba en `null`, así que la pasada
  // siguiente arrancaba de cero desde hoy. Todo lo del medio se perdía.
  //
  // Se dispara justo cuando más duele: la primera sincronización de una agenda
  // cargada, que es la que decide si la profesional confía en esto.
  //
  // El tope de páginas es una guarda, no un límite: 250 por página son 10.000
  // cambios, que es muchísimo más que cualquier pasada real. Existe para que un
  // token que vuelve sobre sí mismo no gire para siempre contra la API de
  // Google. Si se llega ahí, no se guarda punto nuevo y la próxima pasada
  // retoma — mejor lento que salteado.
  if (payload.nextPageToken) {
    if (pageGuard >= MAX_SYNC_PAGES) {
      console.warn('[google] la sincronización superó el tope de páginas', {
        practitionerId,
        pages: pageGuard,
      })
      return applied
    }

    return (
      applied +
      (await pullOnce(
        practitionerId,
        accessToken,
        calendarId,
        syncToken,
        retriedFromScratch,
        payload.nextPageToken,
        pageGuard + 1,
      ))
    )
  }

  await saveSyncPoint(practitionerId, payload.nextSyncToken ?? null)
  return applied
}

async function applyEvent(
  practitionerId: string,
  event: GoogleEvent,
): Promise<boolean> {
  const appointmentId = event.extendedProperties?.private?.hilo_appointment_id
  if (!appointmentId) return false

  const db = await getDb()

  if (event.status === 'cancelled') {
    // Cancela el horario. NO borra la sesión. Ver la regla arriba.
    const { error } = await db
      .from('appointments')
      .update({ status: 'cancelled', gcal_event_id: null })
      .eq('id', appointmentId)
      .eq('practitioner_id', practitionerId)

    return !error
  }

  const startIso = event.start?.dateTime
  const endIso = event.end?.dateTime

  // Un evento de día entero no tiene hora. Si alguien arrastró una sesión hasta
  // la franja de "todo el día", no hay ninguna hora que copiar y adivinar una
  // sería peor que dejar la que estaba.
  if (!startIso || !endIso) return false

  const { date, time } = toLocalDateTime(startIso)

  const { error } = await db
    .from('appointments')
    .update({
      scheduled_on: date,
      start_time: time,
      duration_minutes: minutesBetween(startIso, endIso),
    })
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)

  if (error) return false

  // Y se levanta la cancelación, si la había.
  //
  // Un evento borrado en Google y después restaurado vuelve por acá. Sin esto se
  // le actualizaba la fecha y la hora pero no el estado, así que la sesión
  // existía, decía cuándo era, y seguía tachada en Hilo para siempre.
  //
  // El `.eq('status', 'cancelled')` es lo que lo hace seguro: sólo levanta la
  // cancelación que este mismo archivo escribió. Un "vino" o un "no vino" los
  // puso una persona en Hilo, Google no sabe nada de eso, y no se tocan. Un
  // evento cancelado ya salió por el camino de arriba, así que llegar hasta acá
  // significa que en Google existe.
  await db
    .from('appointments')
    .update({ status: 'scheduled' })
    .eq('id', appointmentId)
    .eq('practitioner_id', practitionerId)
    .eq('status', 'cancelled')

  return true
}

/**
 * Lo que ya está ocupado en el calendario de Google, para pintarlo en la Agenda.
 *
 * Es lo contrario de `pullFromGoogle`: aquél sincroniza **sólo** lo que Hilo
 * creó, y esto trae **sólo** lo que Hilo no creó. Juntos cubren el calendario
 * entero sin pisarse — un evento aparece como sesión o como bloque ocupado,
 * nunca como los dos.
 *
 * ─── Por qué no se guarda nada ─────────────────────────────────────────────
 *
 * Estos eventos no van a `appointments` y no van a ninguna tabla. Dos razones,
 * y la segunda es la que manda:
 *
 * 1. `appointments.patient_id` es obligatorio, y "cena familiar" no es paciente
 *    de nadie. Inventar uno ficticio metería la agenda personal adentro de la
 *    historia clínica, que después es lo que leen los informes y las
 *    estadísticas.
 *
 * 2. El título de un evento personal es dato de la profesional, no de Hilo.
 *    Mostrarlo en su propia pantalla es una cosa; copiarlo a la base de datos de
 *    una aplicación clínica es otra, y no hay ninguna necesidad que lo pida.
 *
 * Se leen, se dibujan, se olvidan.
 *
 * Vale la misma regla que el resto del archivo: si Google falla, esto devuelve
 * una lista vacía y la Agenda se ve como se veía antes de conectar. Nunca tira.
 */
export type BusyBlock = {
  id: string
  title: string
  /** 'YYYY-MM-DD', ya en hora de Montevideo. */
  date: string
  /** 'HH:MM:SS', o null si es un evento de todo el día. */
  startTime: string | null
  endTime: string | null
}

export async function listBusyBlocks(
  practitionerId: string,
  from: string,
  to: string,
): Promise<BusyBlock[]> {
  const connection = await connectionFor(practitionerId)
  if (!connection) return []

  // La ventana se pide con un día de más de cada lado, en UTC, y después se
  // filtra por fecha local. Es a propósito: armar el instante exacto en que
  // empieza el lunes en Montevideo obliga a calcular un desplazamiento horario a
  // mano, y esa cuenta es justo la que se rompe sola. Traer de más y descartar
  // con `toLocalDateTime` —la misma función que ya usa el resto del archivo— da
  // el mismo resultado sin ninguna aritmética de zonas.
  const dayBefore = new Date(`${from}T00:00:00Z`)
  dayBefore.setUTCDate(dayBefore.getUTCDate() - 1)
  const dayAfter = new Date(`${to}T00:00:00Z`)
  dayAfter.setUTCDate(dayAfter.getUTCDate() + 2)

  const params = new URLSearchParams({
    timeMin: dayBefore.toISOString(),
    timeMax: dayAfter.toISOString(),
    // Una reunión semanal es un evento con una regla de repetición. Sin esto
    // Google devuelve la regla, no los martes; con esto devuelve cada martes.
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const response = await callGoogle(
    connection.accessToken,
    `${connection.calendarId}/events?${params.toString()}`,
    { method: 'GET' },
  )

  if (!response || !response.ok) return []

  try {
    const payload = (await response.json()) as { items?: GoogleEvent[] }
    return toBusyBlocks(payload.items ?? [], from, to)
  } catch {
    return []
  }
}

/**
 * La parte de `listBusyBlocks` que decide qué se muestra y cómo, separada de la
 * que habla por HTTP para poder probarla sin una cuenta de Google del otro lado
 * — el mismo criterio que explica `eventBody` más arriba.
 *
 * Acá viven las cuatro decisiones que importan: qué se descarta, qué pasa con un
 * evento de todo el día, y cómo se lleva una hora de Google a hora de
 * Montevideo.
 */
export function toBusyBlocks(
  items: GoogleEvent[],
  from: string,
  to: string,
): BusyBlock[] {
  const blocks: BusyBlock[] = []

  for (const event of items) {
    if (event.status === 'cancelled') continue

    // Lo que Hilo escribió ya está en la grilla como sesión, con su paciente y
    // su menú. Mostrarlo otra vez como bloque gris sería el mismo horario dos
    // veces.
    if (event.extendedProperties?.private?.hilo_appointment_id) continue

    const startIso = event.start?.dateTime

    // Evento de todo el día: viene con `date` en vez de `dateTime` y no tiene
    // hora que ubicar en la grilla. Se muestra igual, anclado arriba del día.
    if (!startIso) {
      const allDay = event.start?.date
      if (!allDay || allDay < from || allDay > to) continue
      blocks.push({
        id: event.id ?? allDay,
        title: event.summary?.trim() || 'Ocupado',
        date: allDay,
        startTime: null,
        endTime: null,
      })
      continue
    }

    // La ventana se pidió con un día de más de cada lado; el recorte fino se
    // hace acá, ya en hora local. Ver el comentario en `listBusyBlocks`.
    const start = toLocalDateTime(startIso)
    if (start.date < from || start.date > to) continue

    const endIso = event.end?.dateTime

    blocks.push({
      id: event.id ?? `${start.date}-${start.time}`,
      title: event.summary?.trim() || 'Ocupado',
      date: start.date,
      startTime: start.time,
      endTime: endIso ? toLocalDateTime(endIso).time : null,
    })
  }

  return blocks
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
