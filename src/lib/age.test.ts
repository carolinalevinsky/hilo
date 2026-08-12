import { describe, expect, it } from 'vitest'

import { ageInYears, ageLabel } from './age'

/**
 * A fixed "today" so these tests do not start failing on someone's birthday.
 */
const TODAY = new Date('2026-08-11T12:00:00')

describe('ageInYears', () => {
  it('does not round up before the birthday', () => {
    expect(ageInYears('2017-08-12', TODAY)).toBe(8)
    expect(ageInYears('2017-08-11', TODAY)).toBe(9)
  })
})

describe('ageLabel', () => {
  it('reports months under two years', () => {
    // Under two, months are what a practitioner works with. "1 año" says much
    // less than "14 meses" when the patient is in early intervention.
    expect(ageLabel('2025-06-11', TODAY)).toBe('14 meses')
    expect(ageLabel('2026-07-11', TODAY)).toBe('1 mes')
  })

  it('reports years from two onwards', () => {
    expect(ageLabel('2024-08-11', TODAY)).toBe('2 años')
    expect(ageLabel('2017-04-12', TODAY)).toBe('9 años')
  })

  it('returns null when there is no date of birth', () => {
    expect(ageLabel(null, TODAY)).toBeNull()
  })
})
