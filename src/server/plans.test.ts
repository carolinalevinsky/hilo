import { describe, expect, it } from 'vitest'

import { PLAN_LIMITS, type QuotaKind, quotaWarning } from '@/server/plans'

/**
 * El aviso de que se está por acabar el mes.
 *
 * La pantalla de Informes no muestra un contador permanente, así que este texto
 * es lo único que le avisa a alguien antes de chocarse contra el límite. Si deja
 * de aparecer, nadie se entera de que dejó de aparecer: la app sigue andando y
 * el bloqueo llega igual, sólo que de golpe.
 */

function status(kind: QuotaKind, used: number, limit: number) {
  return { kind, used, limit, remaining: Math.max(limit - used, 0), exceeded: used >= limit }
}

describe('el aviso de que quedan pocos', () => {
  it('no dice nada cuando todavía sobra', () => {
    expect(quotaWarning(status('reports', 2, 10))).toBeNull()
  })

  it('aparece recién en los últimos tres', () => {
    expect(quotaWarning(status('reports', 6, 10))).toBeNull()
    expect(quotaWarning(status('reports', 7, 10))).toBe(
      'Te quedan 3 informes este mes. Se renueva el 1.º.',
    )
  })

  it('pone el singular cuando queda uno', () => {
    expect(quotaWarning(status('reports', 9, 10))).toBe(
      'Te queda 1 informe este mes. Se renueva el 1.º.',
    )
  })

  it('se calla cuando ya no queda ninguno', () => {
    // Ahí avisa `quotaMessage` al intentar crear. Dos textos sobre lo mismo en
    // la misma pantalla terminan contradiciéndose.
    expect(quotaWarning(status('reports', 10, 10))).toBeNull()
    expect(quotaWarning(status('reports', 14, 10))).toBeNull()
  })

  // El castellano no pluraliza sacando una ese, y estos cuatro lo prueban:
  // "evaluación" y "material" no se derivan de su plural con ninguna regla
  // corta. Están escritos a mano en `QUOTA_NOUN` y esto lo cuida.
  it('arma bien el singular de cada tipo', () => {
    expect(quotaWarning(status('assessments', 9, 10))).toBe(
      'Te queda 1 evaluación este mes. Se renueva el 1.º.',
    )
    expect(quotaWarning(status('questions', 39, 40))).toBe(
      'Te queda 1 pregunta este mes. Se renueva el 1.º.',
    )
    expect(quotaWarning(status('materials', 9, 10))).toBe(
      'Te queda 1 material generado con IA este mes. Se renueva el 1.º.',
    )
  })

  it('concuerda el plural también', () => {
    expect(quotaWarning(status('assessments', 8, 10))).toBe(
      'Te quedan 2 evaluaciones este mes. Se renueva el 1.º.',
    )
    expect(quotaWarning(status('materials', 8, 10))).toBe(
      'Te quedan 2 materiales generados con IA este mes. Se renueva el 1.º.',
    )
  })
})

describe('los límites del plan gratis', () => {
  it('deja diez informes por mes', () => {
    // Está acá porque es un número que se toca por decisión comercial, no por
    // refactor: si cambia, que sea a propósito y no de arrastre.
    expect(PLAN_LIMITS.free.reports).toBe(10)
  })
})
