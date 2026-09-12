import { describe, expect, it } from 'vitest'

import { weekOffsetFrom } from './week'

/**
 * El parámetro `semana` de la Agenda viene de la barra de direcciones, así que
 * cualquier cosa puede llegar. Lo que no puede pasar es que un número grande
 * escriba un año de sesiones de una carga, ni que se pase del rango de `Date` y
 * termine en una pantalla de error de Postgres.
 */
describe('weekOffsetFrom', () => {
  it('deja pasar lo razonable', () => {
    expect(weekOffsetFrom('0')).toBe(0)
    expect(weekOffsetFrom('3')).toBe(3)
    expect(weekOffsetFrom('-12')).toBe(-12)
    expect(weekOffsetFrom(undefined)).toBe(0)
  })

  it('recorta a dos años para cada lado', () => {
    expect(weekOffsetFrom('104')).toBe(104)
    expect(weekOffsetFrom('105')).toBe(104)
    expect(weekOffsetFrom('52000')).toBe(104)
    expect(weekOffsetFrom('-52000')).toBe(-104)
  })

  it('no deja salir del rango de Date', () => {
    // `semana=999999999` desbordaba `Date`, `toDateInput` devolvía
    // "NaN-NaN-NaN", y eso entraba a un `.gte('scheduled_on', …)`.
    for (const value of ['999999999', '1e21', 'Infinity', '-Infinity', 'hola', '']) {
      const offset = weekOffsetFrom(value)
      expect(Number.isFinite(offset)).toBe(true)
      expect(Math.abs(offset)).toBeLessThanOrEqual(104)
    }
  })
})
