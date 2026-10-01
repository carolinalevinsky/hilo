import { describe, expect, it } from 'vitest'

import { doneMessage, withDone } from './done'

describe('withDone', () => {
  it('agrega el aviso, respetando lo que la dirección ya traía', () => {
    expect(withDone('/pacientes/1', 'paciente-creado')).toBe('/pacientes/1?hecho=paciente-creado')
    expect(withDone('/materiales/1/editar?describir=1', 'material-copiado')).toBe(
      '/materiales/1/editar?describir=1&hecho=material-copiado',
    )
  })
})

describe('doneMessage', () => {
  it('sólo dice lo que está en la lista: la URL no inventa mensajes', () => {
    expect(doneMessage('registro-guardado')).toBe('Registro guardado.')
    expect(doneMessage('cualquier-cosa')).toBeNull()
    expect(doneMessage('toString')).toBeNull()
    expect(doneMessage(null)).toBeNull()
  })
})
