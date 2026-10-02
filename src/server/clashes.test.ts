import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { toDateInput, todayDate } from '@/lib/dates'
import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Convertir una reserva agenda sola, sin que nadie mire la grilla. Antes podía
 * dejar dos pacientes a la misma hora; ahora pregunta. Esto prueba qué cuenta
 * como choque, contra Postgres de verdad: los horarios fijos que todavía no son
 * filas también ocupan el lugar.
 */

const holder = vi.hoisted(() => ({ db: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.db,
}))

const { findClash, findScheduleClash, timesOverlap } = await import('./clashes')

const service = serviceClient()
const email = testEmail('choque-de-horario')
let practitionerId = ''
let patientId = ''

/** Un día dentro de dos semanas, para no depender de qué día es hoy. */
const day = (() => {
  const date = todayDate()
  date.setDate(date.getDate() + 14)
  return toDateInput(date)
})()
const weekday = new Date(`${day}T00:00:00`).getDay()

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Choque Prueba')
  holder.db = await signedInAs(email)

  const { data: patient, error } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Martina Agendada' })
    .select()
    .single()
  if (error) throw error
  patientId = patient.id

  const { error: appointmentError } = await service.from('appointments').insert([
    {
      practitioner_id: practitionerId,
      patient_id: patientId,
      scheduled_on: day,
      start_time: '10:00',
      duration_minutes: 45,
      source: 'manual',
      status: 'scheduled',
    },
    {
      practitioner_id: practitionerId,
      patient_id: patientId,
      scheduled_on: day,
      start_time: '12:00',
      duration_minutes: 45,
      source: 'manual',
      status: 'cancelled',
    },
  ])
  if (appointmentError) throw appointmentError

  const { error: scheduleError } = await service.from('schedules').insert({
    practitioner_id: practitionerId,
    patient_id: patientId,
    weekday,
    start_time: '15:00',
    duration_minutes: 45,
    frequency: 'weekly',
    starts_on: toDateInput(todayDate()),
  })
  if (scheduleError) throw scheduleError
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

describe('timesOverlap', () => {
  it('una que empieza cuando la otra termina no choca', () => {
    expect(timesOverlap('10:45', 45, '10:00', 45)).toBe(false)
  })

  it('una que empieza en el medio de la otra sí', () => {
    expect(timesOverlap('10:30', 45, '10:00', 45)).toBe(true)
    expect(timesOverlap('09:30', 45, '10:00:00', 45)).toBe(true)
  })
})

describe('findClash', () => {
  it('encuentra la sesión que se pisa, con su nombre y su hora', async () => {
    expect(await findClash(practitionerId, day, '10:30', 45)).toEqual({
      patientName: 'Martina Agendada',
      startTime: '10:00',
    })
  })

  it('justo después no choca', async () => {
    expect(await findClash(practitionerId, day, '10:45', 45)).toBeNull()
  })

  it('una cancelada no ocupa el lugar', async () => {
    expect(await findClash(practitionerId, day, '12:00', 45)).toBeNull()
  })

  it('un horario fijo ocupa el lugar aunque todavía no sea una fila', async () => {
    expect(await findClash(practitionerId, day, '15:15', 45)).toMatchObject({
      startTime: '15:00',
    })
  })
})

describe('findScheduleClash', () => {
  it('el mismo día de la semana y la misma franja', async () => {
    expect(await findScheduleClash(practitionerId, weekday, '14:30', 45)).not.toBeNull()
    expect(await findScheduleClash(practitionerId, (weekday + 1) % 7, '15:00', 45)).toBeNull()
  })
})
