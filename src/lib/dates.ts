/**
 * Dates, formatted the way they are read in Uruguay.
 *
 * `es-UY`, day before month, and always constructed with an explicit midnight
 * local time: `new Date('2026-08-11')` is parsed as UTC and renders as the 10th
 * for anyone west of Greenwich, which is all of Uruguay. Appending the time is
 * what stops a session recorded on Monday from displaying as Sunday.
 */

const LOCALE = 'es-UY'

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

export function today(): string {
  return toDateInput(new Date())
}
