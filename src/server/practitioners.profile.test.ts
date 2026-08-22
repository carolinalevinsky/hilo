import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  testEmail,
} from '@/test/supabase'

/**
 * The account that has no profile, and how it gets one.
 *
 * The sign-up trigger fires `after insert on auth.users`, which means it cannot
 * possibly have run for an account that already existed when the trigger was
 * installed. Every user carried over from v1 is in that state.
 *
 * What that used to do: the app shell read the profile with `.single()`, which
 * treats "no rows" as an error, and an error thrown from a layout renders the
 * generic failure screen on **every** route — including the two buttons on that
 * screen, which both lead back into the shell. Found the hard way, signing in to
 * the first real deployment.
 *
 * These tests run against the real database because the behaviour under test is
 * PostgREST's: `single()` erroring and `maybeSingle()` not, and the unique
 * constraint on `slug` rejecting the second identical link. All three are
 * properties of Postgres, not of code that could be mocked.
 *
 * Needs the local stack up (`npm run db:start`), like `rls.test.ts`.
 */

const service = serviceClient()
const email = testEmail('sin-perfil')
const takenEmail = testEmail('nombre-repetido')

let orphanId = ''
let takenId = ''

beforeAll(async () => {
  // The trigger writes the profile, then it is removed — which is precisely the
  // shape of an account that predates the trigger.
  orphanId = await createTestPractitioner(email, 'Valentina Prueba', 'speech_therapy')
  const { error } = await service.from('practitioners').delete().eq('id', orphanId)
  expect(error, 'could not empty the profile for the fixture').toBeNull()

  // A second practitioner who already owns the slug the orphan will ask for.
  takenId = await createTestPractitioner(takenEmail, 'Valentina Prueba', 'psychology')
})

afterAll(async () => {
  await deleteTestPractitioner(orphanId)
  await deleteTestPractitioner(takenId)
})

describe('an account whose profile is missing', () => {
  it('still exists as an auth user', async () => {
    const { data } = await service.auth.admin.getUserById(orphanId)
    expect(data.user?.id).toBe(orphanId)
  })

  it('has no profile row', async () => {
    const { data } = await service
      .from('practitioners')
      .select('id')
      .eq('id', orphanId)
      .maybeSingle()

    expect(data).toBeNull()
  })

  it('errors with single() — the crash the app shell used to inherit', async () => {
    const { error } = await service
      .from('practitioners')
      .select('*')
      .eq('id', orphanId)
      .single()

    // This is the whole bug in one assertion: the read that a layout cannot
    // survive.
    expect(error).not.toBeNull()
  })

  it('answers null with maybeSingle() — what findPractitioner uses', async () => {
    const { data, error } = await service
      .from('practitioners')
      .select('*')
      .eq('id', orphanId)
      .maybeSingle()

    expect(error).toBeNull()
    expect(data).toBeNull()
  })
})

describe('building the missing profile', () => {
  it('slugify is reachable over RPC, so the slug is the database’s own', async () => {
    const { data, error } = await service.rpc('slugify', { input: 'Valentina Prueba' })

    expect(error).toBeNull()
    expect(data).toBe('valentina-prueba')
  })

  it('strips accents, matching how the trigger builds a slug', async () => {
    const { data } = await service.rpc('slugify', { input: 'Lucía Fernández' })
    expect(data).toBe('lucia-fernandez')
  })

  it('refuses a slug another practitioner already has', async () => {
    // Why `createProfile` retries on the insert failing rather than on a lookup
    // succeeding: the constraint is the thing that decides, and it decides last.
    const { error } = await service.from('practitioners').insert({
      id: orphanId,
      email,
      full_name: 'Valentina Prueba',
      discipline: 'speech_therapy',
      slug: 'valentina-prueba',
    })

    expect(error?.code, 'expected a unique violation on slug').toBe('23505')
  })

  it('accepts the next free slug, and the profile comes back', async () => {
    const { data, error } = await service
      .from('practitioners')
      .insert({
        id: orphanId,
        email,
        full_name: 'Valentina Prueba',
        discipline: 'speech_therapy',
        slug: 'valentina-prueba-2',
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data?.id).toBe(orphanId)
    expect(data?.slug).toBe('valentina-prueba-2')
    // Not asked for on the repair screen, and correct without being asked.
    expect(data?.plan).toBe('free')
  })
})
