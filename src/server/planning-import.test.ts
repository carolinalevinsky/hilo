import { describe, expect, it } from 'vitest'

import { MAX_IMPORTED_ACTIVITIES, parseImportedActivities } from './planning-import'

const AREAS = ['Lectura', 'Escritura']

describe('parseImportedActivities', () => {
  it('keeps what fits Ombúa and fixes what does not', () => {
    const activities = parseImportedActivities(
      JSON.stringify([
        {
          titulo: 'Bingo de sonidos',
          area: 'Lectura',
          tipo: 'game',
          edad: '6-7 años',
          objetivo: 'Conciencia fonológica',
          actividad: 'Cómo se juega:\nSe dice una palabra y se marca la imagen.',
        },
        {
          titulo: 'Dictado',
          area: 'Matemática',
          tipo: 'otra cosa',
          edad: '7 años',
          objetivo: null,
          actividad: 'Consigna:\nDictado de diez palabras.',
        },
        { titulo: 'Vacía', area: 'Lectura', actividad: '' },
      ]),
      AREAS,
    )

    expect(activities).toEqual([
      {
        title: 'Bingo de sonidos',
        area: 'Lectura',
        kind: 'game',
        ageRange: '6-7 años',
        objective: 'Conciencia fonológica',
        content: 'Cómo se juega:\nSe dice una palabra y se marca la imagen.',
      },
      {
        title: 'Dictado',
        area: 'Lectura',
        kind: 'activity',
        ageRange: null,
        objective: null,
        content: 'Consigna:\nDictado de diez palabras.',
      },
    ])
  })

  it('reads an array wrapped in prose, and nothing from prose alone', () => {
    expect(parseImportedActivities('No encontré actividades: []', AREAS)).toEqual([])
    expect(parseImportedActivities('No pude leer la foto.', AREAS)).toEqual([])
  })

  it('never returns more than the cap', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ titulo: `A${i}`, actividad: 'Una actividad cualquiera.' }))
    expect(parseImportedActivities(JSON.stringify(many), AREAS)).toHaveLength(MAX_IMPORTED_ACTIVITIES)
  })
})

describe('importPlanningMaterials', () => {
  it('hands createMaterial something it accepts, and refuses a bad entry before writing', async () => {
    const { vi } = await import('vitest')
    const written: unknown[] = []
    vi.doMock('./materials', async (original) => {
      const actual = await original<typeof import('./materials')>()
      return {
        ...actual,
        createMaterial: async (_p: string, _d: string, input: unknown) => {
          // The real one parses again; a second parse is what used to fail.
          written.push(actual.MaterialInput.parse(input))
          return input
        },
      }
    })
    vi.resetModules()
    const { importPlanningMaterials } = await import('./planning-import')

    const activity = {
      title: 'Bingo',
      area: 'Lectura',
      kind: 'game',
      ageRange: null,
      objective: null,
      content: 'Cómo se juega:\nSe marca la imagen.',
    }

    await expect(
      importPlanningMaterials('p', 'psychopedagogy', [activity, { ...activity, content: '' }]),
    ).rejects.toThrow()
    expect(written).toHaveLength(0)

    await importPlanningMaterials('p', 'psychopedagogy', [activity])
    expect(written).toHaveLength(1)
    vi.doUnmock('./materials')
  })
})
