import { describe, expect, it } from 'vitest'

import {
  aliasInstructions,
  hideNames,
  manyPatientAliases,
  nameParts,
  patientAliases,
  revealNames,
  revealStream,
} from './pseudonyms'

async function* chunked(text: string, size: number) {
  for (let i = 0; i < text.length; i += size) yield text.slice(i, i + size)
}

async function collect(stream: AsyncIterable<string>) {
  let text = ''
  for await (const chunk of stream) text += chunk
  return text
}

describe('tapar el nombre', () => {
  const aliases = patientAliases('Tomás Pérez', 'masculine')

  it('tapa el nombre completo, el de pila y el apellido', () => {
    const hidden = hideNames(
      'Tomás Pérez (5 años). Tomás logra la /r/. La familia Pérez acompaña.',
      aliases,
    )
    expect(hidden).toBe(
      '[NOMBRE COMPLETO] (5 años). [NOMBRE] logra la /r/. La familia [NOMBRE] acompaña.',
    )
    expect(hidden).not.toMatch(/Tom|Pérez/)
  })

  it('sin importar tildes ni mayúsculas', () => {
    expect(hideNames('TOMAS vino; tomás no quiso; Perez igual.', aliases)).toBe(
      '[NOMBRE] vino; [NOMBRE] no quiso; [NOMBRE] igual.',
    )
  })

  it('no tapa una palabra que sólo contiene el nombre', () => {
    // "Tomasito" es otra palabra; taparla a medias dejaría "[NOMBRE]ito".
    expect(hideNames('Le dicen Tomasito.', aliases)).toBe('Le dicen Tomasito.')
  })

  it('deja las palabras cortas de un nombre compuesto', () => {
    expect(nameParts('Ana de la Torre')).toEqual(['Ana de la Torre', 'Ana', 'Torre'])
  })
})

describe('devolver el nombre', () => {
  const aliases = patientAliases('Tomás Pérez', 'masculine')

  it('pone el nombre real donde la IA dejó el marcador', () => {
    expect(revealNames('[NOMBRE COMPLETO] asiste desde marzo. [NOMBRE] logra…', aliases)).toBe(
      'Tomás Pérez asiste desde marzo. Tomás logra…',
    )
  })

  it('en un stream, aunque el marcador llegue partido en dos', async () => {
    const text = 'Informe de [NOMBRE COMPLETO]. [NOMBRE] avanza. [A completar]'
    for (const size of [1, 2, 3, 5, 8]) {
      expect(await collect(revealStream(chunked(text, size), aliases))).toBe(
        'Informe de Tomás Pérez. Tomás avanza. [A completar]',
      )
    }
  })
})

describe('varios pacientes', () => {
  it('uno por paciente, y el nombre de pila que comparten dos no se asigna a ninguno', () => {
    const aliases = manyPatientAliases([
      { fullName: 'Tomás Pérez', label: 'Tomás P.', agreement: 'masculine' },
      { fullName: 'Tomás García', label: 'Tomás G.', agreement: 'masculine' },
      { fullName: 'Malena Rodríguez', label: 'Malena', agreement: 'feminine' },
    ])

    const hidden = hideNames('¿Cómo viene Malena? ¿Y Tomás Pérez? ¿Y García?', aliases)
    expect(hidden).toBe('¿Cómo viene [P3]? ¿Y [P1]? ¿Y [P2]?')
    expect(revealNames('[P3] avanza; [P1] y [P2] también.', aliases)).toBe(
      'Malena avanza; Tomás P. y Tomás G. también.',
    )
  })
})

describe('la concordancia', () => {
  it('le dice al modelo con qué género escribir cada marcador', () => {
    const text = aliasInstructions([
      ...patientAliases('Malena Rodríguez', 'feminine'),
    ])
    expect(text).toContain('[NOMBRE COMPLETO], [NOMBRE] usá concordancia femenina')
    expect(text).not.toContain('No sabés el género')
  })
})
