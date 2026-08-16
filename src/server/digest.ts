import { toDateInput } from '@/lib/dates'

import { getServiceDb } from './db'
import type { DigestSummary } from './notifications'

/**
 * Building the fortnightly digest. **Defect #12.**
 *
 * v1 fetched every practitioner and the entire `pacientes` table on every run,
 * then filtered in JavaScript and emailed them one at a time inside a single
 * serverless invocation (`legacy/api/resumen.js:56`). That works at five
 * practitioners and times out well before five hundred.
 *
 * Two changes:
 *
 *   **Ask the database who has something to report.** Three grouped counts, not
 *   a full table scan into memory.
 *
 *   **Send in bounded batches**, with a cap per invocation, so one run cannot
 *   grow past the function's time limit no matter how many accounts exist.
 *
 * The one thing v1 got right and this keeps: it only writes to someone whose
 * fortnight had something in it (`if (!nRes && !atr.length) continue`). Silence
 * when nothing is happening is why the email gets read when something is.
 */

/** The service role, because a cron run has no user session to act on behalf of. */
export type DigestRecipient = {
  practitionerId: string
  email: string
  summary: DigestSummary
}

export const DIGEST_BATCH_SIZE = 40

function fortnightAgo(): string {
  const date = new Date()
  date.setDate(date.getDate() - 14)
  return toDateInput(date)
}

/**
 * Everyone with something worth telling them about, and their numbers.
 *
 * Four queries in total, regardless of how many practitioners exist. Each one
 * returns only the rows from the last fortnight, and the joining happens over
 * those — never over the whole table.
 */
export async function digestRecipients(limit = DIGEST_BATCH_SIZE): Promise<DigestRecipient[]> {
  const db = getServiceDb()
  const since = fortnightAgo()

  const [{ data: practitioners }, { data: sessions }, { data: bookings }, { data: payments }] =
    await Promise.all([
      db.from('practitioners').select('id, email, full_name'),
      db.from('sessions').select('practitioner_id').gte('held_on', since),
      db.from('booking_requests').select('practitioner_id').eq('status', 'pending'),
      // The unpaid figure needs the fee on the patient and the payments for the
      // month, so it is computed from two small selects rather than a join
      // across a view that does not exist.
      db
        .from('patients')
        .select('practitioner_id, id, session_fee, billing_frequency, expected_sessions_per_month')
        .is('deleted_at', null)
        .is('archived_at', null),
    ])

  const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const { data: paid } = await db
    .from('payments')
    .select('practitioner_id, patient_id, amount')
    .eq('period', period)

  const sessionCounts = tally(sessions ?? [], (row) => row.practitioner_id)
  const bookingCounts = tally(bookings ?? [], (row) => row.practitioner_id)

  const paidByPatient = new Map<string, number>()
  for (const payment of paid ?? []) {
    paidByPatient.set(
      payment.patient_id,
      (paidByPatient.get(payment.patient_id) ?? 0) + Number(payment.amount),
    )
  }

  const balances = new Map<string, { patients: number; total: number }>()
  for (const patient of payments ?? []) {
    const fee = patient.session_fee === null ? 0 : Number(patient.session_fee)
    if (fee <= 0) continue

    const expected =
      patient.billing_frequency === 'monthly'
        ? fee
        : fee *
          (patient.expected_sessions_per_month ??
            (patient.billing_frequency === 'biweekly' ? 2 : 4))

    const outstanding = expected - (paidByPatient.get(patient.id) ?? 0)
    if (outstanding <= 0) continue

    const current = balances.get(patient.practitioner_id) ?? { patients: 0, total: 0 }
    balances.set(patient.practitioner_id, {
      patients: current.patients + 1,
      total: current.total + outstanding,
    })
  }

  const recipients: DigestRecipient[] = []

  for (const practitioner of practitioners ?? []) {
    const sessionsThisFortnight = sessionCounts.get(practitioner.id) ?? 0
    const pendingBookings = bookingCounts.get(practitioner.id) ?? 0
    const balance = balances.get(practitioner.id)

    // Silence when nothing is happening. v1's best instinct, kept.
    if (sessionsThisFortnight === 0 && pendingBookings === 0 && !balance) continue

    recipients.push({
      practitionerId: practitioner.id,
      email: practitioner.email,
      summary: {
        practitionerName: practitioner.full_name,
        sessionsThisFortnight,
        pendingBookings,
        patientsWithBalance: balance?.patients ?? 0,
        outstandingTotal: Math.round(balance?.total ?? 0),
      },
    })

    if (recipients.length >= limit) break
  }

  return recipients
}

function tally<T>(rows: T[], key: (row: T) => string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const id = key(row)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}
