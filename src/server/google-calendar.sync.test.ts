import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { GOOGLE_EVENT_MARKER } from '@/lib/storage-keys'
import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Lo que vuelve de Google, aplicado sobre filas de verdad.
 *
 * `google-calendar.test.ts` prueba las funciones puras; acá está lo que las
 * rodea: qué evento se aplica a qué sesión. Google se reemplaza por un `fetch`
 * que contesta lo que el test le pide, y la conexión por una fija. La base es
 * la de verdad, con RLS.
 */

const holder = vi.hoisted(() => ({
  db: null as unknown,
  service: null as unknown,
  events: [] as unknown[],
}))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

vi.mock('./google', () => ({
  GOOGLE_TIMEOUT_MS: 1000,
  connectionFor: async () => ({ accessToken: 'token', calendarId: 'primary' }),
  findGoogleAccount: async () => null,
  pullStateFor: async () => ({ dueForPull: true, syncToken: 'punto' }),
  saveSyncPoint: async () => {},
}))

const { pullFromGoogle } = await import('./google-calendar')

const service = serviceClient()
const email = testEmail('google-sync')
let practitionerId = ''
let patientId = ''

const realFetch = globalThis.fetch

/**
 * Sólo lo que va a Google se contesta acá. El cliente de Supabase usa el mismo
 * `fetch` global, y la base tiene que seguir siendo la de verdad.
 */
function stubGoogle(answer: () => Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('googleapis.com') ? answer() : realFetch(input, init),
    ),
  )
}

function googleReturns(events: unknown[]) {
  holder.events = events
  stubGoogle(() =>
    Response.json({ items: holder.events, nextSyncToken: 'otro-punto' }, { status: 200 }),
  )
}

function event(id: string, appointmentId: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    status: 'confirmed',
    start: { dateTime: '2026-10-08T15:00:00-03:00' },
    end: { dateTime: '2026-10-08T15:45:00-03:00' },
    extendedProperties: { private: { [GOOGLE_EVENT_MARKER]: appointmentId } },
    ...extra,
  }
}

async function newAppointment(values: Record<string, unknown> = {}) {
  const { data, error } = await service
    .from('appointments')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      scheduled_on: '2026-10-06',
      start_time: '15:00',
      duration_minutes: 45,
      ...values,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

async function row(id: string) {
  const { data } = await service.from('appointments').select('*').eq('id', id).single()
  return data!
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Google Prueba')
  holder.db = await signedInAs(email)
  holder.service = service
  const { data } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Pedro Prueba' })
    .select()
    .single()
  patientId = data!.id
}, 60_000)

afterEach(() => {
  vi.unstubAllGlobals()
})

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

describe('pullFromGoogle', () => {
  it('un evento viejo, borrado por Ombúa, no vuelve a cancelar la sesión reagendada', async () => {
    // Ombúa canceló (borró E1), se volvió a agendar (E2). Google devuelve los dos.
    const appointment = await newAppointment({ gcal_event_id: 'e2' })

    googleReturns([event('e1', appointment.id, { status: 'cancelled' }), event('e2', appointment.id)])
    await pullFromGoogle(practitionerId)

    const after = await row(appointment.id)
    expect(after.status).toBe('scheduled')
    expect(after.gcal_event_id).toBe('e2')
  })

  it('borrar en Google cancela sólo lo agendado, y guarda el evento para poder restaurarlo', async () => {
    const scheduled = await newAppointment({ gcal_event_id: 'e3' })
    const attended = await newAppointment({ gcal_event_id: 'e4', status: 'attended' })

    googleReturns([
      event('e3', scheduled.id, { status: 'cancelled' }),
      event('e4', attended.id, { status: 'cancelled' }),
    ])
    await pullFromGoogle(practitionerId)

    expect((await row(scheduled.id)).status).toBe('cancelled')
    expect((await row(scheduled.id)).gcal_event_id).toBe('e3')
    expect((await row(attended.id)).status).toBe('attended')

    // Y restaurado en Google, vuelve.
    googleReturns([event('e3', scheduled.id)])
    await pullFromGoogle(practitionerId)
    expect((await row(scheduled.id)).status).toBe('scheduled')
  })

  it('mover en Google una sesión de un horario fijo no deja un fantasma en la fecha vieja', async () => {
    const { data: schedule, error } = await service
      .from('schedules')
      .insert({
        practitioner_id: practitionerId,
        patient_id: patientId,
        weekday: 2,
        start_time: '15:00',
        duration_minutes: 45,
        frequency: 'weekly',
        starts_on: '2026-09-01',
      })
      .select()
      .single()
    if (error) throw error

    const appointment = await newAppointment({
      gcal_event_id: 'e5',
      schedule_id: schedule.id,
      source: 'schedule',
    })

    googleReturns([event('e5', appointment.id)])
    await pullFromGoogle(practitionerId)

    expect((await row(appointment.id)).scheduled_on).toBe('2026-10-08')
    const { data: skips } = await service
      .from('schedule_skips')
      .select('skipped_on')
      .eq('schedule_id', schedule.id)
    expect(skips?.map((skip) => skip.skipped_on)).toEqual(['2026-10-06'])
  })

  it('una respuesta rota de Google no tira nada', async () => {
    stubGoogle(() => new Response('<html>502</html>', { status: 200 }))
    await expect(pullFromGoogle(practitionerId)).resolves.toBe(0)
  })
})
