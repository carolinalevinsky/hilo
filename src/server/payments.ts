import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { today, zonedParts } from '@/lib/dates'
import { shiftPeriod } from '@/lib/periods'

import { logAction } from './audit'
import { getDb } from './db'
import { everyRow } from './every-row'

/**
 * The money ledger.
 *
 * Events, not counters. v1 kept one record per patient per month and overwrote
 * it, so "she paid twice in March" was a number that had replaced another
 * number. Here every payment is a row and every total is computed — which means
 * the total is always the sum of payments that actually exist.
 *
 * `mercadopago` as a method is a payment the family made through Mercado Pago
 * and the practitioner wrote down by hand. The integration that created these
 * rows by itself was removed on 2026-09-29.
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

export async function listPayments(
  practitionerId: string,
  period: string,
): Promise<PaymentWithPatient[]> {
  const db = await getDb()

  return everyRow((from, to) =>
    db
      .from('payments')
      .select('*, patients(id, full_name, color)')
      .eq('practitioner_id', practitionerId)
      .eq('period', period)
      .order('paid_on', { ascending: false })
      .order('id')
      .range(from, to),
  )
}

// ─── The monthly ledger ─────────────────────────────────────────────────────

export type LedgerRow = {
  patientId: string
  fullName: string
  color: string | null
  /** Terminó el tratamiento. La fila se muestra igual, dicho con todas las letras. */
  archived: boolean
  /**
   * Se lo borró. Sólo aparece en un mes en el que pagó, y sólo hasta el mes en
   * que se lo borró — ver `monthlyLedger`.
   */
  deleted: boolean
  /** What this patient is expected to pay for the whole month, if it can be worked out. */
  expected: number | null
  /**
   * Lo que corresponde hasta hoy. En un mes cerrado es `expected`; en el mes en
   * curso, sólo lo que ya pasó — ver `dueSoFar`.
   */
  due: number | null
  paid: number
  /** `due - paid`. Negative means they have paid ahead. */
  outstanding: number | null
  payments: PaymentWithPatient[]
  /**
   * The three billing fields as stored, so the `···` on the row can open them
   * without a second query per patient. `expected` above is what they add up
   * to; these are what a practitioner edits.
   */
  billing: {
    sessionFee: number | null
    frequency: string
    expectedSessionsPerMonth: number | null
  }
}

