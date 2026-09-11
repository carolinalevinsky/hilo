import { afterAll, describe, expect, it } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  testEmail,
} from '@/test/supabase'

/**
 * Two sign-ups with the same name at the same instant both get an account.
 *
 * The sign-up trigger used to look for a free slug and then insert it, so two
 * concurrent sign-ups both saw the same slug free and the second one failed on
 * `practitioners_slug_key` — which GoTrue reports as "Database error creating
 * new user", with no account created. It showed up as flakiness whenever two
 * test files reused a name.
 *
 * The name is unique to this run so the assertion is about these two rows only,
 * not about whatever else happens to share a slug in the local database.
 *
 * Needs the local stack up (`npm run db:start`), like `rls.test.ts`.
 */

const service = serviceClient()
const fullName = `Gemela Prueba ${Date.now()}`

let ids: string[] = []

afterAll(async () => {
  await Promise.all(ids.map((id) => deleteTestPractitioner(id)))
})

describe('concurrent sign-ups with the same name', () => {
  it('all succeed, with different slugs', async () => {
    // Five rather than two: a pair does not always land in the same instant, and
    // a test that races only sometimes proves nothing when it passes.
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, i) => createTestPractitioner(testEmail(`gemela-${i}`), fullName)),
    )
    ids = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))

    expect(
      results.filter((r) => r.status === 'rejected'),
      'a sign-up failed',
    ).toEqual([])

    const { data, error } = await service
      .from('practitioners')
      .select('slug')
      .in('id', ids)

    expect(error).toBeNull()
    const base = `gemela-prueba-${fullName.split(' ').at(-1)}`
    expect(data?.map((row) => row.slug).sort()).toEqual([
      base,
      `${base}-2`,
      `${base}-3`,
      `${base}-4`,
      `${base}-5`,
    ])
  })
})
