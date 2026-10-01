import { timingSafeEqual } from 'node:crypto'

import { publicConfig, env } from '@/lib/env'
import { DIGEST_BATCH_SIZE, digestRecipients, markDigestSent } from '@/server/digest'
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
 * on the next run — which is true because the batch is stamped below and the
 * next run orders by that stamp, not because a cap implies a queue.
 */
export async function GET(request: Request) {
  if (!authorised(request.headers.get('authorization'))) {
    return Response.json({ error: 'no autorizado' }, { status: 401 })
  }

  const recipients = await digestRecipients(DIGEST_BATCH_SIZE)

  const delivered: string[] = []
  const failed: string[] = []
  for (const recipient of recipients) {
    // `sendDigest` never throws — one bad address must not stop the batch.
    const ok = await sendDigest({
      to: recipient.email,
      summary: recipient.summary,
      appUrl: publicConfig.NEXT_PUBLIC_APP_URL,
    })
    if (ok) delivered.push(recipient.practitionerId)
    else failed.push(recipient.practitionerId)
  }

  // Only the ones that went out. A failed send keeps its old stamp, so it is
  // first in line on the next run instead of being recorded as delivered. It
  // used to stamp the whole batch so that a bad address could not sit at the
  // head of the queue forever — but that also wrote "sent" over every email of
  // a run where Resend was down. A bad address now takes one place per run out
  // of forty, which is visible in the log and in `failed` below.
  await markDigestSent(delivered)
  if (failed.length > 0) {
    console.error('[digest] no salieron', { practitionerIds: failed })
  }

  return Response.json({
    considered: recipients.length,
    sent: delivered.length,
    failed: failed.length,
    capped: recipients.length >= DIGEST_BATCH_SIZE,
  })
}

/**
 * El bearer del cron, comparado en tiempo constante.
 *
 * Era un `!==` sobre la cadena entera. En la práctica no era un ataque: medir
 * diferencias de nanosegundos a través de la red, contra una función serverless
 * que a veces arranca en frío, no es algo que nadie haga. Se cambia igual
 * porque cuesta cuatro líneas, y dos formas distintas de comparar un secreto en
 * la misma base de código es una invitación a copiar la peor.
 *
 * La comparación de largos va antes y por fuera: `timingSafeEqual` tira si los
 * buffers no miden lo mismo, y el largo de un secreto no es lo que se está
 * protegiendo.
 */
function authorised(header: string | null): boolean {
  if (!header) return false

  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`, 'utf8')
  const received = Buffer.from(header, 'utf8')

  if (expected.length !== received.length) return false
  return timingSafeEqual(expected, received)
}
