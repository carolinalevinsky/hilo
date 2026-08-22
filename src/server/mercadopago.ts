import { createHmac, timingSafeEqual } from 'node:crypto'

import { z } from 'zod'

import { env } from '@/lib/env'

import { getDb, getServiceDb } from './db'

/**
 * Mercado Pago.
 *
 * Two of the four places in this codebase allowed to use the service-role
 * client, and the only file that uses it for both a read and a write:
 *
 *   1. Reading a practitioner's access token. `mp_accounts` has no policy that
 *      grants anything, so nothing carrying a user session can read it — not the
 *      browser, not a Server Component. This is defect #1's fix, and it is
 *      structural: the token is unreachable rather than carefully handled.
 *
 *   2. The payment webhook. Mercado Pago calls it with no user session at all,
 *      so there is nothing for RLS to check against.
 *
 * Everything else about payments lives in `payments.ts` and uses `getDb()`.
 */

const MP_API = 'https://api.mercadopago.com'

// ─── The practitioner's account ─────────────────────────────────────────────

export const MpConnection = z.object({
  accessToken: z.string().trim().min(20, 'Revisá el access token, parece incompleto.'),
})

/**
 * Stores the practitioner's access token.
 *
 * Written with the service role because the table is unreadable and unwritable
 * to everyone else — including its owner. That is the point: a token that the
 * practitioner's own browser cannot fetch is a token that cannot leak from it.
 */
export async function connectMercadoPago(practitionerId: string, input: unknown) {
  const { accessToken } = MpConnection.parse(input)
  const db = getServiceDb()

  const { error } = await db
    .from('mp_accounts')
    .upsert(
      { practitioner_id: practitionerId, access_token: accessToken },
      { onConflict: 'practitioner_id' },
    )

  if (error) throw error
}

export async function disconnectMercadoPago(practitionerId: string) {
  const db = getServiceDb()
  const { error } = await db
    .from('mp_accounts')
    .delete()
    .eq('practitioner_id', practitionerId)

  if (error) throw error
}

/**
 * Whether an account is connected — without reading the token.
 *
 * The interface needs to know "is Mercado Pago set up?" on several screens, and
 * that question must never be answered by fetching the credential and checking
 * whether it is empty. Selecting only `connected_at` keeps the secret out of
 * every code path that merely needs a yes or no.
 */
export async function isMercadoPagoConnected(practitionerId: string): Promise<boolean> {
  const db = getServiceDb()
  const { data, error } = await db
    .from('mp_accounts')
    .select('connected_at')
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

/**
 * Reads the token. Server-only, and nothing should call it except
 * `createPaymentLink` below.
 */
async function accessTokenFor(practitionerId: string): Promise<string | null> {
  const db = getServiceDb()
  const { data, error } = await db
    .from('mp_accounts')
    .select('access_token')
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return data?.access_token ?? null
}

// ─── Charging ───────────────────────────────────────────────────────────────

export class MercadoPagoError extends Error {}

/**
 * Creates a Checkout Pro preference on the practitioner's own Mercado Pago
 * account and returns the link to send the family.
 *
 * The money goes practitioner → family directly; Hilo is not a party to it and
 * never holds funds. That is also what the terms say (clause 12).
 *
 * `externalReference` is what ties the eventual webhook back to a patient and a
 * month. Without it the notification is an amount with no idea who paid.
 */
export async function createPaymentLink(
  practitionerId: string,
  {
    amount,
    title,
    externalReference,
  }: { amount: number; title: string; externalReference: string },
): Promise<string> {
  if (!(amount > 0)) throw new MercadoPagoError('El monto tiene que ser mayor a cero.')

  const token = await accessTokenFor(practitionerId)
  if (!token) {
    throw new MercadoPagoError('Todavía no conectaste tu cuenta de Mercado Pago.')
  }

  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: title.slice(0, 120),
          quantity: 1,
          unit_price: amount,
          currency_id: 'UYU',
        },
      ],
      external_reference: externalReference,
      auto_return: 'approved',
    }),
  })

  const payload = (await response.json().catch(() => null)) as {
    init_point?: string
    sandbox_init_point?: string
    message?: string
  } | null

  if (!response.ok) {
    // The practitioner sees a sentence; the detail goes to the server log. An
    // API error from Mercado Pago is not something to render on a screen next to
    // a patient's name.
    console.error('[mercadopago] preference failed', payload)
    throw new MercadoPagoError('Mercado Pago rechazó el pedido. Revisá tu cuenta.')
  }

  const link = payload?.init_point ?? payload?.sandbox_init_point
  if (!link) throw new MercadoPagoError('Mercado Pago no devolvió un link.')
  return link
}

// ─── The webhook ────────────────────────────────────────────────────────────

