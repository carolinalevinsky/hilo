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
 * Mover una sesión, contra Postgres de verdad: que la fila sea la misma (y se
 * lleve su plan), que el horario fijo no la vuelva a crear en su fecha vieja, y
 * que "de acá en adelante" deje un horario nuevo y retire el viejo. Google se
 * reemplaza por nada: su parte se prueba en `google-calendar.sync.test.ts`.
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

vi.mock('./google-calendar', () => ({
  pushAppointment: async () => true,
  removeAppointment: async () => {},
}))

const { rescheduleAppointment, RescheduleError } = await import('./reschedule')
const { materialiseAppointments } = await import('./appointments')

const service = serviceClient()
const email = testEmail('mover-sesion')
let practitionerId = ''
let patientId = ''

/** Una fecha a `days` de hoy, en el día de la semana que caiga. */
function inDays(days: number) {
  const date = todayDate()
  date.setDate(date.getDate() + days)
  return toDateInput(date)
}

function weekday(date: string) {
  return new Date(`${date}T00:00:00`).getDay()
}

async function newSchedule(startsOn: string) {
  const { data, error } = await service
    .from('schedules')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      weekday: weekday(startsOn),
      start_time: '15:00',
      duration_minutes: 45,
      frequency: 'weekly',
      starts_on: startsOn,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

async function appointmentsOf(scheduleId: string) {
  const { data } = await service
    .from('appointments')
    .select('id, scheduled_on, start_time, status')
    .eq('schedule_id', scheduleId)
    .order('scheduled_on')
  return data ?? []
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Mover Prueba')
  holder.db = await signedInAs(email)
  holder.service = service
  const { data } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Paula Prueba' })
    .select()
    .single()
  patientId = data!.id
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

describe('rescheduleAppointment', () => {
  it('mueve una sesión suelta y se lleva su plan', async () => {
    const { data: appointment } = await service
      .from('appointments')
      .insert({
        practitioner_id: practitionerId,
        patient_id: patientId,
        scheduled_on: inDays(2),
        start_time: '10:00',
        duration_minutes: 45,
      })
      .select()
      .single()
    const { error: planError } = await service.from('session_plan_items').insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      appointment_id: appointment!.id,
      title: 'Bingo de /r/',
    })
    expect(planError).toBeNull()

    await rescheduleAppointment(practitionerId, {
      appointmentId: appointment!.id,
      scheduledOn: inDays(4),
      startTime: '11:30',
      durationMinutes: 50,
    })

    const { data: after } = await service
      .from('appointments')
      .select('scheduled_on, start_time, duration_minutes')
      .eq('id', appointment!.id)
      .single()
    expect(after).toEqual({ scheduled_on: inDays(4), start_time: '11:30:00', duration_minutes: 50 })

    const { data: plan } = await service
      .from('session_plan_items')
      .select('appointment_id')
      .eq('appointment_id', appointment!.id)
    expect(plan).toHaveLength(1)
  })

  it('"sólo esta vez" no deja que el horario la vuelva a crear en su día', async () => {
    const start = inDays(1)
    const schedule = await newSchedule(start)
    await materialiseAppointments(practitionerId, start, inDays(15))
    const [first] = await appointmentsOf(schedule.id)

    await rescheduleAppointment(practitionerId, {
      appointmentId: first!.id,
      scheduledOn: inDays(3),
      startTime: '16:00',
      durationMinutes: 45,
      scope: 'once',
    })
    await materialiseAppointments(practitionerId, start, inDays(15))

    const dates = (await appointmentsOf(schedule.id)).map((row) => row.scheduled_on)
    expect(dates).not.toContain(start)
    expect(dates).toContain(inDays(3))
  })

  it('no la pone sobre otra sesión del mismo horario', async () => {
    const start = inDays(1)
    const schedule = await newSchedule(start)
    await materialiseAppointments(practitionerId, start, inDays(15))
    const [first, second] = await appointmentsOf(schedule.id)

    await expect(
      rescheduleAppointment(practitionerId, {
        appointmentId: first!.id,
        scheduledOn: second!.scheduled_on,
        startTime: '15:00',
        durationMinutes: 45,
      }),
    ).rejects.toBeInstanceOf(RescheduleError)
  })

  it('"de acá en adelante" arma un horario nuevo y retira el viejo', async () => {
    const start = inDays(1)
    const schedule = await newSchedule(start)
    await materialiseAppointments(practitionerId, start, inDays(22))
    const [, second] = await appointmentsOf(schedule.id)
    const target = inDays(9)

    await rescheduleAppointment(practitionerId, {
      appointmentId: second!.id,
      scheduledOn: target,
      startTime: '17:00',
      durationMinutes: 60,
      scope: 'series',
    })

    const { data: old } = await service
      .from('schedules')
      .select('is_active, ends_on')
      .eq('id', schedule.id)
      .single()
    expect(old?.is_active).toBe(false)
    expect(old!.ends_on! < second!.scheduled_on).toBe(true)

    // Del viejo queda sólo la anterior a la que se movió.
    expect((await appointmentsOf(schedule.id)).map((row) => row.id)).toHaveLength(1)

    const { data: moved } = await service
      .from('appointments')
      .select('schedule_id, scheduled_on, start_time')
      .eq('id', second!.id)
      .single()
    expect(moved?.schedule_id).not.toBe(schedule.id)
    expect(moved?.scheduled_on).toBe(target)

    const { data: next } = await service
      .from('schedules')
      .select('weekday, start_time, duration_minutes, is_active')
      .eq('id', moved!.schedule_id!)
      .single()
    expect(next).toEqual({
      weekday: weekday(target),
      start_time: '17:00:00',
      duration_minutes: 60,
      is_active: true,
    })
  })

  it('no mueve una sesión que ya tiene la asistencia marcada', async () => {
    const { data: appointment } = await service
      .from('appointments')
      .insert({
        practitioner_id: practitionerId,
        patient_id: patientId,
        scheduled_on: inDays(-1),
        start_time: '10:00',
        duration_minutes: 45,
        status: 'attended',
      })
      .select()
      .single()

    await expect(
      rescheduleAppointment(practitionerId, {
        appointmentId: appointment!.id,
        scheduledOn: inDays(2),
        startTime: '10:00',
        durationMinutes: 45,
      }),
    ).rejects.toBeInstanceOf(RescheduleError)
  })
})
