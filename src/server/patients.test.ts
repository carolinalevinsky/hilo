import { describe, expect, it } from 'vitest'

import { NewPatient } from './patients'

/**
 * Boundary validation tests.
 *
 * Everything entering `src/server/` from the outside is parsed by a Zod schema
 * first, so these tests are cheap and they cover the case that actually
 * matters: bad input never reaches the database.
 *
 * The test that matters most on this project does not exist yet, because the
 * tables do not: an RLS isolation test asserting that practitioner A cannot
 * read practitioner B's rows. It lands with M1 and it is non-negotiable — it is
 * the difference between "we enabled RLS" and "we verified RLS works," and the
 * data is clinical.
 */
describe('NewPatient', () => {
  it('accepts a minimal valid patient', () => {
    const result = NewPatient.safeParse({
      fullName: 'Ana Pereyra',
      dateOfBirth: '2017-04-12',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = NewPatient.safeParse({
      fullName: '',
      dateOfBirth: '2017-04-12',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a free-text age, which is what v1 stored', () => {
    // v1 kept "5 años" in a text field, so age went stale and patients could
    // not be sorted or filtered by it. A real date is the whole point.
    const result = NewPatient.safeParse({
      fullName: 'Ana Pereyra',
      dateOfBirth: '5 años',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an impossible date', () => {
    const result = NewPatient.safeParse({
      fullName: 'Ana Pereyra',
      dateOfBirth: '2017-02-30',
    })
    expect(result.success).toBe(false)
  })
})
