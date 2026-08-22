import { createHmac } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import {
  buildExternalReference,
  parseExternalReference,
  verifyWebhookSignature,
} from './mercadopago'

/**
 * Webhook signature verification.
 *
 * This is the gate between "Mercado Pago says a family paid" and a row in a
 * practitioner's books. The plan calls it out by name as something that must be
 * tested, and the reason is defect #10: v1's equivalent check was written
 * `if (SECRET) { validate }`, so an unset environment variable turned it off
 * entirely and the endpoint accepted anything.
 *
 * The secret here is whatever the test environment has — CI uses a placeholder,
 * `.env.local` uses a local value. What matters is that the same secret signs
 * and verifies, and that everything else is rejected.
 */

const SECRET = process.env.MP_WEBHOOK_SECRET!

function sign({
  dataId,
  requestId,
  ts,
  secret = SECRET,
}: {
  dataId: string
  requestId: string
  ts: string
  secret?: string
}) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const v1 = createHmac('sha256', secret).update(manifest).digest('hex')
  return `ts=${ts},v1=${v1}`
}

describe('verifyWebhookSignature', () => {
  const dataId = '1234567890'
  const requestId = 'req-abc'
  const ts = '1786496800'

  it('accepts a correctly signed notification', () => {
    expect(
      verifyWebhookSignature({
        signatureHeader: sign({ dataId, requestId, ts }),
        requestId,
        dataId,
      }),
    ).toBe(true)
  })

  it('rejects a notification with no signature at all', () => {
    // The case that mattered in v1: no header, and the check waved it through.
    expect(verifyWebhookSignature({ signatureHeader: null, requestId, dataId })).toBe(false)
  })

  it('rejects a signature made with a different secret', () => {
    expect(
      verifyWebhookSignature({
        signatureHeader: sign({ dataId, requestId, ts, secret: 'otra-clave' }),
        requestId,
        dataId,
      }),
    ).toBe(false)
  })

  it('rejects a signature replayed for a different payment', () => {
    // Without this, one captured notification could be replayed to confirm any
    // payment id the attacker chose.
    expect(
      verifyWebhookSignature({
        signatureHeader: sign({ dataId, requestId, ts }),
        requestId,
        dataId: '9999999999',
      }),
    ).toBe(false)
  })

  it('rejects a signature replayed with a different request id', () => {
    expect(
      verifyWebhookSignature({
        signatureHeader: sign({ dataId, requestId, ts }),
        requestId: 'req-otro',
        dataId,
      }),
    ).toBe(false)
  })

  it('rejects a malformed header', () => {
    for (const header of ['', 'v1=abc', 'ts=123', 'basura', 'ts=,v1=']) {
      expect(
        verifyWebhookSignature({ signatureHeader: header, requestId, dataId }),
        `"${header}" should not verify`,
      ).toBe(false)
    }
  })

  it('rejects a truncated signature rather than crashing on the length check', () => {
    const full = sign({ dataId, requestId, ts })
    expect(
      verifyWebhookSignature({
        signatureHeader: full.slice(0, full.length - 10),
        requestId,
        dataId,
      }),
    ).toBe(false)
  })
})

describe('external reference', () => {
  it('round-trips the practitioner, patient, and period', () => {
    // This is what ties a notification back to a person and a month. Mercado
    // Pago only says "payment 123 changed"; without it, the money has no owner.
    const reference = buildExternalReference('prac-1', 'pat-2', '2026-08')

    expect(parseExternalReference(reference)).toEqual({
      practitionerId: 'prac-1',
      patientId: 'pat-2',
      period: '2026-08',
    })
  })

  it('returns null for anything it does not recognise', () => {
    expect(parseExternalReference(null)).toBeNull()
    expect(parseExternalReference('')).toBeNull()
    expect(parseExternalReference('solo-un-id')).toBeNull()
    expect(parseExternalReference('a:b')).toBeNull()
  })
})
