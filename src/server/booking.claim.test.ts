import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Que una reserva se convierta en paciente una sola vez.
 *
 * Contra Postgres de verdad: lo que se prueba es que dos pedidos al mismo
 * tiempo no pasen los dos, y eso lo decide la base, no el código.
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const { claimBookingRequest, releaseBookingRequest } = await import('./booking')

const service = serviceClient()
const email = testEmail('reserva-una-vez')
let practitionerId = ''

async function newRequest() {
  const { data, error } = await service
    .from('booking_requests')
    .insert({ practitioner_id: practitionerId, name: 'Familia Prueba', phone: '099 000 000' })
    .select()
    .single()
  if (error) throw error
  return data.id
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Reserva Prueba')
  holder.db = await signedInAs(email)
  holder.service = service
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

describe('claimBookingRequest', () => {
  it('deja pasar a uno solo de dos clics seguidos', async () => {
    const requestId = await newRequest()

    const results = await Promise.all([
      claimBookingRequest(practitionerId, requestId),
      claimBookingRequest(practitionerId, requestId),
    ])

    expect(results.filter(Boolean)).toHaveLength(1)
  })

  it('si algo falla después, la devuelve a pendiente para reintentar', async () => {
    const requestId = await newRequest()

    await claimBookingRequest(practitionerId, requestId)
    await releaseBookingRequest(practitionerId, requestId)

    expect(await claimBookingRequest(practitionerId, requestId)).not.toBeNull()
  })
})
