import { describe, expect, it } from 'vitest'

import { today, toDateInput, todayDate } from '@/lib/dates'

import { PublicBooking } from './booking'

/**
 * What the public booking form accepts (P7).
 *
 * The form is reachable by anyone, so the browser's `step` and `min` are a
 * courtesy; these are the rules. A date, not a weekday, and quarter hours.
 */

function shift(days: number) {
  const date = todayDate()
  date.setDate(date.getDate() + days)
  return toDateInput(date)
}

const base = { name: 'Familia Pérez', phone: '099 123 456' }

function messageFor(input: Record<string, unknown>) {
  const result = PublicBooking.safeParse({ ...base, ...input })
  return result.success ? null : result.error.issues[0]?.message
}

describe('PublicBooking', () => {
  it('takes a date from today on and a quarter-hour time', () => {
    const data = PublicBooking.parse({ ...base, preferredDate: shift(6), preferredTime: '14:15' })

    expect(data.preferredDate).toBe(shift(6))
    expect(data.preferredTime).toBe('14:15')
  })

  it('takes today', () => {
    expect(messageFor({ preferredDate: today() })).toBeNull()
  })

  it('refuses the 14:37, and says how to fix it', () => {
    expect(messageFor({ preferredTime: '14:37' })).toBe(
      'Elegí una hora de a 15 minutos, por ejemplo 14:00 o 14:15.',
    )
  })

  it('refuses a date that already passed', () => {
    expect(messageFor({ preferredDate: shift(-1) })).toBe('Elegí una fecha de hoy en adelante.')
  })

  it('refuses a date more than a year away', () => {
    expect(messageFor({ preferredDate: shift(400) })).toBe(
      'Elegí una fecha dentro del próximo año.',
    )
  })

  it('entra sin día de la semana, que es lo que manda el formulario nuevo', () => {
    // The form stopped sending `preferredWeekday` at all. A schema that still
    // required the key refused every booking made from it.
    const data = PublicBooking.parse({ ...base, preferredDate: shift(6), preferredTime: '10:00' })

    expect(data.preferredWeekday).toBeNull()
  })

  it('still takes a weekday from a page cached before the change', () => {
    expect(PublicBooking.parse({ ...base, preferredWeekday: '2' }).preferredWeekday).toBe(2)
    expect(PublicBooking.parse({ ...base, preferredWeekday: '' }).preferredWeekday).toBeNull()
  })

  it('leaves both out when the family did not say', () => {
    const data = PublicBooking.parse({ ...base, preferredDate: '', preferredTime: '' })

    expect(data.preferredDate).toBeNull()
    expect(data.preferredTime).toBeNull()
  })
})