export type Ledger = {
  period: string
  rows: LedgerRow[]
  totalPaid: number
  totalExpected: number
  totalDue: number
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
  on: string = today(),
): Promise<Ledger> {
  const db = await getDb()

  const [patients, payments, held] = await Promise.all([
    // Los borrados también, a propósito — ver la regla más abajo. Con ellos
    // adentro la lista crece sin parar, así que se pide entera por páginas.
    everyRow((from, to) =>
      db
        .from('patients')
        .select(
          'id, full_name, color, session_fee, billing_frequency, expected_sessions_per_month, archived_at, deleted_at',
        )
        .eq('practitioner_id', practitionerId)
        .order('full_name')
        .order('id')
        .range(from, to),
    ),
    listPayments(practitionerId, period),
    sessionsHeldIn(practitionerId, period, on),
  ])

  const byPatient = new Map<string, PaymentWithPatient[]>()
  for (const payment of payments) {
    const list = byPatient.get(payment.patient_id)
    if (list) list.push(payment)
    else byPatient.set(payment.patient_id, [payment])
  }

  // Los archivados entran, pero sólo si ese mes tuvieron movimiento.
  //
  // Antes se los filtraba en la consulta, así que su plata quedaba en la tabla
  // sin sumar a nada: registrabas un cobro, archivabas al paciente, y el total
  // de agosto bajaba solo. Un libro contable no puede cambiar porque en octubre
  // archivaste a alguien.
  //
  // Sin el `filter` estarían todos siempre, y la pantalla se llenaría de gente
  // que terminó el tratamiento hace un año y no debe ni pagó nada.
  //
  // Los borrados, con la regla que decidió Carolina (2026-09-11): "si pagó,
  // aparece; si no, no. Si se lo borra, no está más en los meses próximos, pero
  // en los anteriores y en el actual sí." Antes se los filtraba en la consulta y
  // pasaba lo mismo que con los archivados: su plata desaparecía del total del
  // mes en que la cobraste. El mes del borrado se toma en hora de Uruguay — un
  // borrado a las 22:00 del 31 de agosto es de agosto, no de septiembre.
  const includes = (patient: NonNullable<typeof patients>[number]) => {
    const moved = (byPatient.get(patient.id)?.length ?? 0) > 0
    if (patient.deleted_at) {
      const deletedIn = zonedParts(new Date(patient.deleted_at)).date.slice(0, 7)
      return moved && period <= deletedIn
    }
    return !patient.archived_at || moved
  }

  const rows: LedgerRow[] = patients
    .filter(includes)
    .map((patient) => {
      const own = byPatient.get(patient.id) ?? []
      const paid = own.reduce((sum, payment) => sum + Number(payment.amount), 0)
      // De alguien archivado o borrado no se espera nada más, así que no
      // engrosa lo pendiente. Lo que pagó sí cuenta: eso ya entró.
      const expected = patient.archived_at || patient.deleted_at ? null : expectedForMonth(patient)
      const due = dueSoFar(patient, expected, period, on, held.get(patient.id) ?? null)

      return {
        patientId: patient.id,
        fullName: patient.full_name,
        color: patient.color,
        archived: Boolean(patient.archived_at),
        deleted: Boolean(patient.deleted_at),
        expected,
        due,
        paid,
        outstanding: due === null ? null : due - paid,
        payments: own,
        billing: {
          sessionFee: patient.session_fee === null ? null : Number(patient.session_fee),
          frequency: patient.billing_frequency,
          expectedSessionsPerMonth: patient.expected_sessions_per_month,
        },
      }
    })

  return {
    period,
    rows,
    totalPaid: rows.reduce((sum, row) => sum + row.paid, 0),
    totalExpected: rows.reduce((sum, row) => sum + (row.expected ?? 0), 0),
    totalDue: rows.reduce((sum, row) => sum + (row.due ?? 0), 0),
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
 *
 * Exported because the digest computes the same figure for every practitioner at
 * once and must not answer a different number than the Cobros screen does.
 */
export function expectedForMonth(patient: {
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

/**
 * Lo que un paciente debe del mes **hasta hoy**, no del mes entero.
 *
 * Antes el día 1 cada paciente con honorario aparecía debiendo su mes completo:
 * "Debe $ 8.000" a la mañana del primer día, un "Pendiente" que sumaba la plata
 * de sesiones que no habían pasado, y el mismo número en el resumen del 15.
 *
 * - **Un mes que ya cerró** debe lo esperado, como siempre.
 * - **Por mes**: el mes entero desde el principio. Es un honorario acordado
 *   por el mes; no hay una parte que todavía no haya pasado.
 * - **Por sesión, semana o quincena**: el honorario por cada sesión de la
 *   agenda que ya pasó este mes (hecha o todavía sin marcar; no las canceladas
 *   ni las faltas), con el tope de lo esperado para el mes.
 * - Si ese paciente no tiene nada en la agenda este mes —hay quien lleva los
 *   pagos sin usar la agenda—, por los días que van: con cuatro por mes, el
 *   día 1 no debe nada, el día 8 debe una y el último día las cuatro.
 *
 * `held` es la cuenta de la agenda: `null` cuando no tiene nada agendado en el
 * mes.
 */
export function dueSoFar(
  patient: {
    session_fee: number | null
    billing_frequency: string
    expected_sessions_per_month: number | null
  },
  expected: number | null,
  period: string,
  on: string,
  held: number | null,
): number | null {
  if (expected === null) return null
  if (period < on.slice(0, 7)) return expected
  if (period > on.slice(0, 7)) return 0
  if (patient.billing_frequency === 'monthly') return expected

  const fee = Number(patient.session_fee)
  const perMonth = Math.round(expected / fee)

  const [year, month, day] = on.split('-').map(Number)
  const daysInMonth = new Date(year!, month!, 0).getDate()
  // Las que ya terminaron: el día 1 todavía ninguna, el último día todas.
  const units = held ?? Math.floor((perMonth * day!) / daysInMonth)

  return fee * Math.min(units, perMonth)
}

/**
 * Por paciente, cuántas sesiones de la agenda del mes ya pasaron (hasta `on`
 * inclusive) sin cancelarse ni faltar. Sólo aparecen los que tienen algo
 * agendado en el mes, pasado o futuro: el que no está usa la cuenta por días.
 */
async function sessionsHeldIn(
  practitionerId: string,
  period: string,
  on: string,
): Promise<Map<string, number>> {
  // Un mes cerrado debe lo esperado y no mira la agenda.
  if (period !== on.slice(0, 7)) return new Map()

  const db = await getDb()
  const rows = await everyRow((from, to) =>
    db
      .from('appointments')
      .select('patient_id, scheduled_on, status')
      .eq('practitioner_id', practitionerId)
      .gte('scheduled_on', `${period}-01`)
      .lt('scheduled_on', `${shiftPeriod(period, 1)}-01`)
      .order('id')
      .range(from, to),
  )

  return countHeld(rows, on)
}

/** La cuenta de `sessionsHeldIn`, aparte para que el digest haga la misma. */
export function countHeld(
  rows: { patient_id: string; scheduled_on: string; status: string }[],
  on: string,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const past = row.scheduled_on <= on && (row.status === 'attended' || row.status === 'scheduled')
    counts.set(row.patient_id, (counts.get(row.patient_id) ?? 0) + (past ? 1 : 0))
  }
  return counts
}
