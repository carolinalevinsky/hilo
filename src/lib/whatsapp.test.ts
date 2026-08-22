import { describe, expect, it } from 'vitest'

import { firstName, whatsappNumber } from './whatsapp'

describe('whatsappNumber', () => {
  it('turns a Uruguayan mobile written locally into an international one', () => {
    // The leading 0 is what the country code replaces; keeping both produces a
    // number WhatsApp cannot open.
    expect(whatsappNumber('099 123 456')).toBe('59899123456')
    expect(whatsappNumber('091-234-567')).toBe('59891234567')
  })

  it('leaves a number that already has the country code alone', () => {
    expect(whatsappNumber('+598 99 123 456')).toBe('59899123456')
  })

  it('returns null when there is no phone', () => {
    expect(whatsappNumber(null)).toBeNull()
    expect(whatsappNumber('')).toBeNull()
    expect(whatsappNumber('sin teléfono')).toBeNull()
  })
})

describe('firstName', () => {
  it('takes the first word', () => {
    expect(firstName('Malena Rodríguez')).toBe('Malena')
    expect(firstName('  Tomás  ')).toBe('Tomás')
  })
})
