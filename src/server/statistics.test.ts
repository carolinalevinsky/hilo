import { describe, expect, it, vi } from 'vitest'

vi.mock('./db', () => ({ getDb: async () => null }))

const { sameDayIn } = await import('./statistics')

/**
 * "Sesiones este mes" se compara contra el mes pasado hasta el mismo día. Antes
 * era contra el mes pasado entero, y el 15 la flecha daba siempre para abajo.
 */
describe('sameDayIn', () => {
  it('es el mismo número de día en el otro mes', () => {
    expect(sameDayIn('2026-08-01', '2026-09-15')).toBe('2026-08-15')
  })

  it('no se pasa del último día de un mes más corto', () => {
    expect(sameDayIn('2026-02-01', '2026-03-31')).toBe('2026-02-28')
    expect(sameDayIn('2026-09-01', '2026-10-31')).toBe('2026-09-30')
  })
})
