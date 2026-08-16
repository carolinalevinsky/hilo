import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toDateInput } from '@/lib/dates'

/**
 * The fortnightly digest. **Defect #12.**
 *
 * This is the only piece of the product nobody watches run. It fires from a cron
 * twice a month, with the service role, across every practitioner at once — so
 * the two properties that keep it safe are exactly the two nobody would notice
 * had broken:
 *
 *   **It stays quiet.** A practitioner with an empty fortnight must not be
 *   written to. Get that wrong and the digest becomes a twice-monthly "0 · 0 · 0"
 *   that everyone filters away, which costs nothing today and costs the whole
 *   feature the day there is something urgent in it.
 *
 *   **It stays bounded.** v1 loaded every practitioner and the entire patients
 *   table into memory and emailed them one at a time inside one invocation. That
 *   run gets slower with every signup and fails by timing out — silently, at
 *   03:00, for everyone at once. The cap is the fix, and a cap that is never
 *   asserted is a number in a constant.
 *
 * The third block pins the arithmetic. `digestRecipients` recomputes what a
 * patient owes for the month instead of calling `monthlyLedger` — it has no user
 * session and needs every practitioner in one query — so the same rule is now
 * written in two files and can drift. If `expectedForMonth` in `payments.ts`
 * changes, these cases are what say so.
 *
 * The database is mocked rather than real. `digestRecipients` queries globally,
 * without a `practitioner_id` filter, so against the shared local Postgres every
 * assertion here would depend on the seed data and on whatever another test
 * happened to insert first.
 */

type Cell = string | number | null

type PractitionerRow = {
  id: string
  email: string
  full_name: string
  digest_sent_at: string | null
}
type SessionRow = { practitioner_id: string; held_on: string }
type BookingRow = { practitioner_id: string; status: string }
type PatientRow = {
  practitioner_id: string
  id: string
  session_fee: number | null
  billing_frequency: string
  expected_sessions_per_month: number | null
  deleted_at: string | null
  archived_at: string | null
}
type PaymentRow = {
  practitioner_id: string
  patient_id: string
  amount: number
  period: string
}

type Tables = {
  practitioners: PractitionerRow[]
  sessions: SessionRow[]
  booking_requests: BookingRow[]
  patients: PatientRow[]
  payments: PaymentRow[]
}

const tables: Tables = {
  practitioners: [],
  sessions: [],
  booking_requests: [],
  patients: [],
  payments: [],
}

/**
 * Only the four links `digest.ts` actually reaches for. The column list handed to
 * `select` is ignored — each table serves whole fixture rows — but the filters
 * are real, because two of them (the fortnight window and the month of the
 * payments) are behaviour under test rather than plumbing.
 */
type FakeQuery = {
  select: () => FakeQuery
  eq: (column: string, value: Cell) => FakeQuery
  gte: (column: string, value: string) => FakeQuery
  is: (column: string, value: null) => FakeQuery
  order: (column: string, options: { ascending: boolean; nullsFirst: boolean }) => FakeQuery
  then: <T>(
    onfulfilled: (value: {
      data: Record<string, Cell>[]
      error: null
    }) => T | PromiseLike<T>,
  ) => PromiseLike<T>
}

function query(rows: Record<string, Cell>[]): FakeQuery {
  return {
    select: () => query(rows),
    eq: (column, value) => query(rows.filter((row) => row[column] === value)),
    gte: (column, value) => query(rows.filter((row) => String(row[column]) >= value)),
    is: (column, value) => query(rows.filter((row) => row[column] === value)),
    // Implemented rather than ignored: the rotation of the batch is behaviour
    // under test, and a passthrough would let a dropped `order` still pass.
    order: (column, { ascending, nullsFirst }) =>
      query(
        [...rows].sort((a, b) => {
          const left = a[column]
          const right = b[column]
          if (left === right) return 0
          if (left === null) return nullsFirst ? -1 : 1
          if (right === null) return nullsFirst ? 1 : -1
          const order = String(left) < String(right) ? -1 : 1
          return ascending ? order : -order
        }),
      ),
    then: (onfulfilled) => Promise.resolve({ data: rows, error: null }).then(onfulfilled),
  }
}

vi.mock('./db', () => ({
  getServiceDb: () => ({
    from: (table: keyof Tables) => query(tables[table]),
  }),
}))

const { DIGEST_BATCH_SIZE, digestPeriod, digestRecipients } = await import('./digest')

/** Relative to today, so the fortnight window keeps meaning the same thing. */
function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toDateInput(date)
}

/**
 * The month the digest reports on, from the rule itself rather than from a
 * second copy of it — on the 1st of a month those two are different answers,
 * which is the whole reason `digestPeriod` exists.
 */
const thisPeriod = digestPeriod(new Date())

