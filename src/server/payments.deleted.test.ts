import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { currentPeriod, shiftPeriod } from '@/lib/periods'
import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Los cobros de un paciente borrado (decisión de Carolina, 2026-09-11).
 *
 * "Si pagó, aparece; si no, no. Si se lo borra, no está más en los meses
 * próximos, pero en los anteriores y en el actual sí."
 *
 * Contra Postgres de verdad y por las funciones reales, como
 * `patients.archive.test.ts`: lo que se prueba es qué filas entran al libro
 * según `deleted_at`, y eso es una consulta, no una cuenta.
 *
 * Necesita el stack local levantado (`npm run db:start`).
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

vi.mock('./google-calendar', () => ({
  pushAppointment: async () => {},
  removeAppointment: async () => {},
}))

const { monthlyLedger } = await import('./payments')
const { softDeletePatient } = await import('./patients')

const service = serviceClient()
const email = testEmail('cobros-borrado')

let me = ''
const thisMonth = currentPeriod()
const lastMonth = shiftPeriod(thisMonth, -1)
const nextMonth = shiftPeriod(thisMonth, 1)

/** A patient billed 1000 a month, so the ledger expects something from them. */
async function patientWithFee(fullName: string) {
  const { data, error } = await service
    .from('patients')
    .insert({
      practitioner_id: me,
      full_name: fullName,
      session_fee: 1000,
      billing_frequency: 'monthly',
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function pay(patientId: string, period: string, amount: number) {
  const { error } = await service.from('payments').insert({
    practitioner_id: me,
    patient_id: patientId,
    period,
    amount,
  })
  if (error) throw error
}

const rowOf = (ledger: Awaited<ReturnType<typeof monthlyLedger>>, patientId: string) =>
  ledger.rows.find((row) => row.patientId === patientId)

beforeAll(async () => {
  me = await createTestPractitioner(email, 'Cobradora Borrados Prueba')
  holder.db = await signedInAs(email)
  holder.service = service
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(me)
})

describe('un paciente borrado en Cobros', () => {
  it('lo que pagó este mes sigue sumando, marcado como borrado y sin pendiente', async () => {
    const tomas = await patientWithFee('Tomás Prueba')
    await pay(tomas, thisMonth, 600)
    const before = await monthlyLedger(me, thisMonth)

    await softDeletePatient(me, tomas)
    const after = await monthlyLedger(me, thisMonth)

    // El total cobrado no se mueve: esa plata entró.
    expect(after.totalPaid).toBe(before.totalPaid)
    const row = rowOf(after, tomas)
    expect(row).toMatchObject({ deleted: true, paid: 600, expected: null, outstanding: null })
    // Y deja de esperarse lo que faltaba.
    expect(after.totalExpected).toBe(before.totalExpected - 1000)
  })

  it('si no pagó, no aparece ni suma a lo esperado', async () => {
    const ana = await patientWithFee('Ana Prueba')
    const before = await monthlyLedger(me, thisMonth)
    expect(rowOf(before, ana)?.expected).toBe(1000)

    await softDeletePatient(me, ana)
    const after = await monthlyLedger(me, thisMonth)

    expect(rowOf(after, ana)).toBeUndefined()
    expect(after.totalExpected).toBe(before.totalExpected - 1000)
  })

  it('en los meses anteriores sigue apareciendo con lo que pagó', async () => {
    const martina = await patientWithFee('Martina Prueba')
    await pay(martina, lastMonth, 1000)

    await softDeletePatient(me, martina)

    expect(rowOf(await monthlyLedger(me, lastMonth), martina)).toMatchObject({
      deleted: true,
      paid: 1000,
    })
  })

  it('en los meses siguientes ya no está, aunque hubiera pagado por adelantado', async () => {
    const lucas = await patientWithFee('Lucas Prueba')
    await pay(lucas, nextMonth, 1000)

    await softDeletePatient(me, lucas)

    expect(rowOf(await monthlyLedger(me, nextMonth), lucas)).toBeUndefined()
  })
})
