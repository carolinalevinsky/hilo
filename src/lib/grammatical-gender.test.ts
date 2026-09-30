import { describe, expect, it } from 'vitest'

import { agreementFor, genderFromName } from './grammatical-gender'

describe('genderFromName', () => {
  it('deduce los casos claros', () => {
    expect(genderFromName('Malena Rodríguez')).toBe('feminine')
    expect(genderFromName('Tomás Pérez')).toBe('masculine')
    expect(genderFromName('Raquel Oberlander')).toBe('feminine')
    expect(genderFromName('Luca Martínez')).toBe('masculine')
    expect(genderFromName('Bautista Silva')).toBe('masculine')
    expect(genderFromName('INÉS gómez')).toBe('feminine')
    expect(genderFromName('Lucía Fernández')).toBe('feminine')
  })

  it('no adivina cuando el nombre sirve para los dos', () => {
    expect(genderFromName('Andrea Costa')).toBeNull()
    expect(genderFromName('Alex López')).toBeNull()
    expect(genderFromName('Ariel Díaz')).toBeNull()
  })

  it('no inventa con un nombre que no conoce', () => {
    expect(genderFromName('Xiomer Pérez')).toBeNull()
    expect(genderFromName('')).toBeNull()
    expect(genderFromName(null)).toBeNull()
  })
})

describe('agreementFor', () => {
  it('lo elegido gana sobre el nombre', () => {
    expect(agreementFor('masculine', 'Malena Rodríguez')).toBe('masculine')
    expect(agreementFor('feminine', 'Tomás Pérez')).toBe('feminine')
  })

  it('"prefiero no decir" es masculino, y no se deduce encima', () => {
    expect(agreementFor('unspecified', 'Malena Rodríguez')).toBe('masculine')
  })

  it('sin elección, el nombre; sin nombre claro, masculino', () => {
    expect(agreementFor(null, 'Malena Rodríguez')).toBe('feminine')
    expect(agreementFor(null, 'Andrea Costa')).toBe('masculine')
  })
})