/**
 * Verifies the `x-signature` header Mercado Pago sends.
 *
 * The header looks like `ts=1704908010,v1=<hex>` and the signed string is
 * `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` — an exact format, including
 * the trailing semicolon.
 *
 * **Note the shape of this function: it never returns true when the secret is
 * missing.** v1 wrote `if (SECRET) { validate }`, which means an unset
 * environment variable silently turns the check off and the endpoint accepts
 * anything (`legacy/api/aviso-reserva.js:22`). Here the secret is validated at
 * startup by `src/lib/env.ts`, so it cannot be absent — and even if it were, the
 * comparison below would fail rather than pass.
 */
export function verifyWebhookSignature({
  signatureHeader,
  requestId,
  dataId,
}: {
  signatureHeader: string | null
  requestId: string | null
  dataId: string
}): boolean {
  if (!signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=')
      return [key?.trim() ?? '', value?.trim() ?? '']
    }),
  )

  const ts = parts.ts
  const received = parts.v1
  if (!ts || !received) return false

  const manifest = `id:${dataId};request-id:${requestId ?? ''};ts:${ts};`
  const expected = createHmac('sha256', env.MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex')

  // Constant-time: a plain `===` leaks how much of the signature was right
  // through how long the comparison took, one byte at a time.
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(received, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

type MpPayment = {
  id: number
  status: string
  transaction_amount: number
  external_reference?: string | null
  date_approved?: string | null
}

/**
 * Handles one payment notification: fetch the payment from Mercado Pago, then
 * record it.
 *
 * The amount is read back from Mercado Pago rather than taken from the request
 * body. The notification says only "payment 123 changed"; trusting a body-supplied
 * amount would let anyone who can reach the URL write any figure into a
 * practitioner's books.
 *
 * Idempotent through the unique constraint on `payments.mp_payment_id`. Mercado
 * Pago retries until it gets a 2xx, so the same payment arrives several times and
 * must land once.
 */
export async function handlePaymentNotification(paymentId: string): Promise<void> {
  const db = getServiceDb()

  const { data: existing } = await db
    .from('payments')
    .select('id, practitioner_id')
    .eq('mp_payment_id', paymentId)
    .maybeSingle()

  const reference = existing ? null : await pendingReference(paymentId)
  const practitionerId = existing?.practitioner_id ?? reference?.practitionerId
  if (!practitionerId) {
    console.warn('[mercadopago] notification for an unknown practitioner', { paymentId })
    return
  }

  const token = await accessTokenFor(practitionerId)
  if (!token) return

  const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    console.error('[mercadopago] could not read the payment', { paymentId })
    return
  }

  const payment = (await response.json()) as MpPayment
  const status =
    payment.status === 'approved'
      ? 'confirmed'
      : payment.status === 'rejected' || payment.status === 'cancelled'
        ? 'failed'
        : 'pending'

  if (existing) {
    await db.from('payments').update({ status }).eq('id', existing.id)
    return
  }

  await db.from('payments').insert({
    practitioner_id: practitionerId,
    patient_id: reference!.patientId,
    period: reference!.period,
    paid_on: (payment.date_approved ?? new Date().toISOString()).slice(0, 10),
    amount: payment.transaction_amount,
    method: 'mercadopago',
    status,
    mp_payment_id: paymentId,
  })
}

/**
 * Reads `external_reference` off the payment to find out who it belongs to.
 *
 * The reference is written by `createPaymentLink` as
 * `<practitioner_id>:<patient_id>:<period>`. Reading it needs a token, and
 * choosing a token needs the reference — so this walks the practitioners who
 * have a connected account until one of them can read the payment. That is at
 * most one HTTP call per connected account, and only for a payment we have never
 * seen; every retry after the first takes the `existing` path above.
 */
async function pendingReference(paymentId: string) {
  const db = getServiceDb()
  const { data: accounts } = await db
    .from('mp_accounts')
    .select('practitioner_id, access_token')

  for (const account of accounts ?? []) {
    const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    })
    if (!response.ok) continue

    const payment = (await response.json()) as MpPayment
    const parsed = parseExternalReference(payment.external_reference)
    if (parsed && parsed.practitionerId === account.practitioner_id) return parsed
  }

  return null
}

export function buildExternalReference(
  practitionerId: string,
  patientId: string,
  period: string,
): string {
  return `${practitionerId}:${patientId}:${period}`
}

export function parseExternalReference(reference: string | null | undefined) {
  if (!reference) return null
  const [practitionerId, patientId, period] = reference.split(':')
  if (!practitionerId || !patientId || !period) return null
  return { practitionerId, patientId, period }
}

/**
 * The practitioner's own view of their connection. Uses the session client on
 * purpose: it touches no secret, so it does not need — and must not have — the
 * service role.
 */
export async function paymentLinkFor(practitionerId: string) {
  const db = await getDb()
  const { data } = await db
    .from('practitioners')
    .select('slug')
    .eq('id', practitionerId)
    .maybeSingle()
  return data?.slug ?? null
}
