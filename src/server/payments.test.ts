import { describe, expect, it } from 'vitest'

import { currentPeriod, periodLabel, shiftPeriod } from '@/lib/periods'

import { PaymentInput } from './payments'

describe('PaymentInput', () => {
  const valid = {
    patientId: '22222222-0000-4000-8000-000000000001',
    paidOn: '2026-08-11',
    period: '2026-08',
    amount: '1500',
  }

  it('coerces an amount typed as text', () => {
    expect(PaymentInput.parse(valid).amount).toBe(1500)
  })

  it('rejects a zero or negative amount', () => {
    // A zero payment is a mis-tap, and it would quietly mark a month as settled.
    expect(PaymentInput.safeParse({ ...valid, amount: '0' }).success).toBe(false)
    expect(PaymentInput.safeParse({ ...valid, amount: '-500' }).success).toBe(false)
  })

  it('rejects a period that is not YYYY-MM', () => {
    for (const period of ['2026-8', '08-2026', '2026-13', 'agosto']) {
      expect(PaymentInput.safeParse({ ...valid, period }).success, period).toBe(false)
    }
  })
})

describe('shiftPeriod', () => {
  it('walks backwards across a year boundary', () => {
    expect(shiftPeriod('2026-01', -1)).toBe('2025-12')
    expect(shiftPeriod('2026-01', -13)).toBe('2024-12')
  })

  it('walks forwards across a year boundary', () => {
    expect(shiftPeriod('2026-12', 1)).toBe('2027-01')
  })
})

describe('periodLabel', () => {
  it('reads as a month, capitalised', () => {
    expect(periodLabel('2026-08')).toBe('Agosto 2026')
    expect(periodLabel('2026-01')).toBe('Enero 2026')
  })
})

describe('currentPeriod', () => {
  it('pads the month', () => {
    expect(currentPeriod(new Date('2026-03-05T12:00:00'))).toBe('2026-03')
  })
})
