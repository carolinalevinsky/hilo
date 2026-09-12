import { describe, expect, it } from 'vitest'

import { diffLines, hasChanges } from './diff'

/**
 * El diff que decide qué ve la profesional antes de aplicar una propuesta de la
 * IA sobre un informe firmado.
 *
 * Lo que no puede hacer, y es lo único grave: perder una línea. Si un renglón
 * del texto viejo no aparece ni como igual ni como reemplazado, la pantalla
 * dice que ese párrafo sigue estando cuando en realidad la propuesta lo borra —
 * y se aplica sin verlo. Por eso el último test reconstruye los dos textos
 * enteros a partir de los bloques.
 */

/** Los dos textos, rearmados desde los bloques. */
function rebuild(blocks: ReturnType<typeof diffLines>) {
  const before: string[] = []
  const after: string[] = []
  for (const block of blocks) {
    if (block.type === 'same') {
      before.push(...block.lines)
      after.push(...block.lines)
    } else {
      before.push(...block.removed)
      after.push(...block.added)
    }
  }
  return { before: before.join('\n'), after: after.join('\n') }
}

describe('diffLines', () => {
  it('un texto idéntico es un solo bloque sin cambios', () => {
    const blocks = diffLines('Antecedentes:\nVino con la madre.', 'Antecedentes:\nVino con la madre.')
    expect(blocks).toEqual([{ type: 'same', lines: ['Antecedentes:', 'Vino con la madre.'] }])
    expect(hasChanges(blocks)).toBe(false)
  })

  it('sobre un documento vacío es todo agregado', () => {
    const blocks = diffLines('', 'Conclusiones:\nSe sugiere continuar.')
    expect(hasChanges(blocks)).toBe(true)
    expect(rebuild(blocks).before).toBe('')
    expect(rebuild(blocks).after).toBe('Conclusiones:\nSe sugiere continuar.')
  })

  it('deja quieto lo que no cambió y junta el tramo cambiado', () => {
    const before = 'Antecedentes:\nLlega derivada del colegio.\nConclusiones:'
    const after = 'Antecedentes:\nLlega derivada de la maestra.\nConclusiones:'
    const blocks = diffLines(before, after)

    expect(blocks).toEqual([
      { type: 'same', lines: ['Antecedentes:'] },
      {
        type: 'changed',
        removed: ['Llega derivada del colegio.'],
        added: ['Llega derivada de la maestra.'],
      },
      { type: 'same', lines: ['Conclusiones:'] },
    ])
  })

  it('un párrafo agregado en el medio no se lleva puesto lo de al lado', () => {
    const before = 'Uno\nTres'
    const after = 'Uno\nDos\nTres'
    const blocks = diffLines(before, after)

    expect(blocks).toEqual([
      { type: 'same', lines: ['Uno'] },
      { type: 'changed', removed: [], added: ['Dos'] },
      { type: 'same', lines: ['Tres'] },
    ])
  })

  it('no pierde ninguna línea de ninguno de los dos textos', () => {
    // El invariante que importa. Un renglón que no aparece en ningún bloque es
    // un párrafo que la propuesta borra sin que la pantalla lo muestre.
    const before = [
      'Datos del paciente:',
      'Martina, 7 años.',
      '',
      'Antecedentes:',
      'Derivada por la maestra por dificultades en la lectura.',
      'Asiste desde marzo.',
      '',
      'Conclusiones:',
      'Se sugiere continuar una vez por semana.',
    ].join('\n')

    const after = [
      'Datos del paciente:',
      'Martina, 7 años.',
      '',
      'Antecedentes:',
      'Llega derivada del colegio por dificultades en la lectoescritura.',
      '',
      'Observaciones durante las sesiones:',
      'Sostiene la atención en tareas breves.',
      '',
      'Conclusiones:',
      'Se sugiere continuar una vez por semana y revisar en tres meses.',
    ].join('\n')

    const blocks = diffLines(before, after)
    const rebuilt = rebuild(blocks)

    expect(rebuilt.before).toBe(before)
    expect(rebuilt.after).toBe(after)
    expect(hasChanges(blocks)).toBe(true)
  })

  it('arriba del tope devuelve un solo bloque, y tampoco pierde nada', () => {
    // 700 líneas de cada lado: por encima del tope de 600. La respuesta es menos
    // detallada a propósito y tiene que seguir siendo completa.
    const before = Array.from({ length: 700 }, (_, i) => `viejo ${i}`).join('\n')
    const after = Array.from({ length: 700 }, (_, i) => `nuevo ${i}`).join('\n')

    const blocks = diffLines(before, after)

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.type).toBe('changed')
    expect(rebuild(blocks)).toEqual({ before, after })
  })
})
