import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import type { Database } from '@/lib/database.types'
import { env, publicConfig } from '@/lib/env'

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
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
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
 * It exists for the four cases where there is genuinely no user session to act
 * on behalf of:
 *
 *   1. `mercadopago.ts`  — reading a practitioner's Mercado Pago access token,
 *                          which has no SELECT policy for anyone.
 *   2. `mercadopago.ts`  — the payment webhook, called by Mercado Pago.
 *   3. `booking.ts`      — a public booking request from an anonymous visitor.
 *   4. `audit.ts`        — writing the audit log.
 *
 * The allowlist in `eslint.config.mjs` is what keeps that list honest. Importing
 * this anywhere else fails the build.
 */
export function getServiceDb() {
  return createClient<Database>(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
