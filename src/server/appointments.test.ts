import { describe, expect, it } from 'vitest'

import { occurrencesBetween } from './appointments'

/**
 * Recurrence arithmetic.
 *
 * Worth testing on its own because it fails silently: a biweekly rule counted
 * from the wrong anchor produces a perfectly plausible agenda that is one week
 * out, and nobody notices until a family arrives to a locked door.
 *
 * 2026-08-03 is a Monday. Weekday numbers are Postgres/JavaScript's, 0 = Sunday.
 */
const MONDAY = 1

describe('occurrencesBetween', () => {
  it('repeats weekly', () => {
    const dates = occurrencesBetween(
      { weekday: MONDAY, frequency: 'weekly', starts_on: '2026-08-03', ends_on: null },
      '2026-08-03',
      '2026-08-31',
    )
    expect(dates).toEqual([
      '2026-08-03',
      '2026-08-10',
      '2026-08-17',
      '2026-08-24',
      '2026-08-31',
    ])
  })

  it('counts a biweekly rule from its anchor, not from the window', () => {
    // The rule anchored on Monday the 3rd implies the 3rd, 17th and 31st.
    // Asking for a window that starts on the 9th must still return those — not
    // restart the fortnight from the first Monday inside the window, which would
    // silently shift every future session by a week.
    const dates = occurrencesBetween(
      { weekday: MONDAY, frequency: 'biweekly', starts_on: '2026-08-03', ends_on: null },
      '2026-08-09',
      '2026-08-31',
    )
    expect(dates).toEqual(['2026-08-17', '2026-08-31'])
  })

  it('treats monthly as four weeks, keeping the slot', () => {
    // "Once a month" for a standing session means the same weekday and time. A
    // calendar-month rule would drift onto a Thursday.
    const dates = occurrencesBetween(
      { weekday: MONDAY, frequency: 'monthly', starts_on: '2026-08-03', ends_on: null },
      '2026-08-01',
      '2026-10-31',
    )
    expect(dates).toEqual(['2026-08-03', '2026-08-31', '2026-09-28', '2026-10-26'])
  })

  it('moves the anchor forward to the first matching weekday', () => {
    // The rule was created on a Wednesday for a Monday slot: the first session
    // is the Monday after, not the day it was typed.
    const dates = occurrencesBetween(
      { weekday: MONDAY, frequency: 'weekly', starts_on: '2026-08-05', ends_on: null },
      '2026-08-01',
      '2026-08-20',
    )
    expect(dates).toEqual(['2026-08-10', '2026-08-17'])
  })

  it('stops at ends_on', () => {
    const dates = occurrencesBetween(
      {
        weekday: MONDAY,
        frequency: 'weekly',
        starts_on: '2026-08-03',
        ends_on: '2026-08-14',
      },
      '2026-08-01',
      '2026-08-31',
    )
    expect(dates).toEqual(['2026-08-03', '2026-08-10'])
  })

  it('sigue generando para un horario de hace muchos años', () => {
    // La guarda de 400 vueltas se contaba desde `starts_on`, así que la gastaba
    // el tiempo transcurrido y no el trabajo pedido: un horario semanal de hace
    // más de siete años y medio dejaba de generar sesiones, en silencio. Diez
    // años de antigüedad son 520 lunes, muy por encima del tope viejo.
    const dates = occurrencesBetween(
      { weekday: MONDAY, frequency: 'weekly', starts_on: '2016-01-04', ends_on: null },
      '2026-08-03',
      '2026-08-31',
    )
    expect(dates).toEqual([
      '2026-08-03',
      '2026-08-10',
      '2026-08-17',
      '2026-08-24',
      '2026-08-31',
    ])
  })

  it('el salto hasta la ventana no corre la quincena', () => {
    // Lo que el salto no puede romper: adelantarse de a `stepDays` mantiene la
    // paridad del ancla. Si la corriera, cada sesión futura de un horario
    // quincenal viejo quedaría una semana movida — plausible y equivocada.
    const anchor = '2018-08-06'
    const dates = occurrencesBetween(
      { weekday: MONDAY, frequency: 'biweekly', starts_on: anchor, ends_on: null },
      '2026-08-01',
      '2026-08-31',
    )

    expect(dates.length).toBeGreaterThan(0)
    const anchorTime = new Date(`${anchor}T00:00:00`).getTime()
    for (const date of dates) {
      const days = (new Date(`${date}T00:00:00`).getTime() - anchorTime) / 86_400_000
      expect(days % 14).toBe(0)
    }
  })

  it('returns nothing for a window before the rule starts', () => {
    const dates = occurrencesBetween(
      { weekday: MONDAY, frequency: 'weekly', starts_on: '2026-09-07', ends_on: null },
      '2026-08-01',
      '2026-08-31',
    )
    expect(dates).toEqual([])
  })
})
