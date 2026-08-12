import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  testEmail,
} from '@/test/supabase'

/**
 * The progress time series.
 *
 * It is kept by a database trigger rather than by `src/server/goals.ts`, because
 * the chart has to equal the goal's history whichever code path moved the
 * number — and a chart that quietly disagrees with the record is worse than no
 * chart, since a practitioner shows it to a family.
 *
 * These tests are what make that claim checkable.
 */

const service = serviceClient()
const email = testEmail('progress')

let practitionerId = ''
let patientId = ''

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Prog Prueba')

  const { data } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Paciente' })
    .select()
    .single()
  patientId = data!.id
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

async function newGoal(title: string, progress = 0) {
  const { data, error } = await service
    .from('goals')
    .insert({ practitioner_id: practitionerId, patient_id: patientId, title, progress })
    .select()
    .single()
  if (error) throw error
  return data
}

async function pointsFor(goalId: string) {
  const { data } = await service
    .from('goal_progress')
    .select('value, recorded_on')
    .eq('goal_id', goalId)
    .order('recorded_on')
  return data ?? []
}

describe('goal progress', () => {
  it('records the starting point when a goal is created', async () => {
    const goal = await newGoal('Empieza en 20', 20)
    expect(await pointsFor(goal.id)).toEqual([
      { value: 20, recorded_on: expect.any(String) },
    ])
  })

  it('moves the same day’s point rather than adding a second one', async () => {
    // A practitioner nudging a slider three times in one afternoon should leave
    // one point at the final value, not a chart made of noise.
    const goal = await newGoal('Se ajusta varias veces', 10)

    for (const value of [25, 40, 35]) {
      await service.from('goals').update({ progress: value }).eq('id', goal.id)
    }

    const points = await pointsFor(goal.id)
    expect(points).toHaveLength(1)
    expect(points[0]?.value).toBe(35)
  })

  it('does not record a point when something else on the goal changes', async () => {
    const goal = await newGoal('Cambia de nombre', 50)
    await service.from('goals').update({ title: 'Nombre nuevo' }).eq('id', goal.id)

    const points = await pointsFor(goal.id)
    expect(points).toHaveLength(1)
    expect(points[0]?.value).toBe(50)
  })

  it('keeps one point per day, so a real curve accumulates', async () => {
    const goal = await newGoal('Avanza en el tiempo', 20)

    // Backdate the trigger's point, then move the goal again: two days, two
    // points. This is what the chart's x-axis is made of.
    await service
      .from('goal_progress')
      .update({ recorded_on: '2026-01-05' })
      .eq('goal_id', goal.id)

    await service.from('goals').update({ progress: 45 }).eq('id', goal.id)

    const points = await pointsFor(goal.id)
    expect(points.map((point) => point.value)).toEqual([20, 45])
  })

  it('refuses a value outside 0–100', async () => {
    const goal = await newGoal('Fuera de rango', 50)
    const { error } = await service
      .from('goals')
      .update({ progress: 140 })
      .eq('id', goal.id)

    expect(error).not.toBeNull()
  })
})
