import { execFileSync } from 'node:child_process'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/database.types'

/**
 * Test-only helpers for talking to the local Supabase stack.
 *
 * Not application code. It lives outside `src/server/` so nothing in the backend
 * can import it by accident, and so it is free to use `@supabase/*` directly —
 * which is the point: these tests must build their own clients rather than go
 * through `getDb()`, because `getDb()` reads a request cookie that does not
 * exist in a test.
 *
 * The keys come from `supabase status` rather than the environment. CI fills the
 * environment with placeholders so `src/lib/env.ts` parses during the build;
 * asking the running stack is both accurate and impossible to get out of sync.
 */

export type Db = SupabaseClient<Database>

export const TEST_PASSWORD = 'una-clave-de-prueba'

let cached: { url: string; anonKey: string; serviceKey: string } | null = null

export function localSupabaseConfig() {
  if (cached) return cached

  const output = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const read = (key: string) => {
    const match = output.match(new RegExp(`^${key}="(.*)"$`, 'm'))
    if (!match?.[1]) throw new Error(`supabase status did not report ${key}`)
    return match[1]
  }

  cached = {
    url: read('API_URL'),
    anonKey: read('ANON_KEY'),
    serviceKey: read('SERVICE_ROLE_KEY'),
  }
  return cached
}

/** Bypasses RLS. For arranging fixtures and for asserting what really landed. */
export function serviceClient(): Db {
  const config = localSupabaseConfig()
  return createClient<Database>(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** A client carrying one practitioner's session — what `getDb()` builds at runtime. */
export async function signedInAs(email: string, password = TEST_PASSWORD): Promise<Db> {
  const config = localSupabaseConfig()
  const client = createClient<Database>(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

/**
 * Creates a practitioner the way sign-up does: an auth user with the metadata,
 * leaving the M1 trigger to write the `practitioners` row.
 */
export async function createTestPractitioner(
  email: string,
  fullName: string,
  discipline = 'psychopedagogy',
) {
  const { data, error } = await serviceClient().auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, discipline },
  })
  if (error) throw error
  return data.user.id
}

/** Deleting the auth user cascades through every table below it. */
export async function deleteTestPractitioner(id: string) {
  if (id) await serviceClient().auth.admin.deleteUser(id)
}

/** A unique email per run, so a leftover row from a crashed test cannot collide. */
export function testEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@hilo.test`
}
