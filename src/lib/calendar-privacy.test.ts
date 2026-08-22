import { describe, expect, it } from 'vitest'

import { calendarEventTitle } from '@/lib/calendar-privacy'

/**
 * Qué sale de Hilo hacia el calendario de otra empresa.
 *
 * Estos tests son cortos y aburridos a propósito. Lo que cuidan no lo es: cada
 * caso es una fila que dice qué queda escrito, para siempre, en un servidor
 * ajeno, sobre una persona que va a fonoaudiología.
 */
describe('el título del evento', () => {
  it('no dice nada cuando la opción es "sólo ocupado"', () => {
    expect(calendarEventTitle('Tomás Pérez', 'busy')).toBe('Ocupado')
  })

  it('reduce a iniciales', () => {
    expect(calendarEventTitle('Tomás Pérez', 'initials')).toBe('T. P.')
  })

  it('usa sólo el nombre de pila, nunca el apellido', () => {
    expect(calendarEventTitle('Tomás Pérez', 'first_name')).toBe('Tomás')
  })

  it('corta en dos iniciales, porque cuatro no es más reservado sino más largo', () => {
    expect(calendarEventTitle('María del Carmen Rodríguez Silva', 'initials')).toBe('M. D.')
  })

  it('mantiene el nombre de pila compuesto en una sola palabra', () => {
    expect(calendarEventTitle('Ana Laura Fernández', 'first_name')).toBe('Ana')
  })
})

describe('cuando no se sabe qué eligió', () => {
  // El default de una decisión sobre privacidad tiene que ser el que menos
  // cuenta, no el más cómodo. Una columna nueva, un valor viejo en la base o un
  // error de tipeo no pueden terminar publicando un nombre.

  it('cae en "Ocupado" con null', () => {
    expect(calendarEventTitle('Tomás Pérez', null)).toBe('Ocupado')
  })

  it('cae en "Ocupado" con undefined', () => {
    expect(calendarEventTitle('Tomás Pérez', undefined)).toBe('Ocupado')
  })

  it('cae en "Ocupado" con un valor que no existe', () => {
    expect(calendarEventTitle('Tomás Pérez', 'nombre_completo')).toBe('Ocupado')
  })

  it('cae en "Ocupado" con el string vacío', () => {
    expect(calendarEventTitle('Tomás Pérez', '')).toBe('Ocupado')
  })
})
