import { describe, expect, it, vi } from 'vitest'

vi.mock('./db', () => ({ getDb: async () => null, getServiceDb: () => null }))

const { everyRow } = await import('./patient-export')

/**
 * El export de la historia clínica pedía "hasta 10.000 filas" a una API que
 * corta en 1.000 sin avisar. Esto prueba que pide por páginas hasta el final.
 */
describe('everyRow', () => {
  it('sigue pidiendo hasta que una página vuelve incompleta', async () => {
    const rows = Array.from({ length: 1234 }, (_, index) => index)
    const asked: [number, number][] = []

    const all = await everyRow(async (from, to) => {
      asked.push([from, to])
      return { data: rows.slice(from, to + 1), error: null }
    })

    expect(all).toEqual(rows)
    expect(asked).toEqual([
      [0, 499],
      [500, 999],
      [1000, 1499],
    ])
  })

  it('no se come un error de la base', async () => {
    await expect(
      everyRow(async () => ({ data: null, error: new Error('se cayó') })),
    ).rejects.toThrow('se cayó')
  })
})
