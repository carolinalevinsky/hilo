import { publicConfig, env } from '@/lib/env'
import { DIGEST_BATCH_SIZE, digestRecipients } from '@/server/digest'
import { sendDigest } from '@/server/notifications'

/**
 * The fortnightly digest, run by Vercel Cron. **Defect #12.**
 *
 * Scheduled in `vercel.json` for 11:00 on the 1st and the 15th — v1's schedule,
 * unchanged, because it was a good one.
 *
 * ─── The authentication is not conditional ────────────────────────────────
 *
 * v1 wrote `if (SECRET) { validate }` (`legacy/api/resumen.js:27`), which means
 * that with the variable unset the endpoint accepted anything and a stranger
 * could trigger a full send on demand. `CRON_SECRET` is validated at startup by
 * `src/lib/env.ts`, so it cannot be missing — and the comparison below has no
 * branch that passes without it.
 *
 * ─── Bounded ──────────────────────────────────────────────────────────────
 *
 * At most `DIGEST_BATCH_SIZE` emails per invocation. v1's serial loop over every
 * practitioner works at five and times out well before five hundred; this run
 * finishes in a knowable time regardless, and the ones it did not reach go out
 * on the next run.
 */
export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')

  if (authorization !== `Bearer ${env.CRON_SECRET}`) {
    return Response.json({ error: 'no autorizado' }, { status: 401 })
  }

  const recipients = await digestRecipients(DIGEST_BATCH_SIZE)

  let sent = 0
  for (const recipient of recipients) {
    // `sendDigest` never throws — one bad address must not stop the batch.
    const ok = await sendDigest({
      to: recipient.email,
      summary: recipient.summary,
      appUrl: publicConfig.NEXT_PUBLIC_APP_URL,
    })
    if (ok) sent += 1
  }

  return Response.json({
    considered: recipients.length,
    sent,
    capped: recipients.length >= DIGEST_BATCH_SIZE,
  })
}
