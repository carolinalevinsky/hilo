import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import { AUTH_COOKIE_OPTIONS, SESSION_ONLY_COOKIE, withLifetime } from '@/lib/auth-cookie'
import type { Database } from '@/lib/database.types'
import { env, publicConfig } from '@/lib/env'

import { fetchSurvivingStaleClock } from './postgrest-clock'

/**
 * Database clients.
 *
 * This is the ONE file in `src/server/` allowed to import from `next/*`, and
 * the exception is deliberate: reading the session cookie is transport work, not
 * business logic. Everything else in `src/server/` stays framework-free, which
 * means moving this backend to a worker or a Fastify service later is a matter
 * of rewriting this single file — not a migration.
 *
 * The lint rule in `eslint.config.mjs` enforces that. If a second file in
 * `src/server/` needs `next/*`, the answer is almost always to pass the value in
 * as an argument instead.
 */

/**
 * The normal client. It carries the signed-in practitioner's session, so Row
 * Level Security applies to every query. **Use this unless you have a specific,
 * written reason not to.**
 */
export async function getDb() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // Not optional, and not the library's defaults. See `@/lib/auth-cookie`:
      // this cookie carries the refresh token, and `@supabase/ssr` writes it
      // without `HttpOnly` and without `Secure` unless told otherwise.
      cookieOptions: AUTH_COOKIE_OPTIONS,
      // A token minted seconds ago can be refused as "issued at future" by
      // PostgREST. See `./postgrest-clock`.
      global: { fetch: fetchSurvivingStaleClock() },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            // Read at write time, not when the client is built: on sign-in the
            // action sets this marker a moment before Supabase writes the
            // session. See "How long it lives" in `@/lib/auth-cookie`.
            const sessionOnly = cookieStore.get(SESSION_ONLY_COOKIE)?.value === '1'
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, withLifetime(options, sessionOnly))
            }
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  )
}

/**
 * The service-role client. **It bypasses Row Level Security completely.** Every
 * query made with it can read and write every practitioner's data, so a missing
 * `practitioner_id` filter here silently leaks clinical records.
 *
 * It exists for the handful of cases where there is genuinely no user session to
 * act on behalf of — a webhook, a cron, a public form, somebody who does not
 * have an account yet.
 *
 * **Which files those are is not listed here.** It was, and it went stale
 * twice: this comment said "the four cases" while the allowlist had grown to
 * seven, which is worse than no list at all — somebody checking whether their
 * case is already covered gets a confident wrong answer. It lives in exactly
 * two places now, and both are checked: `SERVICE_DB_ALLOWED` in
 * `eslint.config.mjs`, which fails the build, and the "Security invariants"
 * section of `CLAUDE.md`, which is the one a person reads.
 */
export function getServiceDb() {
  return createClient<Database>(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
