import { describe, expect, it } from 'vitest'

import { readStepHint } from './first-steps'

describe('readStepHint', () => {
  it('devuelve el cartel que esta pantalla tiene', () => {
    expect(readStepHint('planificar', ['planificar'])).toBe('planificar')
  })

  it('ignora el de otra pantalla, y lo que no es un cartel', () => {
    // `?pasos=` viene de la barra de direcciones: puede decir cualquier cosa.
    expect(readStepHint('paciente', ['planificar', 'pagos'])).toBeNull()
    expect(readStepHint('<script>', ['pagos'])).toBeNull()
    expect(readStepHint(['pagos', 'pagos'], ['pagos'])).toBeNull()
    expect(readStepHint(undefined, ['pagos'])).toBeNull()
  })
})
