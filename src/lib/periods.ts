/**
 * Billing periods — "YYYY-MM".
 *
 * These live in `src/lib/` rather than beside the payment queries because a
 * Client Component needs them, and importing anything from `src/server/` into a
 * client bundle drags `db.ts` — and therefore `next/headers` — along with it.
 * The build catches that, loudly, but the fix is always this: the pure helper
 * belongs in `lib`.
 */

/** "2026-08" for the month containing `today`. */
export function currentPeriod(today = new Date()): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

/** Moves a period by whole months, wrapping the year. */
export function shiftPeriod(period: string, months: number): string {
  const [year, month] = period.split('-').map(Number)
  const date = new Date(year!, month! - 1 + months, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** "Agosto 2026" */
export function periodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number)
  const name = new Date(year!, month! - 1, 1).toLocaleDateString('es-UY', { month: 'long' })
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}
