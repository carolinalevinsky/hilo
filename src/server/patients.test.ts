import { describe, expect, it } from 'vitest'

import { PatientInput } from './patients'

/**
 * Boundary validation.
 *
 * Everything entering `src/server/` from the outside is parsed by a Zod schema
 * first, so these tests are cheap and they cover the case that matters: bad
 * input never reaches the database.
 *
 * The empty-string cases are not padding. HTML forms send `""` for every
 * optional field the practitioner left alone, and `""` in a `date` column is an
 * error rather than an absence — so the schema has to turn it into null before
 * Postgres ever sees it.
 */
describe('PatientInput', () => {
  it('accepts a patient with nothing but a name', () => {
    // Creating a patient at the door, with the family still in the room, has to
    // work. Everything else gets filled in later.
    const result = PatientInput.safeParse({ fullName: 'Ana Pereyra' })
    expect(result.success).toBe(true)
    expect(result.data?.ageGroup).toBe('children')
    expect(result.data?.dateOfBirth).toBeNull()
  })

  it('rejects an empty name', () => {
    expect(PatientInput.safeParse({ fullName: '   ' }).success).toBe(false)
  })

  it('rejects a free-text age, which is what v1 stored', () => {
    // v1 kept "5 años" in a text field, so the age went stale and patients could
    // not be sorted or filtered by it. A real date is the whole point.
    const result = PatientInput.safeParse({
      fullName: 'Ana Pereyra',
      dateOfBirth: '5 años',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an impossible date', () => {
    const result = PatientInput.safeParse({
      fullName: 'Ana Pereyra',
      dateOfBirth: '2017-02-30',
    })
    expect(result.success).toBe(false)
  })

  it('turns the empty strings a form sends into nulls', () => {
    const result = PatientInput.safeParse({
      fullName: 'Ana Pereyra',
      dateOfBirth: '',
      startDate: '',
      school: '',
      phone: '',
      sessionFee: '',
      expectedSessionsPerMonth: '',
    })

    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({
      dateOfBirth: null,
      startDate: null,
      school: null,
      phone: null,
      sessionFee: null,
      expectedSessionsPerMonth: null,
    })
  })

  it('coerces a fee typed as text into a number', () => {
    const result = PatientInput.safeParse({ fullName: 'Ana', sessionFee: '1500' })
    expect(result.data?.sessionFee).toBe(1500)
  })

  it('rejects a negative fee', () => {
    expect(PatientInput.safeParse({ fullName: 'Ana', sessionFee: '-100' }).success).toBe(
      false,
    )
  })

  it('rejects an age group that is not one of the three', () => {
    const result = PatientInput.safeParse({ fullName: 'Ana', ageGroup: 'bebés' })
    expect(result.success).toBe(false)
  })
})
