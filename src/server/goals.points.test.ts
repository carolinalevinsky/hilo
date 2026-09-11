import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { today, toDateInput, todayDate } from '@/lib/dates'
import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Borrar un avance cargado por error (P17).
 *
 * Contra Postgres de verdad: la serie la escribe un trigger, y lo que se prueba
 * es justamente que corregirla no lo haga escribir de nuevo.
 *
 * Necesita el stack local levantado (`npm run db:start`).
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const { deleteGoalPoint } = await import('./goals')

const service = serviceClient()
const email = testEmail('borrar-avance')
const otherEmail = testEmail('borrar-avance-ajena')

let me = ''
let other = ''
let patientId = ''

function shift(days: number) {
  const date = todayDate()
  date.setDate(date.getDate() + days)
  return toDateInput(date)
}

/**
 * A goal with a history: `values[0]` fourteen days ago, then one a week later,
 * and so on, the last one today. Built through the trigger — insert, then move
 * each day's point back — so the rows are the ones the app would have made.
 */
async function goalWithHistory(owner: string, patient: string, values: number[]) {
  const { data: goal, error } = await service
    .from('goals')
    .insert({ practitioner_id: owner, patient_id: patient, title: 'Objetivo', progress: values[0] })
    .select()
    .single()
  if (error) throw error

  for (let index = 0; index < values.length; index++) {
    const day = shift(-7 * (values.length - 1 - index))
    if (index > 0) {
      await service.from('goals').update({ progress: values[index] }).eq('id', goal.id)
    }
    if (day !== today()) {
      await service
        .from('goal_progress')
        .update({ recorded_on: day })
        .eq('goal_id', goal.id)
        .eq('recorded_on', today())
    }
  }
  return goal.id
}

async function history(goalId: string) {
  const { data } = await service
    .from('goal_progress')
    .select('id, recorded_on, value')
    .eq('goal_id', goalId)
    .order('recorded_on')
  return data ?? []
}

async function progressOf(goalId: string) {
  const { data } = await service.from('goals').select('progress').eq('id', goalId).single()
  return data?.progress
}

beforeAll(async () => {
  me = await createTestPractitioner(email, 'Correctora Avances Prueba')
  other = await createTestPractitioner(otherEmail, 'Ajena Avances Prueba')
  holder.db = await signedInAs(email)
  holder.service = service

  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: me, full_name: 'Tomás Prueba' })
    .select()
    .single()
  if (error) throw error
  patientId = data.id
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(me)
  await deleteTestPractitioner(other)
})

describe('borrar un avance', () => {
  it('el último, cargado hoy por error, vuelve al anterior sin dejar un punto de hoy', async () => {
    const goal = await goalWithHistory(me, patientId, [20, 35, 60])
    const todays = (await history(goal)).at(-1)!
    expect(todays.recorded_on).toBe(today())

    await deleteGoalPoint(me, todays.id)

    expect(await progressOf(goal)).toBe(35)
    // Sin la marca en el trigger, el `update` del valor escribía acá un punto
    // de hoy con 35: la serie terminaba en [20, 35, 35].
    expect((await history(goal)).map((point) => point.value)).toEqual([20, 35])
  })

  it('uno del medio no cambia dónde está el objetivo hoy', async () => {
    const goal = await goalWithHistory(me, patientId, [20, 35, 60])
    const middle = (await history(goal))[1]!

    await deleteGoalPoint(me, middle.id)

    expect(await progressOf(goal)).toBe(60)
    expect((await history(goal)).map((point) => point.value)).toEqual([20, 60])
  })

  it('el único vuelve el objetivo a cero', async () => {
    const goal = await goalWithHistory(me, patientId, [40])
    const [only] = await history(goal)

    await deleteGoalPoint(me, only!.id)

    expect(await progressOf(goal)).toBe(0)
    expect(await history(goal)).toEqual([])
  })

  it('después de corregir, el avance siguiente se sigue anotando', async () => {
    // La marca vive sólo en la transacción de la corrección.
    const goal = await goalWithHistory(me, patientId, [20, 50])
    const todays = (await history(goal)).at(-1)!
    await deleteGoalPoint(me, todays.id)

    await service.from('goals').update({ progress: 45 }).eq('id', goal)

    expect((await history(goal)).map((point) => [point.recorded_on, point.value])).toEqual([
      [shift(-7), 20],
      [today(), 45],
    ])
  })

  it('no borra el avance de otra profesional', async () => {
    const { data: theirs, error } = await service
      .from('patients')
      .insert({ practitioner_id: other, full_name: 'Ajeno Prueba' })
      .select()
      .single()
    if (error) throw error
    const goal = await goalWithHistory(other, theirs.id, [30, 70])
    const last = (await history(goal)).at(-1)!

    await deleteGoalPoint(me, last.id)
    // Y por la base directo, con la sesión propia, tampoco.
    await (holder.db as ReturnType<typeof serviceClient>).rpc('delete_goal_point', {
      point_id: last.id,
    })

    expect((await history(goal)).map((point) => point.value)).toEqual([30, 70])
    expect(await progressOf(goal)).toBe(70)
  })
})
