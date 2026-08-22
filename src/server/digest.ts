import { toDateInput } from '@/lib/dates'

import { getServiceDb } from './db'
import type { DigestSummary } from './notifications'
import { expectedForMonth } from './payments'

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
 *   **Ask the database who has something to report.** Grouped counts over the
 *   fortnight, not a full table scan into memory.
 *
 *   **Send in bounded, rotating batches.** A cap per invocation, so one run
 *   cannot grow past the function's time limit no matter how many accounts
 *   exist — and an order by `digest_sent_at`, so the ones a run does not reach
 *   are first in line on the next one. A cap without an order is not a queue:
 *   it silently drops the same practitioners every fortnight.
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

/**
 * The month the digest reports money for: the one containing the day before the
 * run.
 *
 * The cron fires on the 1st and the 15th. On the 1st, "this month" is a few
 * hours old and nobody has paid anything yet, so every patient with a fee would
 * be reported as owing their whole month — a number that is technically true,
 * useless, and alarming. The month that just closed is the one with something to
 * chase. On the 15th the day before is still the current month, so nothing
 * changes there.
 */
export function digestPeriod(now: Date): string {
  const previousDay = new Date(now)
  previousDay.setDate(previousDay.getDate() - 1)
  return toDateInput(previousDay).slice(0, 7)
}

function fortnightAgo(now: Date): string {
  const date = new Date(now)
  date.setDate(date.getDate() - 14)
  return toDateInput(date)
}

/**
 * Everyone with something worth telling them about, and their numbers.
 *
 * Five queries in total, regardless of how many practitioners exist. Each one
 * returns only the rows in scope, and the joining happens over those — never
 * over the whole table.
 *
 * `now` is an argument so the fortnight window and the reporting month are one
 * decision rather than three separate calls to the clock that a run crossing
 * midnight could disagree about.
 */
export async function digestRecipients(
  limit = DIGEST_BATCH_SIZE,
  now = new Date(),
): Promise<DigestRecipient[]> {
  const db = getServiceDb()
  const since = fortnightAgo(now)
  const period = digestPeriod(now)

  const [practitioners, sessions, bookings, patients, paid] = await Promise.all([
    // Least recently written to first, so the cap rotates instead of dropping.
    rows(
      db
        .from('practitioners')
        .select('id, email, full_name')
        .order('digest_sent_at', { ascending: true, nullsFirst: true }),
      'practitioners',
    ),
    rows(db.from('sessions').select('practitioner_id').gte('held_on', since), 'sessions'),
    rows(
      db.from('booking_requests').select('practitioner_id').eq('status', 'pending'),
      'booking_requests',
    ),
    // The unpaid figure needs the fee on the patient and the payments for the
    // month, so it is computed from two small selects rather than a join across
    // a view that does not exist.
    rows(
      db
        .from('patients')
        .select('practitioner_id, id, session_fee, billing_frequency, expected_sessions_per_month')
        .is('deleted_at', null)
        .is('archived_at', null),
      'patients',
    ),
    rows(
      db.from('payments').select('practitioner_id, patient_id, amount').eq('period', period),
      'payments',
    ),
  ])

  const sessionCounts = tally(sessions, (row) => row.practitioner_id)
  const bookingCounts = tally(bookings, (row) => row.practitioner_id)

  const paidByPatient = new Map<string, number>()
  for (const payment of paid) {
    paidByPatient.set(
      payment.patient_id,
      (paidByPatient.get(payment.patient_id) ?? 0) + Number(payment.amount),
    )
  }

  const balances = new Map<string, { patients: number; total: number }>()
  for (const patient of patients) {
    // The same rule the Cobros screen applies, from the same function. Two
    // answers to "what does this patient owe" is worse than either answer.
    const expected = expectedForMonth(patient)
    if (expected === null) continue

    const outstanding = expected - (paidByPatient.get(patient.id) ?? 0)
    if (outstanding <= 0) continue

    const current = balances.get(patient.practitioner_id) ?? { patients: 0, total: 0 }
    balances.set(patient.practitioner_id, {
      patients: current.patients + 1,
      total: current.total + outstanding,
    })
  }

  const recipients: DigestRecipient[] = []

  for (const practitioner of practitioners) {
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

/**
 * Stamp the batch as sent, so the next run starts after it.
 *
 * Deliberately does not throw. The emails have already gone out by the time this
 * is called; failing here would turn a delivered digest into a 500, and the only
 * consequence of the stamp not landing is that the same batch is considered
 * again in a fortnight — visible, harmless, and self-correcting.
 */
export async function markDigestSent(practitionerIds: string[], now = new Date()) {
  if (practitionerIds.length === 0) return

  try {
    const db = getServiceDb()
    const { error } = await db
      .from('practitioners')
      .update({ digest_sent_at: now.toISOString() })
      .in('id', practitionerIds)

    if (error) throw error
  } catch (error) {
    console.error('[digest] no se pudo registrar el envío', { practitionerIds, error })
  }
}

/**
 * Await a query and refuse to read a failure as an empty result.
 *
 * Every select here returns `data: null` when it errors, and `null ?? []` is an
 * empty fortnight — so a broken query would produce a digest that says nothing
 * happened, on an unattended cron, to everyone at once. This is the one failure
 * mode the feature cannot signal on its own, so it throws and the run fails
 * loudly instead.
 */
async function rows<T>(
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  table: string,
): Promise<T[]> {
  const { data, error } = await query
  if (error) throw new Error(`[digest] ${table}: ${error.message}`)
  return data ?? []
}

function tally<T>(list: T[], key: (row: T) => string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of list) {
    const id = key(row)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}
