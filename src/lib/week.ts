import { toDateInput, todayDate } from './dates'

/**
 * Weeks, Uruguayan style: Monday first.
 *
 * Postgres and JavaScript both number weekdays 0 = Sunday. That is the storage
 * convention and it stays in the database; every function here converts at the
 * boundary so nothing in the interface has to think about it.
 */

export const WEEKDAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const

/** Monday-first order, as weekday numbers. What the grid iterates over. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export function weekdayName(weekday: number) {
  return WEEKDAY_NAMES[weekday] ?? ''
}

/**
 * Cuántas semanas de distancia pidió la barra de direcciones, acotado.
 *
 * `/agenda?semana=` aceptaba cualquier entero finito, y eso eran dos problemas
 * en el mismo parámetro:
 *
 *   `semana=52` hacía que `materialiseAppointments` escribiera un año de
 *   sesiones de una sola carga — hasta unas 400 filas por horario, por visita a
 *   la página.
 *
 *   `semana=999999999` se pasaba del rango de `Date`, `toDateInput` devolvía
 *   `"NaN-NaN-NaN"`, eso entraba a un `.gte('scheduled_on', …)` y Postgres tiraba
 *   el error en la cara: pantalla rota desde la barra de direcciones.
 *
 * Dos años para cada lado. Es holgado para navegar de verdad —nadie agenda a
 * tres años— y deja el paso de tres semanas de materialización en algo acotado.
 * Un valor fuera de rango no es un error: se recorta y la Agenda muestra el
 * borde, que es lo que alguien tipeando en la URL espera ver.
 */
const MAX_WEEK_OFFSET = 104

export function weekOffsetFrom(param: string | string[] | undefined): number {
  const raw = typeof param === 'string' ? Number(param) : 0
  if (!Number.isFinite(raw)) return 0
  return Math.max(-MAX_WEEK_OFFSET, Math.min(MAX_WEEK_OFFSET, Math.trunc(raw)))
}

/** The Monday of the week `offset` weeks from the one containing `from`. */
export function mondayOf(from = todayDate(), offset = 0): Date {
  const day = from.getDay()
  return new Date(
    from.getFullYear(),
    from.getMonth(),
    // (day + 6) % 7 turns Sunday-first into "days since Monday".
    from.getDate() - ((day + 6) % 7) + offset * 7,
  )
}

/** The seven dates of that week, Monday first, as `YYYY-MM-DD`. */
export function weekDates(from = todayDate(), offset = 0): string[] {
  const monday = mondayOf(from, offset)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return toDateInput(date)
  })
}

/** "11 – 17 de agosto de 2026", or spanning two months where it does. */
export function weekLabel(dates: string[]): string {
  const first = dates[0]
  const last = dates[dates.length - 1]
  if (!first || !last) return ''

  const start = new Date(`${first}T00:00:00`)
  const end = new Date(`${last}T00:00:00`)
  const sameMonth = start.getMonth() === end.getMonth()

  const startText = start.toLocaleDateString('es-UY', {
    day: 'numeric',
    ...(sameMonth ? {} : { month: 'long' }),
  })
  const endText = end.toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `${startText} – ${endText}`
}

/** "09:00" from a Postgres `time`, which arrives as "09:00:00". */
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

/**
 * Una hora válida para agendar: "HH:MM" en punto, y cuarto, y media o menos
 * cuarto.
 *
 * La agenda se lee como una grilla de franjas. Algo a las 13:33 cae entre dos
 * líneas, así que para saber a qué hora era hay que leer el número igual, y dos
 * horarios que en la práctica son el mismo —13:30 y 13:33— se dibujan como dos.
 *
 * Vive acá porque la usan dos lados que no se conocen: la reserva pública y el
 * diálogo de agendar. El `step` del navegador es una comodidad que un formulario
 * hecho a mano no tiene por qué respetar; la regla es ésta.
 */
