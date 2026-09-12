/**
 * The slot clicked in the week grid, read back from the URL (P6).
 *
 * Thomas's QA: scheduling meant opening the dialog and typing both the date and
 * the time, where any calendar lets you click the slot. The grid's empty half
 * hours are links to `/agenda?agendar=<date>&hora=<hh:mm>`, and the page opens
 * the dialog with those two already filled in.
 *
 * The values come from a URL anyone can type, so anything that is not a real
 * date and an on-the-hour or half-past time is dropped — the page then opens
 * with no dialog, which is what it did before.
 */
export type AgendaSlot = { date: string; time: string }

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const HALF_HOUR = /^([01]\d|2[0-3]):(00|30)$/

export function readAgendaSlot(date: unknown, time: unknown): AgendaSlot | null {
  if (typeof date !== 'string' || typeof time !== 'string') return null
  if (!HALF_HOUR.test(time)) return null

  const match = DATE.exec(date)
  if (!match) return null
  const [, year, month, day] = match.map(Number) as [number, number, number, number]
  // `new Date` rolls 2026-02-30 over to March; a real date survives the round trip.
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null
  }

  return { date, time }
}

/** 0 = Sunday, as in `schedules.weekday` and JavaScript. */
export function slotWeekday(slot: AgendaSlot): number {
  const [year, month, day] = slot.date.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}
