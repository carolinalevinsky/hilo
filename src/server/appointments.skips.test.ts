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
 * Que "Quitar de la agenda" no vuelva (P5).
 *
 * Contra Postgres de verdad: el error era que una sesión de horario fijo borrada
 * reaparecía en la próxima carga, y eso sólo se ve pasando otra vez por
 * `materialiseAppointments` contra filas reales.
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

const { materialiseAppointments, removeFromAgenda } = await import('./appointments')

const service = serviceClient()
const email = testEmail('quitar-agenda')
const otherEmail = testEmail('quitar-agenda-ajena')

let me = ''
let other = ''

function shift(days: number) {
  const date = todayDate()
  date.setDate(date.getDate() + days)
  return toDateInput(date)
}

// A window that covers two past weeks and three ahead, as the Agenda does.
const FROM = shift(-14)
const TO = shift(21)

async function newPatient(owner: string, fullName: string) {
  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: owner, full_name: fullName })
    .select()
    .single()
  if (error) throw error
  return data.id
}

/** A weekly rule on today's weekday, started two weeks ago. */
async function weeklySchedule(owner: string, patientId: string) {
  const { data, error } = await service
    .from('schedules')
    .insert({
      practitioner_id: owner,
      patient_id: patientId,
      weekday: todayDate().getDay(),
      start_time: '10:00',
      duration_minutes: 45,
      frequency: 'weekly',
      starts_on: FROM,
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function occurrences(scheduleId: string) {
  const { data } = await service
    .from('appointments')
    .select('id, scheduled_on, status')
    .eq('schedule_id', scheduleId)
    .order('scheduled_on')
  return data ?? []
}

beforeAll(async () => {
  me = await createTestPractitioner(email, 'Quitadora Agenda Prueba')
  other = await createTestPractitioner(otherEmail, 'Ajena Horarios Prueba')
  holder.db = await signedInAs(email)
  holder.service = service
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(me)
  await deleteTestPractitioner(other)
})

describe('quitar de la agenda una sesión de horario fijo', () => {
  it('"sólo esta vez" no vuelve en la próxima carga, y las otras siguen', async () => {
    const tomas = await newPatient(me, 'Tomás Prueba')
    const schedule = await weeklySchedule(me, tomas)
    await materialiseAppointments(me, FROM, TO)

    const nextWeek = (await occurrences(schedule)).find((row) => row.scheduled_on === shift(7))!
    await removeFromAgenda(me, nextWeek.id, 'once')

    // Lo que hace la Agenda en cada carga.
    await materialiseAppointments(me, FROM, TO)

    const dates = (await occurrences(schedule)).map((row) => row.scheduled_on)
    expect(dates).not.toContain(shift(7))
    expect(dates).toContain(shift(14))
    expect(dates).toContain(today())

    const { data: rule } = await service
      .from('schedules')
      .select('is_active')
      .eq('id', schedule)
      .single()
    expect(rule?.is_active).toBe(true)
  })

  it('"todas las de este horario" termina la regla, saca esta y las que siguen, y deja el pasado', async () => {
    const martina = await newPatient(me, 'Martina Prueba')
    const schedule = await weeklySchedule(me, martina)
    await materialiseAppointments(me, FROM, TO)

    const rows = await occurrences(schedule)
    const lastWeek = rows.find((row) => row.scheduled_on === shift(-7))!
    await service.from('appointments').update({ status: 'attended' }).eq('id', lastWeek.id)
    const todays = rows.find((row) => row.scheduled_on === today())!

    await removeFromAgenda(me, todays.id, 'series')
    await materialiseAppointments(me, FROM, TO)

    const left = await occurrences(schedule)
    expect(left.map((row) => [row.scheduled_on, row.status])).toEqual([
      [shift(-14), 'scheduled'],
      [shift(-7), 'attended'],
    ])
    const { data: rule } = await service
      .from('schedules')
      .select('is_active')
      .eq('id', schedule)
      .single()
    expect(rule?.is_active).toBe(false)
  })

  it('una sesión suelta se borra como siempre, sin anotar nada', async () => {
    const ana = await newPatient(me, 'Ana Prueba')
    const { data: manual, error } = await service
      .from('appointments')
      .insert({
        practitioner_id: me,
        patient_id: ana,
        scheduled_on: shift(3),
        start_time: '11:00',
        duration_minutes: 45,
      })
      .select()
      .single()
    if (error) throw error

    await removeFromAgenda(me, manual.id, 'once')

    const { count } = await service
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('id', manual.id)
    expect(count).toBe(0)
    const { count: skips } = await service
      .from('schedule_skips')
      .select('id', { count: 'exact', head: true })
      .eq('practitioner_id', me)
      .eq('skipped_on', shift(3))
    expect(skips).toBe(0)
  })

  it('la base no deja anotar una excepción en el horario de otra profesional', async () => {
    const ajeno = await newPatient(other, 'Ajeno Prueba')
    const schedule = await weeklySchedule(other, ajeno)

    const { error } = await service
      .from('schedule_skips')
      .insert({ practitioner_id: me, schedule_id: schedule, skipped_on: shift(7) })

    expect(error?.code).toBe('23503')
  })
})
