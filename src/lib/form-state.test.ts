import { afterEach, describe, expect, it, vi } from 'vitest'

import { formErrorFor, validationMessage } from './form-state'

/**
 * Qué se contesta cuando una acción de formulario falla.
 *
 * Son dos cosas distintas que un `catch` suele juntar: un dato mal escrito, que
 * quien lo escribió puede corregir si se le dice cuál, y un problema nuestro,
 * que no puede corregir nadie del otro lado y que alguien tiene que poder ver.
 */

const zodLike = (message: string) => ({ issues: [{ message }] })

let quiet: ReturnType<typeof vi.spyOn> | null = null

afterEach(() => {
  quiet?.mockRestore()
  quiet = null
})

describe('validationMessage', () => {
  it('devuelve la frase del esquema', () => {
    expect(validationMessage(zodLike('Escribí tu nombre y apellido.'))).toBe(
      'Escribí tu nombre y apellido.',
    )
  })

  it('devuelve null para cualquier otra cosa', () => {
    expect(validationMessage(new Error('connection reset'))).toBeNull()
    expect(validationMessage(null)).toBeNull()
    expect(validationMessage('un string')).toBeNull()
  })

  it('no se queda sin frase si el error viene sin ninguna', () => {
    expect(validationMessage({ issues: [] })).toBe('Revisá los datos e intentá de nuevo.')
  })
})

describe('formErrorFor', () => {
  it('le pasa a la pantalla lo que dice el esquema, no la frase genérica', () => {
    const state = formErrorFor(zodLike('Elegí tu profesión.'), 'No pudimos guardar.')

    expect(state).toEqual({
      ok: false,
      message: 'Elegí tu profesión.',
      values: undefined,
    })
  })

  it('un fallo que no es de validación se dice neutro y se deja anotado', () => {
    // La mitad que faltaba en todos lados: sin esta línea, un fallo real de la
    // base desaparecía sin dejar rastro en ningún lado.
    quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    const problem = new Error('duplicate key value violates unique constraint')

    const state = formErrorFor(problem, 'No pudimos guardar. Probá de nuevo.')

    expect(state.message).toBe('No pudimos guardar. Probá de nuevo.')
    expect(quiet).toHaveBeenCalledWith('[form]', problem)
  })

  it('devuelve lo tipeado para que el formulario no vuelva en blanco', () => {
    const state = formErrorFor(zodLike('Revisá el teléfono.'), 'No pudimos guardar.', {
      fullName: 'Lucía Pérez',
    })

    expect(state.values).toEqual({ fullName: 'Lucía Pérez' })
  })
})
