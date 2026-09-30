import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { createTestPractitioner, deleteTestPractitioner, serviceClient, testEmail } from '@/test/supabase'

/**
 * Que la cuota no se pase mandando pedidos al mismo tiempo.
 *
 * Contra Postgres de verdad, porque lo que se prueba es el candado de la base:
 * con dos pedidos a la vez sobre la última unidad libre, pasa uno solo.
 */

const holder = vi.hoisted(() => ({ service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.service,
  getServiceDb: () => holder.service,
}))

const { claimUsage } = await import('./ai-usage')
const { PLAN_LIMITS, QuotaExceededError } = await import('./plans')

const service = serviceClient()
const email = testEmail('cuota-carrera')
let practitionerId = ''

beforeAll(async () => {
  holder.service = service
  practitionerId = await createTestPractitioner(email, 'Cuota Prueba')
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

describe('claimUsage', () => {
  it('con la última unidad libre, de diez pedidos a la vez pasa uno solo', async () => {
    const limit = PLAN_LIMITS.free.reports
    const rows = Array.from({ length: limit - 1 }, () => ({
      practitioner_id: practitionerId,
      kind: 'reports',
    }))
    await service.from('ai_usage').insert(rows)

    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => claimUsage(practitionerId, 'free', 'reports')),
    )

    const passed = results.filter((result) => result.status === 'fulfilled')
    const refused = results.filter(
      (result) => result.status === 'rejected' && result.reason instanceof QuotaExceededError,
    )
    expect(passed).toHaveLength(1)
    expect(refused).toHaveLength(9)

    const { count } = await service
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('practitioner_id', practitionerId)
      .eq('kind', 'reports')
    expect(count).toBe(limit)
  })

  it('cada tipo tiene su propia cuenta', async () => {
    await expect(claimUsage(practitionerId, 'free', 'materials')).resolves.toBeTypeOf('string')
  })
})
