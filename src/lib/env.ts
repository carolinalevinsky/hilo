import { z } from 'zod'

/**
 * Server-side environment variables, validated once when the app starts.
 *
 * Two rules, both learned from v1:
 *
 * 1. **One canonical name per variable.** Never write a fallback chain like
 *    `process.env.A || process.env.B || process.env.C`. v1 did that because
 *    nobody was sure which name was set in Vercel, and a typo in all three
 *    resolved to `undefined` in silence — the failure surfaced two weeks later
 *    inside a cron job.
 *
 * 2. **A missing value is a build failure, not a runtime surprise.** This file
 *    is parsed eagerly, so a variable that is absent stops the deploy and names
 *    itself in the error.
 *
 * Never import this from a Client Component. These values are server-only and
 * carry no `NEXT_PUBLIC_` prefix precisely so they never reach a browser.
 */
const serverEnv = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  MP_WEBHOOK_SECRET: z.string().min(1),
})

/**
 * Public variables. The `NEXT_PUBLIC_` prefix is not a naming style — it is the
 * switch that puts a value into the JavaScript bundle every visitor downloads.
 * Only things that are safe to publish belong here.
 */
const publicEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  /**
   * Where Hilo lives. Used to build the links inside emails and the booking link
   * a practitioner hands to families — both of which are read outside a request,
   * so neither can derive it from headers.
   */
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = serverEnv.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  MAIL_FROM: process.env.MAIL_FROM,
  CRON_SECRET: process.env.CRON_SECRET,
  MP_WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET,
})

export const publicConfig = publicEnv.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
