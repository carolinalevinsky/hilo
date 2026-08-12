import { execFileSync } from 'node:child_process'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Database } from '@/lib/database.types'

/**
 * The RLS isolation test. **This one is non-negotiable.**
 *
 * Every other check in this project verifies that RLS is *configured*:
 * `check:rls` asserts each table has it switched on with at least one policy.
 * That is a claim. This is the fact — two real practitioners, two real sessions,
 * and an assertion that one cannot reach the other's rows.
 *
 * The distinction matters because the data is clinical and protected by Ley
 * N.º 18.331. A policy that is enabled but subtly wrong ("using (true)" while
 * someone was debugging) passes every other check in the repository and passes
 * nothing here.
 *
 * It runs against the local stack, so `npm run db:start` must be up. In CI that
 * is the `npx supabase start` step.
 *
 * The keys come from `supabase status` rather than the environment because CI
 * fills the environment with placeholders so that `src/lib/env.ts` parses during
 * the build. Asking the running stack is both more accurate and impossible to
 * get subtly out of sync.
 */

type Db = SupabaseClient<Database>

function localSupabaseConfig() {
  const output = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const read = (key: string) => {
    const match = output.match(new RegExp(`^${key}="(.*)"$`, 'm'))
    if (!match?.[1]) throw new Error(`supabase status did not report ${key}`)
    return match[1]
  }

  return {
    url: read('API_URL'),
    anonKey: read('ANON_KEY'),
    serviceKey: read('SERVICE_ROLE_KEY'),
  }
}

const config = localSupabaseConfig()

const service: Db = createClient<Database>(config.url, config.serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

/** A client carrying one practitioner's session — the same thing `getDb()` builds. */
async function signedInAs(email: string, password: string): Promise<Db> {
  const client = createClient<Database>(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

async function createPractitioner(email: string, fullName: string, discipline: string) {
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, discipline },
  })
  if (error) throw error
  return data.user.id
}

const PASSWORD = 'una-clave-de-prueba'
const stamp = Date.now()
const emailA = `rls-a-${stamp}@hilo.test`
const emailB = `rls-b-${stamp}@hilo.test`

let idA = ''
let idB = ''
let asA: Db

beforeAll(async () => {
  idA = await createPractitioner(emailA, 'Ana Prueba', 'psychopedagogy')
  idB = await createPractitioner(emailB, 'Bruno Prueba', 'speech_therapy')
  asA = await signedInAs(emailA, PASSWORD)
}, 60_000)

afterAll(async () => {
  // Deleting the auth user cascades to `practitioners` and everything under it.
  if (idA) await service.auth.admin.deleteUser(idA)
  if (idB) await service.auth.admin.deleteUser(idB)
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

describe('row level security', () => {
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
