/**
 * Dates, formatted the way they are read in Uruguay.
 *
 * `es-UY`, day before month, and always constructed with an explicit midnight
 * local time: `new Date('2026-08-11')` is parsed as UTC and renders as the 10th
 * for anyone west of Greenwich, which is all of Uruguay. Appending the time is
 * what stops a session recorded on Monday from displaying as Sunday.
 */

const LOCALE = 'es-UY'

/**
 * La zona horaria del país donde se usa Hilo.
 *
 * Adentro de la aplicación no hace falta: las horas se guardan como hora de
 * pared —`15:00` es las tres de la tarde— y se muestran igual. Hace falta en el
 * borde, cuando una hora sale hacia un sistema que no sabe dónde estamos.
 *
 * Google Calendar es ese caso. Se le manda la hora local con el nombre de la
 * zona al lado y él resuelve el resto. Convertir a UTC nosotros sería la otra
 * opción, y es la que se equivoca: un servidor en Oregon o en São Paulo restaría
 * su propio huso, no el de Uruguay, y las sesiones aparecerían corridas unas
 * horas sin que nada fallara.
 *
 * Uruguay no cambia la hora desde 2015, así que hoy es UTC-3 todo el año. El
 * nombre igual va por nombre y no por número: si algún día vuelve el horario de
 * verano, esto sigue estando bien y una constante `-03:00` no.
 */
export const TIME_ZONE = 'America/Montevideo'

function toLocalDate(value: string): Date {
  return value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`)
}

/** "11 ago 2026" */
export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null
  return toLocalDate(value).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "11 ago" — for lists where the year is obvious from context. */
export function formatDayMonth(value: string | null | undefined): string | null {
  if (!value) return null
  return toLocalDate(value).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' })
}

/** "martes 11 de agosto" */
export function formatLongDate(value: string | null | undefined): string | null {
  if (!value) return null
  return toLocalDate(value).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "2026-08-11" — what a `date` column and an `<input type="date">` both want. */
export function toDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Un instante, descompuesto en las partes de calendario que tiene en Uruguay.
 *
 * Esta es la única forma correcta de preguntarle la fecha al reloj, y existe
 * porque `toDateInput(new Date())` —que es lo que se escribe sin pensar— hace
 * otra cosa: lee el huso del **servidor**. En Vercel eso es UTC, y entre las
 * 21:00 y la medianoche de Uruguay el servidor ya está en el día siguiente. La
 * sesión que una profesional escribe a las 22:00 del lunes queda fechada el
 * martes, y nada falla.
 *
 * `Intl.DateTimeFormat` con la zona explícita es lo que hace la conversión bien,
 * sin importar dónde corra esto. `hourCycle: 'h23'` y no `hour12: false`: el
 * segundo devuelve "24" para la medianoche en algunos entornos, y "24:00:00" no
 * es una hora válida para Postgres.
 */
export function zonedParts(at: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at)

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}:00`,
  }
}

/** Hoy en Uruguay, corra esto donde corra. */
export function today(): string {
  return zonedParts(new Date()).date
}

/**
 * Un instante, como fecha flotante de Uruguay, para sembrar aritmética de
 * calendario.
 *
 * La diferencia con `today()` no es de tipo, es de convención. Lo que devuelve
 * es una fecha *flotante*: medianoche local de un día que ya fue elegido con la
 * zona correcta. Desde ahí, `mondayOf`, `setDate` y `toDateInput` siguen siendo
 * aritmética de calendario pura y no vuelven a tocar el reloj — que es
 * exactamente lo que tienen que hacer.
 *
 * Por eso `toDateInput` no se volvió zona-consciente y no hay que volverlo:
 * recibe fechas flotantes construidas así, y leerlas con la zona las correría un
 * día para atrás. El huso se resuelve una sola vez, acá, en el borde.
 */
export function zonedDate(at: Date): Date {
  return new Date(`${zonedParts(at).date}T00:00:00`)
}

/** Hoy en Uruguay, como fecha flotante. Ver `zonedDate`. */
export function todayDate(): Date {
  return zonedDate(new Date())
}

/**
 * El instante en que empezó un día en Uruguay.
 *
 * Hace falta para comparar contra una columna `timestamptz` — `created_at`, y
 * por lo tanto la cuota mensual. Una fecha suelta como `"2026-09-01T00:00:00"`
 * no sirve: Postgres la interpreta en su propia zona, que es UTC, y el mes
 * empieza tres horas antes de lo que debería.
 *
 * El desplazamiento se pregunta por nombre y no se escribe a mano. Uruguay hoy
 * es UTC-3 todo el año, pero ver `TIME_ZONE`: si algún día vuelve el horario de
 * verano, esto sigue estando bien y un `-03:00` constante no. El mediodía UTC es
 * a propósito como instante de sondeo — cae lejos de cualquier salto de huso.
 */
export function startOfDayInUruguay(date: string): Date {
  const name =
    new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, timeZoneName: 'longOffset' })
      .formatToParts(new Date(`${date}T12:00:00Z`))
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00'

  // "GMT-03:00" → "-03:00". Una zona parada en UTC devuelve "GMT" pelado.
  const offset = name.replace('GMT', '') || '+00:00'

  return new Date(`${date}T00:00:00${offset}`)
}
