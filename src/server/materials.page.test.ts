import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Materiales de a 30, con "Ver más" (P18).
 *
 * Contra Postgres de verdad: lo que se prueba es que el corte de la página y el
 * total salgan de la misma consulta que filtra, y eso es lo que hace PostgREST
 * con `range` y `count`, no un doble.
 *
 * Con "Los míos" y materiales creados acá, para que los números sean exactos:
 * la biblioteca de la profesión y lo que publica la comunidad cambian con lo que
 * hacen otros tests al mismo tiempo.
 *
 * Necesita el stack local levantado (`npm run db:start`).
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const { MATERIALS_PAGE, listMaterials, pageMaterials } = await import('./materials')

const service = serviceClient()
const email = testEmail('materiales-pagina')

let me = ''
const mine = { discipline: 'psychopedagogy', onlyMine: true }

beforeAll(async () => {
  me = await createTestPractitioner(email, 'Paginadora Materiales Prueba')
  holder.db = await signedInAs(email)
  holder.service = service

  // 37 of mine: a full page, a second full page would need 60, so the second
  // "Ver más" ends short. Five of them share a word for the search case, and
  // two share a title for the tie.
  const rows = Array.from({ length: 37 }, (_, index) => ({
    practitioner_id: me,
    title:
      index < 5
        ? `Lotería de sílabas ${index + 1}`
        : index < 7
          ? 'Mismo título'
          : `Actividad ${String(index + 1).padStart(2, '0')}`,
    area: 'Lectura',
    content: 'Contenido de prueba.',
  }))
  const { error } = await service.from('materials').insert(rows)
  if (error) throw error
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(me)
})

describe('pageMaterials', () => {
  it('trae los primeros 30 y dice cuántos hay en total', async () => {
    const { materials, total } = await pageMaterials(me, mine)

    expect(MATERIALS_PAGE).toBe(30)
    expect(materials).toHaveLength(30)
    expect(total).toBe(37)
  })

  it('"Ver más" trae los mismos 30 y los que siguen, sin repetir ni saltear', async () => {
    const first = await pageMaterials(me, mine, 30)
    const second = await pageMaterials(me, mine, 60)

    expect(second.materials).toHaveLength(37)
    expect(second.materials.slice(0, 30).map((m) => m.id)).toEqual(
      first.materials.map((m) => m.id),
    )
    expect(new Set(second.materials.map((m) => m.id)).size).toBe(37)
  })

  it('el total es el de la biblioteca entera, el mismo que ve el planificador', async () => {
    const { total } = await pageMaterials(me, mine)
    const everything = await listMaterials(me, mine)

    expect(total).toBe(everything.length)
  })

  it('la búsqueda se aplica antes de cortar la página', async () => {
    const { materials, total } = await pageMaterials(me, { ...mine, search: 'loteria' })

    expect(total).toBe(5)
    expect(materials.map((m) => m.title).every((title) => title.startsWith('Lotería'))).toBe(
      true,
    )
  })
})
