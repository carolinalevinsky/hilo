import { describe, expect, it } from 'vitest'

import { readAgendaSlot, slotWeekday } from './agenda-slot'

/**
 * The clicked slot, read back from the URL (P6). The URL can be typed by hand,
 * so anything that is not a real date and a half-hour time opens no dialog.
 */
describe('readAgendaSlot', () => {
  it('takes a real date and a time on the hour or half past', () => {
    expect(readAgendaSlot('2026-09-15', '10:30')).toEqual({ date: '2026-09-15', time: '10:30' })
    expect(readAgendaSlot('2026-09-15', '09:00')).toEqual({ date: '2026-09-15', time: '09:00' })
  })

  it('drops a time the grid never offers', () => {
    expect(readAgendaSlot('2026-09-15', '10:15')).toBeNull()
    expect(readAgendaSlot('2026-09-15', '24:00')).toBeNull()
    expect(readAgendaSlot('2026-09-15', '9:00')).toBeNull()
  })

  it('drops a date that does not exist, instead of rolling it over', () => {
    expect(readAgendaSlot('2026-02-30', '10:00')).toBeNull()
    expect(readAgendaSlot('2026-13-01', '10:00')).toBeNull()
    expect(readAgendaSlot('mañana', '10:00')).toBeNull()
  })

  it('drops what is missing or repeated in the URL', () => {
    expect(readAgendaSlot(undefined, '10:00')).toBeNull()
    expect(readAgendaSlot(['2026-09-15', '2026-09-16'], '10:00')).toBeNull()
  })
})

describe('slotWeekday', () => {
  it('is the weekday of the date, 0 for Sunday, whatever the time zone', () => {
    expect(slotWeekday({ date: '2026-09-13', time: '10:00' })).toBe(0)
    expect(slotWeekday({ date: '2026-09-15', time: '23:30' })).toBe(2)
  })
})
