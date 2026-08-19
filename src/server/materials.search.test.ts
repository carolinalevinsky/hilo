import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  testEmail,
} from '@/test/supabase'

/**
 * Searching the materials library with the characters PostgREST treats as
 * syntax.
 *
 * The bug this exists to prevent: `listMaterials` builds its search as one
 * `or(…)` string, and `or()` parses commas as condition separators and
 * parentheses as grouping. A practitioner typing "conciencia, rimas" into the
 * box on the planner — an ordinary thing to type — produced a malformed filter
 * and a **500**, on a screen with no other way to search.
 *
 * It runs against the real PostgREST rather than asserting on a built string,
 * because the thing being tested is what that parser accepts. A unit test on the
 * escaping would have passed with the wrong escape character.
 *
 * Needs the local stack up (`npm run db:start`), like `rls.test.ts`.
 */

const service = serviceClient()
const email = testEmail('search')

let practitionerId = ''
let seeded: string[] = []

/**
 * Talks to PostgREST exactly as `listMaterials` does, both escaping layers
 * included. Kept in step with `searchFilter` there — if these drift, this file
 * stops testing the thing it is named after.
 */
function searchFilter(term: string): string {
  const pattern = `%${term.replace(/[\\%_]/g, (character) => `\\${character}`)}%`
  return `"${pattern.replace(/[\\"]/g, (character) => `\\${character}`)}"`
}

async function search(term: string) {
  const value = searchFilter(term.trim())

  return service
    .from('materials')
    .select('id, title')
    .eq('practitioner_id', practitionerId)
    .or(`title.ilike.${value},objective.ilike.${value},focus.ilike.${value}`)
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Sara Prueba', 'psychopedagogy')

  const rows = [
    { title: 'Conciencia, rimas y palmas', area: 'Lectura', content: 'Actividad' },
    { title: 'Lectura (guiada) de textos', area: 'Lectura', content: 'Actividad' },
    { title: 'Comillas " y barra \\ en el título', area: 'Lectura', content: 'Actividad' },
  ]

  const { data } = await service
    .from('materials')
    .insert(rows.map((row) => ({ ...row, practitioner_id: practitionerId })))
    .select('id')

  seeded = (data ?? []).map((row) => row.id)
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

describe('searching the materials library', () => {
  it('finds a material by an ordinary word', async () => {
    const { data, error } = await search('rimas')

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('survives a comma, which used to be a 500', async () => {
    const { data, error } = await search('conciencia, rimas')

    // The comma is the whole point: unescaped it ends the `ilike` condition and
    // the rest is parsed as another filter.
    expect(error).toBeNull()
    expect(data?.[0]?.title).toBe('Conciencia, rimas y palmas')
  })

  it('survives parentheses', async () => {
    const { data, error } = await search('(guiada)')

    expect(error).toBeNull()
    expect(data?.[0]?.title).toBe('Lectura (guiada) de textos')
  })

  it('survives a double quote and a backslash', async () => {
    // The two characters the escaping itself uses, which is where a naive fix
    // breaks.
    const { data, error } = await search('comillas " y barra \\')

    expect(error).toBeNull()
    expect(data?.[0]?.title).toBe('Comillas " y barra \\ en el título')
  })

  it('treats a percent sign as a character, not a wildcard', async () => {
    // Without the `LIKE` layer of escaping this matches everything, because the
    // pattern becomes `%%%`.
    const { data, error } = await search('%')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('returns nothing, cleanly, for a term that matches nothing', async () => {
    const { data, error } = await search('zzz-no-existe')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('cannot be used to widen the filter past what was seeded', async () => {
    // A term shaped like a PostgREST condition. It must be read as text, not as
    // another clause — otherwise the search box is a way to ask for other rows.
    // (RLS is what actually guarantees that; this asserts the filter too.)
    const { data, error } = await search('a,practitioner_id.neq.' + practitionerId)

    expect(error).toBeNull()
    expect(data).toEqual([])
    expect(seeded).toHaveLength(3)
  })
})
