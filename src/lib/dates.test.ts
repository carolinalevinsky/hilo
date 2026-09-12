import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  startOfDayInUruguay,
  toDateInput,
  today,
  todayDate,
  zonedDate,
  zonedParts,
} from './dates'
import { currentPeriod } from './periods'
import { weekDates } from './week'

/**
 * La franja de las 21:00 a la medianoche.
 *
 * Uruguay es UTC-3 y Vercel corre en UTC, así que durante esas tres horas el
 * servidor ya está en el día siguiente. Nada de esto se puede ver en una prueba
 * a mano de mañana: la aplicación funciona perfecto veintiún horas por día.
 *
 * La suite corre con `TZ=UTC` (ver `package.json`), que es exactamente la
 * condición de producción. Un test que pase acá con el reloj movido es la única
 * forma de saber que esto quedó arreglado.
 */

/** Las 21:05 del domingo 30 de agosto de 2026 en Montevideo. */
const DOMINGO_DE_NOCHE = new Date('2026-08-31T00:05:00.000Z')

/** Las 21:30 del lunes 31 de agosto de 2026 — el último día del mes. */
const FIN_DE_MES_DE_NOCHE = new Date('2026-09-01T00:30:00.000Z')

function alRelojLeDamos(instant: Date) {
  vi.useFakeTimers()
  vi.setSystemTime(instant)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('today', () => {
  it('devuelve el día uruguayo, no el del servidor', () => {
    alRelojLeDamos(DOMINGO_DE_NOCHE)

    expect(today()).toBe('2026-08-30')
    // Lo que devolvía antes, y por qué la sesión escrita a las 21:05 del domingo
    // quedaba fechada el lunes.
    expect(toDateInput(new Date())).toBe('2026-08-31')
  })

  it('no cambia nada fuera de la franja', () => {
    alRelojLeDamos(new Date('2026-08-30T15:00:00.000Z'))

    expect(today()).toBe('2026-08-30')
    expect(toDateInput(new Date())).toBe('2026-08-30')
  })
})

describe('zonedParts', () => {
  it('da la hora de pared uruguaya', () => {
    expect(zonedParts(DOMINGO_DE_NOCHE)).toEqual({
      date: '2026-08-30',
      time: '21:05:00',
    })
  })

  it('la medianoche es 00, no 24', () => {
    expect(zonedParts(new Date('2026-08-31T03:00:00.000Z')).time).toBe('00:00:00')
  })
})

describe('toDateInput', () => {
  it('sigue siendo aritmética de calendario pura', () => {
    // La convención que no hay que romper: una fecha flotante entra y sale
    // igual. Si `toDateInput` leyera la zona, esto daría el 9.
    const flotante = new Date('2026-08-10T00:00:00')
    expect(toDateInput(flotante)).toBe('2026-08-10')
  })

  it('se combina con zonedDate sin correrse un día', () => {
    expect(toDateInput(zonedDate(DOMINGO_DE_NOCHE))).toBe('2026-08-30')
  })
})

describe('la semana de la agenda', () => {
  it('un domingo a las 21:05 no salta a la semana que viene', () => {
    alRelojLeDamos(DOMINGO_DE_NOCHE)

    const semana = weekDates(todayDate(), 0)

    expect(semana[0]).toBe('2026-08-24')
    expect(semana[6]).toBe('2026-08-30')
  })
})

describe('la cuota mensual', () => {
  it('no se renueva a las 21:00 del último día del mes', () => {
    alRelojLeDamos(FIN_DE_MES_DE_NOCHE)

    expect(currentPeriod()).toBe('2026-08')
    expect(startOfDayInUruguay(`${today().slice(0, 7)}-01`).toISOString()).toBe(
      '2026-08-01T03:00:00.000Z',
    )
  })

  it('el mes empieza a medianoche uruguaya, no a medianoche UTC', () => {
    // Tres horas de diferencia: con `T00:00:00Z` los informes escritos entre las
    // 21:00 y la medianoche del día 1.º se contaban contra el mes anterior.
    expect(startOfDayInUruguay('2026-09-01').toISOString()).toBe('2026-09-01T03:00:00.000Z')
  })
})
