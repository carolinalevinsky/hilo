import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
  type Db,
} from '@/test/supabase'

/**
 * The RLS isolation test. **This one is non-negotiable.**
 *
 * Every other check in this project verifies that RLS is *configured*:
 * `check:rls` asserts each table has it switched on with at least one policy.
 * That is a claim. This is the fact — two real practitioners, two real sessions,
 * and an assertion that one cannot reach the other's rows.
 *
 * The distinction matters because the data is clinical and protected by Ley
 * N.º 18.331. A policy that is enabled but subtly wrong (`using (true)` while
 * someone was debugging) passes every other check in the repository and passes
 * nothing here.
 *
 * **Every new table gets a case in `the clinical tables` below.** A table that
 * holds patient data and is not listed here is protected by a policy nobody has
 * ever watched work.
 *
 * Runs against the local stack, so `npm run db:start` must be up. In CI that is
 * the `npx supabase start` step.
 */

const service = serviceClient()

const emailA = testEmail('rls-a')
const emailB = testEmail('rls-b')

let idA = ''
let idB = ''
let asA: Db
let patientB = ''
let goalB = ''
let sessionB = ''

beforeAll(async () => {
  idA = await createTestPractitioner(emailA, 'Ana Prueba', 'psychopedagogy')
  idB = await createTestPractitioner(emailB, 'Bruno Prueba', 'speech_therapy')
  asA = await signedInAs(emailA)

  // A full clinical record belonging to B, for A to fail to reach.
  const { data: patient } = await service
    .from('patients')
    .insert({ practitioner_id: idB, full_name: 'Paciente de Bruno' })
    .select()
    .single()
  patientB = patient!.id

  const { data: goal } = await service
    .from('goals')
    .insert({
      practitioner_id: idB,
      patient_id: patientB,
      title: 'Objetivo de Bruno',
      progress: 30,
    })
    .select()
    .single()
  goalB = goal!.id

  const { data: session } = await service
    .from('sessions')
    .insert({
      practitioner_id: idB,
      patient_id: patientB,
      progress_note: 'Nota clínica de Bruno',
    })
    .select()
    .single()
  sessionB = session!.id

  await service
    .from('session_goals')
    .insert({ practitioner_id: idB, session_id: sessionB, goal_id: goalB })
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(idA)
  await deleteTestPractitioner(idB)
})

describe('the sign-up trigger', () => {
  it('creates the practitioner row, with a slug', async () => {
    const { data, error } = await service
      .from('practitioners')
      .select('*')
      .eq('id', idA)
      .single()

    expect(error).toBeNull()
    expect(data?.full_name).toBe('Ana Prueba')
    expect(data?.discipline).toBe('psychopedagogy')
    expect(data?.plan).toBe('free')
    // "Ana Prueba" → "ana-prueba". The public booking link is built from this,
    // so it must never contain an accent, a space, or the practitioner's UUID.
    expect(data?.slug).toMatch(/^ana-prueba(-\d+)?$/)
  })
})

describe('row level security on practitioners', () => {
  it('lets a practitioner read their own row', async () => {
    const { data, error } = await asA.from('practitioners').select('*').eq('id', idA)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('does not let a practitioner read another one, even by id', async () => {
    const { data, error } = await asA.from('practitioners').select('*').eq('id', idB)

    // RLS filters rather than rejects: the query succeeds and returns nothing.
    // That is the correct shape — an error would confirm the row exists.
    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('does not leak another practitioner through an unfiltered select', async () => {
    const { data, error } = await asA.from('practitioners').select('id')

    expect(error).toBeNull()
    expect(data?.map((row) => row.id)).toEqual([idA])
  })

  it('does not let a practitioner write to another one', async () => {
    const { data, error } = await asA
      .from('practitioners')
      .update({ full_name: 'Secuestrado' })
      .eq('id', idB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)

    const { data: victim } = await service
      .from('practitioners')
      .select('full_name')
      .eq('id', idB)
      .single()
    expect(victim?.full_name).toBe('Bruno Prueba')
  })
})

describe('the clinical tables', () => {
  it('return nothing from another practitioner, on an unfiltered read', async () => {
    for (const table of ['patients', 'goals', 'goal_progress', 'sessions', 'session_goals'] as const) {
      const { data, error } = await asA.from(table).select('practitioner_id')
      expect(error, `${table} should read cleanly`).toBeNull()
      expect(data, `${table} leaked rows to the wrong practitioner`).toEqual([])
    }
  })

  it('refuse a write aimed at another practitioner', async () => {
    const { data, error } = await asA
      .from('patients')
      .update({ full_name: 'Renombrado' })
      .eq('id', patientB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('refuse a row stamped with another practitioner_id', async () => {
    // The `with check` half of the policy. Without it a practitioner could
    // insert rows *into* someone else's record — invisible to them, and signed
    // with their name.
    const { error } = await asA
      .from('patients')
      .insert({ practitioner_id: idB, full_name: 'Paciente plantado' })

    expect(error).not.toBeNull()
  })
})

describe('the audit log', () => {
  it('can be read by its owner and not by anyone else', async () => {
    const { error: insertError } = await service.from('audit_log').insert([
      { practitioner_id: idA, action: 'create', entity: 'patient' },
      { practitioner_id: idB, action: 'create', entity: 'patient' },
    ])
    expect(insertError).toBeNull()

    const { data, error } = await asA.from('audit_log').select('practitioner_id')

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]?.practitioner_id).toBe(idA)
  })

  it('cannot be written by a practitioner, not even their own', async () => {
    // A log a user can write is not a log. There is no INSERT policy at all, so
    // this must fail — including for their own practitioner_id.
    const { error } = await asA
      .from('audit_log')
      .insert({ practitioner_id: idA, action: 'delete', entity: 'patient' })

    expect(error).not.toBeNull()
  })
})