export const QUARTER_HOUR = /^([01]\d|2[0-3]):(00|15|30|45)$/

/** El mensaje de esa regla, uno solo para las dos pantallas. */
export const QUARTER_HOUR_MESSAGE =
  'Elegí una hora de a 15 minutos, por ejemplo 14:00 o 14:15.'

/** Desde y hasta dónde llega la lista de horas para elegir, en minutos. */
const FIRST_QUARTER = 6 * 60
const LAST_QUARTER = 22 * 60 + 45

/**
 * Todas las horas que se pueden elegir al agendar: de 06:00 a 22:45, de a
 * quince minutos.
 *
 * Es una lista y no un `<input type="time">` con `step` porque el `step` del
 * navegador se puede escribir por arriba —se tipea 13:33 y recién al enviar
 * aparece un cartel del sistema operativo, en el idioma del sistema operativo—
 * y porque los demás campos del mismo formulario (día, frecuencia, duración) ya
 * son listas. Elegir una hora es elegir de un conjunto, no escribir un número.
 *
 * El rango es ancho a propósito: alguien atiende a las 7:00 y alguien cierra a
 * las 22:00, y una lista que corta a las 20:00 deja a esas dos personas sin
 * poder agendar su propio horario.
 */
export const QUARTER_HOURS = Array.from(
  { length: (LAST_QUARTER - FIRST_QUARTER) / 15 + 1 },
  (_, index) => {
    const minutes = FIRST_QUARTER + index * 15
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  },
)

/**
 * La hora más cercana de `QUARTER_HOURS`.
 *
 * Es para el `defaultValue` de esas listas. Un valor que no esté entre las
 * opciones no deja el select vacío: el navegador muestra la primera, así que una
 * franja rara heredada de la URL se convertiría, sin decir nada, en las seis de
 * la mañana.
 */
export function snapToQuarterHour(time: string | null | undefined): string {
  const fallback = '09:00'
  if (!time) return fallback

  const minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
  if (!Number.isFinite(minutes)) return fallback

  const snapped = Math.round(minutes / 15) * 15
  const clamped = Math.min(Math.max(snapped, FIRST_QUARTER), LAST_QUARTER)
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

/**
 * A Google Calendar "add event" link.
 *
 * Ported from `legacy/index.html:1290`. Deliberately a link and not an
 * integration: it needs no OAuth client, no consent screen, no stored token, and
 * no Google Cloud project — the practitioner clicks it and Google opens with the
 * event filled in.
 *
 * Real two-way sync is a different feature with real setup behind it. This
 * covers what v1's sync was mostly used for and cannot break.
 */
export function googleCalendarLink({
  date,
  time,
  durationMinutes,
  title,
  details,
}: {
  date: string
  time: string
  durationMinutes: number
  title: string
  details?: string
}): string {
  const start = new Date(`${date}T${formatTime(time)}:00`)
  const end = new Date(start.getTime() + durationMinutes * 60_000)

  const pad = (value: number) => String(value).padStart(2, '0')
  const stamp = (date: Date) =>
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
  })
  if (details) params.set('details', details)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * La próxima fecha que cae en ese día de la semana, hoy incluido.
 *
 * El alta pregunta por un día de la semana —"los martes"—, que es lo que
 * necesita una regla que se repite. "Solo esta vez" no es una regla: es una
 * sesión sola, y una sesión sola necesita una fecha. Ésta es la traducción.
 *
 * Hoy cuenta: quien da de alta un paciente un martes de mañana lo está
 * agendando para esta tarde, no para dentro de siete días. Si la hora ya pasó,
 * la sesión queda agendada hoy más temprano — visible en la Agenda de hoy, que
 * es donde quien la agendó va a mirar.
 */
export function nextDateForWeekday(weekday: number, from = todayDate()): string {
  const date = new Date(from)
  date.setDate(from.getDate() + ((weekday - from.getDay() + 7) % 7))
  return toDateInput(date)
}
