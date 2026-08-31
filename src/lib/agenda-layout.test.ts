import { describe, expect, it } from 'vitest'

import { HOUR_HEIGHT, placeSpans, type Span } from '@/lib/agenda-layout'

/**
 * Dónde queda dibujada cada cosa en la columna de un día.
 *
 * Esto existe porque las dos veces que la Agenda se vio mal fue acá: una hora
 * puesta en el lugar equivocado, y un nombre tapado por otro. Ninguna de las dos
 * rompe nada — se ven, y sólo si mirás.
 *
 * La grilla arranca a las 8:00, así que los minutos van desde ahí: 9:00 son 60.
 */

const GRID_START = 8 * 60
const at = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) - GRID_START

const span = (key: string, from: string, to: string): Span => ({
  key,
  from: at(from),
  to: at(to),
})

describe('a qué altura empieza', () => {
  it('pone las 9 en punto una hora abajo del principio', () => {
    const [placed] = placeSpans([span('a', '09:00', '10:00')])
    expect(placed?.top).toBe(HOUR_HEIGHT)
  })

  it('pone las 18:30 a mitad de la franja de las 18, no arriba', () => {
    // El error que hacía que "GAP 18:30" se dibujara pegado a las 18:00.
    const [placed] = placeSpans([span('gap', '18:30', '19:45')])
    expect(placed?.top).toBe(10.5 * HOUR_HEIGHT)
  })

  it('pone las 17:30 a mitad de la franja de las 17', () => {
    const [placed] = placeSpans([span('mkt', '17:30', '18:30')])
    expect(placed?.top).toBe(9.5 * HOUR_HEIGHT)
  })
})

describe('cuánto mide', () => {
  it('una hora mide una hora', () => {
    expect(placeSpans([span('a', '09:00', '10:00')])[0]?.height).toBe(HOUR_HEIGHT)
  })

  it('de nueve a cinco mide ocho horas, no una etiqueta', () => {
    expect(placeSpans([span('devlane', '09:00', '17:00')])[0]?.height).toBe(8 * HOUR_HEIGHT)
  })

  it('los 75 minutos de GAP miden 75 minutos', () => {
    expect(placeSpans([span('gap', '18:30', '19:45')])[0]?.height).toBe(1.25 * HOUR_HEIGHT)
  })

  it('algo muy corto no se achica hasta desaparecer', () => {
    // Cinco minutos serían menos de cinco píxeles y no entraría ni el nombre.
    expect(placeSpans([span('a', '09:00', '09:05')])[0]?.height).toBeGreaterThanOrEqual(20)
  })
})

describe('cuando dos se pisan', () => {
  const devlane = span('devlane', '09:00', '17:00')
  const tomas = span('tomas', '09:00', '09:45')

  it('la más larga queda atrás y la más corta adelante', () => {
    const placed = placeSpans([tomas, devlane])
    const back = placed.find((p) => p.span.key === 'devlane')!
    const front = placed.find((p) => p.span.key === 'tomas')!

    expect(front.z).toBeGreaterThan(back.z)
  })

  it('la más corta se angosta; la más larga queda ancha', () => {
    const placed = placeSpans([tomas, devlane])

    expect(placed.find((p) => p.span.key === 'devlane')!.width).toBe(100)
    expect(placed.find((p) => p.span.key === 'tomas')!.width).toBeLessThan(100)
  })

  it('a la de atrás le baja el título hasta pasar la que la tapa', () => {
    // Sin esto, "Devlane" queda abajo de la tarjeta de Tomás y no se lee.
    const placed = placeSpans([tomas, devlane])
    const back = placed.find((p) => p.span.key === 'devlane')!

    expect(back.labelTop).toBe(0.75 * HOUR_HEIGHT)
  })

  it('no le baja el título a la que no está tapada arriba', () => {
    // Malena a las 14:30 pasa por el medio de Devlane, no por su cabecera.
    const malena = span('malena', '14:30', '15:15')
    const placed = placeSpans([malena, devlane])

    expect(placed.find((p) => p.span.key === 'devlane')!.labelTop).toBe(0)
  })

  it('nunca baja el título fuera del cuerpo', () => {
    // Dos de la misma duración: bajar el título de la de atrás la altura entera
    // lo dejaría afuera, y sería peor el remedio.
    const a = span('a', '09:00', '09:45')
    const b = span('b', '09:00', '09:45')
    for (const placed of placeSpans([a, b])) {
      expect(placed.labelTop).toBeLessThanOrEqual(placed.height - 20)
    }
  })

  it('la más corta queda pegada a la izquierda, no corrida a la derecha', () => {
    // Se angosta por la derecha: así el borde izquierdo sigue siendo uno solo
    // para toda la columna y las horas se leen bajando por él.
    const placed = placeSpans([tomas, devlane])
    const front = placed.find((p) => p.span.key === 'tomas')!

    expect(front).not.toHaveProperty('left')
    expect(front.width).toBeLessThan(100)
  })

  it('deja en paz a las que no se tocan', () => {
    const manana = span('a', '09:00', '10:00')
    const tarde = span('b', '15:00', '16:00')

    for (const placed of placeSpans([manana, tarde])) {
      expect(placed.width).toBe(100)
      expect(placed.labelTop).toBe(0)
    }
  })

  it('con tres encimadas ninguna queda sin ancho', () => {
    const placed = placeSpans([
      span('larga', '09:00', '17:00'),
      span('media', '09:00', '12:00'),
      span('corta', '09:00', '09:30'),
      span('cortita', '09:00', '09:20'),
    ])

    for (const one of placed) expect(one.width).toBeGreaterThan(30)
  })

  it('no depende del orden en que vinieron', () => {
    const uno = placeSpans([tomas, devlane]).map((p) => [p.span.key, p.width, p.z])
    const otro = placeSpans([devlane, tomas]).map((p) => [p.span.key, p.width, p.z])

    expect(uno).toEqual(otro)
  })
})
