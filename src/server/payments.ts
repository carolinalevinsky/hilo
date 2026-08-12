import { z } from 'zod'

import type { Database } from '@/lib/database.types'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * The money ledger.
 *
 * Events, not counters. v1 kept one record per patient per month and overwrote
 * it, so "she paid twice in March" was a number that had replaced another
 * number. Here every payment is a row and every total is computed — which means
 * the total is always the sum of payments that actually exist.
 *
 * Mercado Pago lives in `mercadopago.ts`, apart from this file, because that one
 * needs the service-role client and this one must not.
 */

export type Payment = Database['public']['Tables']['payments']['Row']

export type PaymentWithPatient = Payment & {
  patients: { id: string; full_name: string; color: string | null } | null
}

export const PAYMENT_METHODS = ['cash', 'transfer', 'mercadopago'] as const

export const PaymentInput = z.object({
  patientId: z.uuid('Elegí un paciente.'),
  paidOn: z.iso.date('Revisá la fecha.'),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Revisá el mes.'),
  amount: z.coerce.number().positive('El monto tiene que ser mayor a cero.'),
  method: z.enum(PAYMENT_METHODS).default('cash'),
  note: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
})

export async function recordPayment(practitionerId: string, input: unknown) {
  const data = PaymentInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('payments')
    .insert({
      practitioner_id: practitionerId,
      patient_id: data.patientId,
      paid_on: data.paidOn,
      period: data.period,
      amount: data.amount,
      method: data.method,
      note: data.note,
      status: 'confirmed',
    })
    .select()
    .single()

  if (error) throw error
  await logAction(practitionerId, 'create', 'payment', row.id)
  return row
}

export async function deletePayment(practitionerId: string, paymentId: string) {
  const db = await getDb()

  const { error } = await db
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'delete', 'payment', paymentId)
}

export async function listPayments(
  practitionerId: string,
  period: string,
): Promise<PaymentWithPatient[]> {
  const db = await getDb()

  const { data, error } = await db
    .from('payments')
    .select('*, patients(id, full_name, color)')
    .eq('practitioner_id', practitionerId)
    .eq('period', period)
    .order('paid_on', { ascending: false })

  if (error) throw error
  return data
}

// ─── The monthly ledger ─────────────────────────────────────────────────────

export type LedgerRow = {
  patientId: string
  fullName: string
  color: string | null
  /** What this patient is expected to pay for the month, if it can be worked out. */
  expected: number | null
  paid: number
  /** Negative means they have paid ahead. */
  outstanding: number | null
  payments: PaymentWithPatient[]
}

export type Ledger = {
  period: string
  rows: LedgerRow[]
  totalPaid: number
  totalExpected: number
  totalOutstanding: number
}

/**
 * What each active patient owes and has paid for one month.
 *
 * Expected is derived from the patient's fee and how they are billed. It is
 * `null` when there is no fee on the record, and the interface says "sin
 * honorario" rather than showing a zero — a patient with no fee set is a blank
 * to fill in, not a patient who owes nothing.
 */
export async function monthlyLedger(
  practitionerId: string,
  period: string,
): Promise<Ledger> {
  const db = await getDb()

  const [{ data: patients, error: patientsError }, payments] = await Promise.all([
    db
      .from('patients')
      .select('id, full_name, color, session_fee, billing_frequency, expected_sessions_per_month')
      .eq('practitioner_id', practitionerId)
      .is('deleted_at', null)
      .is('archived_at', null)
      .order('full_name'),
    listPayments(practitionerId, period),
  ])

  if (patientsError) throw patientsError

  const byPatient = new Map<string, PaymentWithPatient[]>()
  for (const payment of payments) {
    const list = byPatient.get(payment.patient_id)
    if (list) list.push(payment)
    else byPatient.set(payment.patient_id, [payment])
  }

  const rows: LedgerRow[] = (patients ?? []).map((patient) => {
    const own = byPatient.get(patient.id) ?? []
    const paid = own.reduce((sum, payment) => sum + Number(payment.amount), 0)
    const expected = expectedForMonth(patient)

    return {
      patientId: patient.id,
      fullName: patient.full_name,
      color: patient.color,
      expected,
      paid,
      outstanding: expected === null ? null : expected - paid,
      payments: own,
    }
  })

  return {
    period,
    rows,
    totalPaid: rows.reduce((sum, row) => sum + row.paid, 0),
    totalExpected: rows.reduce((sum, row) => sum + (row.expected ?? 0), 0),
    totalOutstanding: rows.reduce((sum, row) => sum + Math.max(row.outstanding ?? 0, 0), 0),
  }
}

/**
 * What a patient is expected to pay in a month, from their fee and how they are
 * billed.
 *
 * The multipliers are v1's (`legacy/index.html:2355`): four sessions or four
 * weeks in a month, two fortnights. They are approximations and they are the
 * right kind — a practitioner setting a fee "per session" wants a sensible
 * default to compare against, not an exact count of the Mondays in February. The
 * expected number of sessions on the patient's record overrides it when set.
 */
function expectedForMonth(patient: {
  session_fee: number | null
  billing_frequency: string
  expected_sessions_per_month: number | null
}): number | null {
  const fee = patient.session_fee === null ? null : Number(patient.session_fee)
  if (fee === null || fee <= 0) return null

  if (patient.billing_frequency === 'monthly') return fee

  const perMonth =
    patient.expected_sessions_per_month ??
    (patient.billing_frequency === 'biweekly' ? 2 : 4)

  return fee * perMonth
}
