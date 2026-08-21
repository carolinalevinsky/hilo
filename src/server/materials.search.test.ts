import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { normaliseTerm, searchPattern } from '@/lib/search'
import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  testEmail,
} from '@/test/supabase'

/**
 * Searching the materials library.
 *
 * Two bugs live behind these tests, and the second one is the reason the first
 * can no longer happen.
 *
 * **The 500.** The search used to be built as one PostgREST `or(…)` string with
 * the term concatenated into it. `or()` reads a comma as the end of a condition,
 * so typing "conciencia, rimas" — an entirely ordinary thing to type — produced a
 * malformed filter and a 500, on a screen with no other way to search. It was
 * never an injection hole (RLS decides which rows exist regardless of what the
 * filter says) but it was a crash reached by typing normally.
 *
 * **The accents.** `ilike` folds case and leaves accents alone, so "fonologica"
 * found nothing and "Conciencia fonológica" was sitting right there.
 *
 * Both are gone for the same reason: the search now runs against `search_text`,
 * a generated column the database keeps lowercased and unaccented, and the term
 * goes in as an argument rather than as text spliced into a filter. There is no
 * longer a string to malform.
 *
 * These run against the real database because what is under test is what
 * Postgres does: a generated column, `ilike` semantics, and the escape rules of
 * `LIKE`. A unit test on the pattern builder would agree with itself.
 *
 * Needs the local stack up (`npm run db:start`), like `rls.test.ts`.
 */

const service = serviceClient()
const email = testEmail('search')

let practitionerId = ''

async function search(term: string) {
  return service
    .from('materials')
    .select('id, title')
    .eq('practitioner_id', practitionerId)
    .ilike('search_text', searchPattern(term))
}

async function titles(term: string) {
  const { data, error } = await search(term)
  expect(error).toBeNull()
  return (data ?? []).map((row) => row.title).sort()
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Sara Prueba', 'psychopedagogy')

  const rows = [
    { title: 'Conciencia, rimas y palmas', area: 'Lectura', content: 'Actividad' },
    { title: 'Lectura (guiada) de textos', area: 'Lectura', content: 'Actividad' },
    { title: 'Comillas " y barra \\ en el título', area: 'Lectura', content: 'Actividad' },
    { title: 'Conciencia fonológica avanzada', area: 'Lectura', content: 'Actividad' },
    { title: 'El niño que leía despacio', area: 'Lectura', content: 'Actividad' },
    { title: 'Cien por ciento %', area: 'Lectura', content: 'Actividad' },
    { title: 'Guion_bajo en el medio', area: 'Lectura', content: 'Actividad' },
  ]

  const { error } = await service
    .from('materials')
    .insert(rows.map((row) => ({ ...row, practitioner_id: practitionerId })))

  expect(error, 'the fixture insert itself failed').toBeNull()
})

afterAll(async () => {
  await service.from('materials').delete().eq('practitioner_id', practitionerId)
  await deleteTestPractitioner(practitionerId)
})

describe('the characters that used to break the filter', () => {
  it('finds a term with a comma in it', async () => {
    expect(await titles('conciencia, rimas')).toEqual(['Conciencia, rimas y palmas'])
  })

  it('finds a term with parentheses', async () => {
    expect(await titles('(guiada)')).toEqual(['Lectura (guiada) de textos'])
  })

  it('finds a term with a quote and a backslash', async () => {
    expect(await titles('" y barra \\')).toEqual(['Comillas " y barra \\ en el título'])
  })

  it('does not error on a term shaped like a filter condition', async () => {
    const { error } = await search('title.ilike.*,practitioner_id.eq.0')
    expect(error).toBeNull()
  })
})

describe('accents', () => {
  it('finds an accented title from an unaccented term', async () => {
    expect(await titles('fonologica')).toEqual(['Conciencia fonológica avanzada'])
  })

  it('finds an unaccented title from an accented term', async () => {
    // The reverse direction, which is what happens when somebody types with the
    // accent and the material was written without it.
    expect(await titles('avanzáda')).toEqual(['Conciencia fonológica avanzada'])
  })

  it('handles the ñ', async () => {
    expect(await titles('nino')).toEqual(['El niño que leía despacio'])
  })

  it('still folds case', async () => {
    expect(await titles('CONCIENCIA FONOLOGICA')).toEqual([
      'Conciencia fonológica avanzada',
    ])
  })
})

describe('the wildcards of LIKE, taken literally', () => {
  it('treats % as a character and not as "everything"', async () => {
    expect(await titles('%')).toEqual(['Cien por ciento %'])
  })

  it('treats _ as a character and not as "any character"', async () => {
    expect(await titles('guion_bajo')).toEqual(['Guion_bajo en el medio'])
  })

  it('returns nothing when nothing matches', async () => {
    expect(await titles('zzzz-no-existe')).toEqual([])
  })
})

describe('the TypeScript normalisation and the SQL one agree', () => {
  /**
   * The guard against the drift that would be worst: `normaliseTerm` is a
   * hand-written copy of `public.unaccent_fallback`, and if the two ever
   * disagree about one character the search silently stops finding a row that is
   * right there. Neither a type nor a lint rule can catch that.
   */
  it('produces the same string as unaccent_fallback, character for character', async () => {
    const muestras = [
      'Conciencia fonológica',
      'El niño que leía',
      'ÁÉÍÓÚ ÀÈÌÒÙ ÄËÏÖÜ ÂÊÎÔÛ ÃÕ Ñ Ç',
      'áéíóú àèìòù äëïöü âêîôû ãõ ñ ç',
      'sin nada raro',
    ]

    for (const muestra of muestras) {
      const { data, error } = await service.rpc('unaccent_fallback', { input: muestra })
      expect(error).toBeNull()
      expect(normaliseTerm(muestra), muestra).toBe(String(data).toLowerCase())
    }
  })
})