function practitioner(id: string, fullName: string, digestSentAt: string | null = null) {
  return { id, email: `${id}@hilo.test`, full_name: fullName, digest_sent_at: digestSentAt }
}

function patient(
  fields: Partial<PatientRow> & Pick<PatientRow, 'id' | 'practitioner_id'>,
): PatientRow {
  return {
    session_fee: 1000,
    billing_frequency: 'weekly',
    expected_sessions_per_month: null,
    deleted_at: null,
    archived_at: null,
    ...fields,
  }
}

const LUCIA = practitioner('lucia', 'Lucía Fernández')
const MARTIN = practitioner('martin', 'Martín Sosa')

beforeEach(() => {
  tables.practitioners = []
  tables.sessions = []
  tables.booking_requests = []
  tables.patients = []
  tables.payments = []
})

describe('digestRecipients', () => {
  it('skips a practitioner whose fortnight was empty', async () => {
    tables.practitioners = [LUCIA, MARTIN]
    tables.sessions = [{ practitioner_id: LUCIA.id, held_on: daysAgo(3) }]

    const recipients = await digestRecipients()

    expect(recipients.map((recipient) => recipient.practitionerId)).toEqual([LUCIA.id])
  })

  it('does not count a session held before the fortnight began', async () => {
    tables.practitioners = [LUCIA]
    tables.sessions = [{ practitioner_id: LUCIA.id, held_on: daysAgo(20) }]

    expect(await digestRecipients()).toEqual([])
  })

  it('counts a session held on the first day of the fortnight', async () => {
    // The window is inclusive at its far edge, so a session exactly fourteen days
    // back belongs to this digest and not to the previous one.
    tables.practitioners = [LUCIA]
    tables.sessions = [{ practitioner_id: LUCIA.id, held_on: daysAgo(14) }]

    const [recipient] = await digestRecipients()

    expect(recipient?.summary.sessionsThisFortnight).toBe(1)
  })

  it('writes to a practitioner whose only news is a booking waiting to be answered', async () => {
    tables.practitioners = [LUCIA]
    tables.booking_requests = [
      { practitioner_id: LUCIA.id, status: 'pending' },
      { practitioner_id: LUCIA.id, status: 'confirmed' },
    ]

    const [recipient] = await digestRecipients()

    expect(recipient?.summary.pendingBookings).toBe(1)
    expect(recipient?.summary.sessionsThisFortnight).toBe(0)
  })

  it('writes to a practitioner whose only news is a patient who owes money', async () => {
    tables.practitioners = [LUCIA]
    tables.patients = [
      patient({ practitioner_id: LUCIA.id, id: 'pat-1', session_fee: 900, billing_frequency: 'monthly' }),
    ]

    const [recipient] = await digestRecipients()

    expect(recipient?.summary.patientsWithBalance).toBe(1)
    expect(recipient?.summary.outstandingTotal).toBe(900)
  })

  it('reports each practitioner their own numbers and where to read them', async () => {
    tables.practitioners = [LUCIA, MARTIN]
    tables.sessions = [
      { practitioner_id: LUCIA.id, held_on: daysAgo(1) },
      { practitioner_id: LUCIA.id, held_on: daysAgo(6) },
      { practitioner_id: MARTIN.id, held_on: daysAgo(2) },
    ]
    tables.booking_requests = [{ practitioner_id: MARTIN.id, status: 'pending' }]

    const recipients = await digestRecipients()

    expect(recipients).toEqual([
      {
        practitionerId: LUCIA.id,
        email: 'lucia@hilo.test',
        summary: {
          practitionerName: 'Lucía Fernández',
          sessionsThisFortnight: 2,
          pendingBookings: 0,
          patientsWithBalance: 0,
          outstandingTotal: 0,
        },
      },
      {
        practitionerId: MARTIN.id,
        email: 'martin@hilo.test',
        summary: {
          practitionerName: 'Martín Sosa',
          sessionsThisFortnight: 1,
          pendingBookings: 1,
          patientsWithBalance: 0,
          outstandingTotal: 0,
        },
      },
    ])
  })
})

describe('the batch cap', () => {
  function crowd(size: number) {
    const everyone = Array.from({ length: size }, (_, index) =>
      practitioner(`p-${index}`, `Fonoaudióloga ${index}`),
    )
    tables.practitioners = everyone
    tables.sessions = everyone.map((one) => ({ practitioner_id: one.id, held_on: daysAgo(2) }))
  }

  it('never returns more than DIGEST_BATCH_SIZE practitioners in one run', async () => {
    crowd(DIGEST_BATCH_SIZE * 3)

    expect(await digestRecipients()).toHaveLength(DIGEST_BATCH_SIZE)
  })

  it('returns no more than the limit it was given', async () => {
    crowd(10)

    expect(await digestRecipients(3)).toHaveLength(3)
  })

  it('returns everyone when there are fewer of them than the cap', async () => {
    crowd(5)

    expect(await digestRecipients()).toHaveLength(5)
  })
})

