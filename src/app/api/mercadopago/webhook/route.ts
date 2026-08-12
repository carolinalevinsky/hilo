import { handlePaymentNotification, verifyWebhookSignature } from '@/server/mercadopago'

/**
 * The Mercado Pago payment webhook. **Defect #7.**
 *
 * v1 had no webhook at all: a practitioner sent a payment link and then had to
 * ask the family whether they had paid, and tick it by hand. This closes the
 * loop.
 *
 * Three things about the shape of this handler:
 *
 * **The signature is verified before anything else happens.** Not
 * `if (SECRET) { verify }` — that shape is defect #10, where an unset variable
 * silently turns the check off and the endpoint accepts anything. The secret is
 * validated at startup by `src/lib/env.ts`, so it cannot be missing, and the
 * verification has no branch that passes without it.
 *
 * **The amount is never read from the request body.** The notification only says
 * "payment 123 changed"; the figure is fetched from Mercado Pago. Otherwise
 * anyone who reached this URL could write any number into a practitioner's
 * books.
 *
 * **It answers 200 even when it ignores the request.** Mercado Pago retries
 * anything that is not a 2xx, so a notification about an unknown payment would
 * otherwise be redelivered forever. An invalid signature is the one case that
 * gets a 401, because that one should be loud.
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const body = (await request.json().catch(() => null)) as {
    type?: string
    action?: string
    data?: { id?: string | number }
  } | null

  // The id arrives in the body on modern notifications and in the query string
  // on the older IPN format. Both are still sent in practice.
  const dataId = String(body?.data?.id ?? url.searchParams.get('data.id') ?? '')
  if (!dataId) return new Response('ok', { status: 200 })

  const valid = verifyWebhookSignature({
    signatureHeader: request.headers.get('x-signature'),
    requestId: request.headers.get('x-request-id'),
    dataId,
  })

  if (!valid) {
    console.warn('[mercadopago] rejected a notification with an invalid signature')
    return new Response('invalid signature', { status: 401 })
  }

  const type = body?.type ?? url.searchParams.get('type')
  if (type !== 'payment') return new Response('ok', { status: 200 })

  try {
    await handlePaymentNotification(dataId)
  } catch (error) {
    // A 500 here means Mercado Pago retries, which is what we want for a
    // transient failure — and the unique constraint on `mp_payment_id` makes the
    // retry safe.
    console.error('[mercadopago] webhook failed', error)
    return new Response('error', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
