import { execFileSync } from 'node:child_process'

import { createClient } from '@supabase/supabase-js'

/**
 * The little bit of database access the end-to-end test needs, which is only
 * ever cleanup.
 *
 * Deliberately not `src/test/supabase.ts`. That file arranges fixtures — it
 * creates practitioners with the admin API and signs them in with a password —
 * and an end-to-end test that used it would be testing the fixture instead of
 * the sign-up screen. Everything here happens *after* the browser is done.
 *
 * The keys come from `supabase status`, not from the environment: CI fills the
 * environment with placeholders so `src/lib/env.ts` parses during the build, and
 * asking the running stack is both accurate and impossible to get out of sync.
 */

function localConfig() {
  const output = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const read = (key: string) => {
    const match = output.match(new RegExp(`^${key}="(.*)"$`, 'm'))
    if (!match?.[1]) throw new Error(`supabase status did not report ${key}`)
    return match[1]
  }

  return { url: read('API_URL'), serviceKey: read('SERVICE_ROLE_KEY') }
}

/** Unique per run, so a crashed run cannot collide with the next one. */
export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@ombua.test`
}

/**
 * An account that already exists and is already confirmed, created without the
 * browser.
 *
 * Every test that needs *somebody to be* uses this. There is no sign-up screen
 * to drive any more — Ombúa is by invitation — and the one test whose subject is
 * how an account comes into existence is `invitation.spec.ts`, which drives the
 * real flow end to end: an admin invites through the panel and the invitee opens
 * the link.
 *
 * The metadata keys are the ones the sign-up trigger reads, so the practitioner
 * row appears exactly as it would have.
 */
export async function createConfirmedUser(input: {
  email: string
  password: string
  fullName: string
  discipline: string
}) {
  const { url, serviceKey } = localConfig()
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName, discipline: input.discipline },
  })
  if (error) throw error
}

/**
 * Makes that account one that can invite.
 *
 * `is_admin` is deliberately not writable through a session — the column grants
 * in `20260906120000` see to that, and `src/server/rls.test.ts` watches it — so
 * there is no screen anywhere that could do this. The service role is the only
 * way, here as in production, where it is a one-line UPDATE run by hand.
 */
export async function grantAdmin(email: string) {
  const { url, serviceKey } = localConfig()
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await admin
    .from('practitioners')
    .update({ is_admin: true })
    .eq('email', email)
  if (error) throw error
}

/**
 * Removes the account the test created, and with it every row underneath.
 *
 * Never throws. This runs in `afterAll`, where a failure would replace the real
 * reason the test failed with a cleanup error — and a leftover row in a local
 * database is a much smaller problem than a misleading report.
 */
export async function deleteAuthUserByEmail(email: string) {
  try {
    const { url, serviceKey } = localConfig()
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data } = await admin.auth.admin.listUsers({ perPage: 200 })
    const user = data?.users.find((candidate) => candidate.email === email)
    if (user) await admin.auth.admin.deleteUser(user.id)
  } catch (error) {
    console.error('[e2e] no se pudo borrar la cuenta de prueba', { email, error })
  }
}