/**
 * The half of the cap that is easy to leave out.
 *
 * A cap on its own is not a queue. Without an order, every run takes whatever
 * rows the database hands back first and the practitioners past the cap are
 * never written to — the same ones, every fortnight, with nothing anywhere
 * saying so. These cases are what make the route's promise that "the ones it did
 * not reach go out on the next run" a fact.
 */
describe('the rotation of the batch', () => {
  it('puts the least recently written to at the front', async () => {
    tables.practitioners = [
      practitioner('reciente', 'Recién avisada', '2026-08-15T11:00:00Z'),
      practitioner('vieja', 'Hace un mes', '2026-07-15T11:00:00Z'),
      practitioner('antigua', 'Hace tres meses', '2026-05-15T11:00:00Z'),
    ]
    tables.sessions = tables.practitioners.map((one) => ({
      practitioner_id: one.id,
      held_on: daysAgo(2),
    }))

    const recipients = await digestRecipients()

    expect(recipients.map((one) => one.practitionerId)).toEqual([
      'antigua',
      'vieja',
      'reciente',
    ])
  })

  it('puts someone who has never been written to ahead of everyone', async () => {
    // A practitioner who signed up yesterday has a null stamp. Sorting nulls
    // last would leave every new account behind the whole existing queue.
    tables.practitioners = [
      practitioner('vieja', 'Hace un mes', '2026-07-15T11:00:00Z'),
      practitioner('nueva', 'Recién llegada'),
    ]
    tables.sessions = tables.practitioners.map((one) => ({
      practitioner_id: one.id,
      held_on: daysAgo(1),
    }))

    const recipients = await digestRecipients()

    expect(recipients[0]?.practitionerId).toBe('nueva')
  })

  it('leaves the ones past the cap at the front of the next run', async () => {
    const everyone = [
      practitioner('a', 'Primera', '2026-01-01T11:00:00Z'),
      practitioner('b', 'Segunda', '2026-02-01T11:00:00Z'),
      practitioner('c', 'Tercera', '2026-03-01T11:00:00Z'),
    ]
    tables.practitioners = everyone
    tables.sessions = everyone.map((one) => ({ practitioner_id: one.id, held_on: daysAgo(3) }))

    const first = await digestRecipients(2)
    expect(first.map((one) => one.practitionerId)).toEqual(['a', 'b'])

    // What `markDigestSent` does to the rows the run just reached.
    for (const one of tables.practitioners) {
      if (first.some((recipient) => recipient.practitionerId === one.id)) {
        one.digest_sent_at = '2026-08-16T11:00:00Z'
      }
    }

    const second = await digestRecipients(2)
    expect(second[0]?.practitionerId).toBe('c')
  })
})

/**
 * The cron fires at 11:00 on the 1st and the 15th. On the 1st the current month
 * is eleven hours old and nobody has paid into it, so reporting money for "this
 * month" would tell every practitioner that every patient owes them everything —
 * true, useless, and the kind of number that gets an email filtered away.
 */
describe('digestPeriod', () => {
  it('reports the month that just closed when the run is on the 1st', () => {
    expect(digestPeriod(new Date('2026-08-01T11:00:00Z'))).toBe('2026-07')
    expect(digestPeriod(new Date('2026-01-01T11:00:00Z'))).toBe('2025-12')
  })

  it('reports the current month when the run is mid-month', () => {
    expect(digestPeriod(new Date('2026-08-15T11:00:00Z'))).toBe('2026-08')
  })
})

/**
 * Every case here has a twin in `expectedForMonth` in `src/server/payments.ts`.
 * The multipliers are v1's: one fee a month when billed monthly, two a month when
 * billed by the fortnight, four otherwise.
 */
describe('the outstanding balance', () => {
  async function balance(patients: PatientRow[], paid: PaymentRow[] = []) {
    tables.practitioners = [LUCIA]
    tables.patients = patients
    tables.payments = paid

    const [recipient] = await digestRecipients()
    return recipient?.summary ?? null
  }

  function owed(fields: Partial<PatientRow> = {}): PatientRow[] {
    return [patient({ practitioner_id: LUCIA.id, id: 'pat-1', ...fields })]
  }

  it('expects one fee from a patient billed monthly', async () => {
    expect(
      (await balance(owed({ session_fee: 4200, billing_frequency: 'monthly' })))?.outstandingTotal,
    ).toBe(4200)
  })

  it('expects two fees from a patient billed by the fortnight', async () => {
    expect(
      (await balance(owed({ session_fee: 1250, billing_frequency: 'biweekly' })))?.outstandingTotal,
    ).toBe(2500)
  })

  it('expects four fees from a patient billed by the session', async () => {
    expect(
      (await balance(owed({ session_fee: 1250, billing_frequency: 'weekly' })))?.outstandingTotal,
    ).toBe(5000)
  })

  it('expects four fees from a patient whose billing frequency is not one it knows', async () => {
    // Four is the fallback, not a case for 'weekly' specifically. A frequency
    // added to the database and not to this rule must still produce a number.
    expect(
      (await balance(owed({ session_fee: 1000, billing_frequency: 'fortnightly-ish' })))
        ?.outstandingTotal,
    ).toBe(4000)
  })

  it('prefers the sessions per month written on the record over the default', async () => {
    expect(
      (
        await balance(
          owed({ session_fee: 1000, billing_frequency: 'weekly', expected_sessions_per_month: 6 }),
        )
      )?.outstandingTotal,
    ).toBe(6000)
  })

  it('ignores the sessions per month on a patient billed monthly', async () => {
    // A monthly fee is the whole month by definition; the session count on the
    // record is there for the other frequencies.
    expect(
      (
        await balance(
          owed({ session_fee: 4200, billing_frequency: 'monthly', expected_sessions_per_month: 6 }),
        )
      )?.outstandingTotal,
    ).toBe(4200)
  })

  it('leaves out a patient who has already paid the month in full', async () => {
    const summary = await balance(owed({ session_fee: 1000, billing_frequency: 'monthly' }), [
      { practitioner_id: LUCIA.id, patient_id: 'pat-1', amount: 1000, period: thisPeriod },
    ])

    // Nothing else happened either, so there is nothing to write to her about.
    expect(summary).toBeNull()
  })

  it('leaves out a patient who has paid ahead', async () => {
    const summary = await balance(owed({ session_fee: 1000, billing_frequency: 'monthly' }), [
      { practitioner_id: LUCIA.id, patient_id: 'pat-1', amount: 1800, period: thisPeriod },
    ])

    expect(summary).toBeNull()
  })

  it('counts only what is left after a part payment', async () => {
    const summary = await balance(owed({ session_fee: 1250, billing_frequency: 'biweekly' }), [
      { practitioner_id: LUCIA.id, patient_id: 'pat-1', amount: 800, period: thisPeriod },
    ])

    expect(summary?.outstandingTotal).toBe(1700)
  })

  it('ignores a payment recorded against a different month', async () => {
    const summary = await balance(owed({ session_fee: 1000, billing_frequency: 'monthly' }), [
      { practitioner_id: LUCIA.id, patient_id: 'pat-1', amount: 1000, period: '2019-01' },
    ])

    expect(summary?.outstandingTotal).toBe(1000)
  })

  it('leaves out a patient with no fee on their record', async () => {
    // A blank fee is a blank to fill in, not a patient who owes nothing — the
    // ledger says "sin honorario" and the digest says nothing at all.
    expect(await balance(owed({ session_fee: null }))).toBeNull()
  })

  it('leaves out a patient whose fee is zero', async () => {
    expect(await balance(owed({ session_fee: 0 }))).toBeNull()
  })

  it('leaves out a patient who has been archived or deleted', async () => {
    expect(
      await balance([
        patient({ practitioner_id: LUCIA.id, id: 'pat-1', archived_at: daysAgo(30) }),
        patient({ practitioner_id: LUCIA.id, id: 'pat-2', deleted_at: daysAgo(30) }),
      ]),
    ).toBeNull()
  })

  it('adds up the patients who still owe, and only those', async () => {
    const summary = await balance(
      [
        patient({ practitioner_id: LUCIA.id, id: 'pat-1', session_fee: 1000, billing_frequency: 'monthly' }),
        patient({ practitioner_id: LUCIA.id, id: 'pat-2', session_fee: 1500, billing_frequency: 'biweekly' }),
        patient({ practitioner_id: LUCIA.id, id: 'pat-3', session_fee: 2000, billing_frequency: 'monthly' }),
      ],
      [{ practitioner_id: LUCIA.id, patient_id: 'pat-3', amount: 2000, period: thisPeriod }],
    )

    expect(summary?.patientsWithBalance).toBe(2)
    expect(summary?.outstandingTotal).toBe(4000)
  })

  it('keeps one practitioner’s balances out of another’s digest', async () => {
    tables.practitioners = [LUCIA, MARTIN]
    tables.patients = [
      patient({ practitioner_id: LUCIA.id, id: 'pat-1', session_fee: 1000, billing_frequency: 'monthly' }),
      patient({ practitioner_id: MARTIN.id, id: 'pat-2', session_fee: 3000, billing_frequency: 'monthly' }),
    ]

    const recipients = await digestRecipients()

    expect(recipients.map((recipient) => recipient.summary.outstandingTotal)).toEqual([1000, 3000])
  })
})
