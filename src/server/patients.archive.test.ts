import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { today, todayDate, toDateInput } from '@/lib/dates'
import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Qué pasa con la agenda y con el libro de Cobros cuando un paciente se va.
 *
 * Contra Postgres de verdad y a través de las funciones reales, no de una copia
 * de sus consultas. Es deliberado: lo que se rompía acá eran los `join`s —un
 * horario que seguía generando sesiones para alguien archivado, un nombre
 * borrado que seguía saliendo en la grilla— y eso no se puede probar contra un
 * doble, porque el doble no tiene `join`s.
 *
 * Necesita el stack local levantado (`npm run db:start`), como `rls.test.ts`.
 */

const holder = vi.hoisted(() => ({
  db: null as unknown,
  service: null as unknown,
}))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const { setPatientArchived, softDeletePatient } = await import('./patients')
const { listAppointments, listSchedules, materialiseAppointments } = await import(
  './appointments'
)
const { monthlyLedger } = await import('./payments')

const service = serviceClient()
const email = testEmail('archive')

let practitionerId = ''
let anaId = ''
let brunoId = ''

/** El lunes de hoy en adelante, para que el horario semanal caiga adentro. */
const from = today()
const to = toDateInput(new Date(todayDate().getTime() + 20 * 24 * 60 * 60 * 1000))
const weekday = todayDate().getDay()
const period = today().slice(0, 7)
const ayer = toDateInput(new Date(todayDate().getTime() - 24 * 60 * 60 * 1000))

async function newPatient(fullName: string) {
  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: fullName })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function newSchedule(patientId: string) {
  const { data, error } = await service
    .from('schedules')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      weekday,
      start_time: '15:00',
      duration_minutes: 45,
      frequency: 'weekly',
      starts_on: from,
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function upcomingCountFor(patientId: string) {
  const { count } = await service
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .gte('scheduled_on', today())
  return count ?? 0
}

async function scheduleIsActive(scheduleId: string) {
  const { data } = await service
    .from('schedules')
    .select('is_active')
    .eq('id', scheduleId)
    .single()
  return data?.is_active
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Archivo Prueba')
  holder.db = await signedInAs(email)
  holder.service = service

  anaId = await newPatient('Ana Prueba')
  brunoId = await newPatient('Bruno Prueba')
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
})

describe('archivar con horario fijo', () => {
  it('deja de generar sesiones, y conservar el horario lo devuelve al reactivar', async () => {
    const scheduleId = await newSchedule(anaId)

    await materialiseAppointments(practitionerId, from, to)
    expect(await upcomingCountFor(anaId)).toBeGreaterThan(0)

    // El síntoma que reportó Thomas: archivar y que la semana que viene siga
    // apareciendo. Abrir la Agenda vuelve a llamar a `materialiseAppointments`,
    // así que el segundo llamado es la mitad importante de la prueba.
    await setPatientArchived(practitionerId, anaId, true, 'keep')
    expect(await upcomingCountFor(anaId)).toBe(0)

    await materialiseAppointments(practitionerId, from, to)
    expect(await upcomingCountFor(anaId)).toBe(0)

    // Conservar significa que la regla sigue entera y vuelve sola.
    expect(await scheduleIsActive(scheduleId)).toBe(true)

    await setPatientArchived(practitionerId, anaId, false)
    await materialiseAppointments(practitionerId, from, to)
    expect(await upcomingCountFor(anaId)).toBeGreaterThan(0)
  })

  it('darlo de baja termina la regla, y reactivar ya no la trae', async () => {
    const scheduleId = await newSchedule(brunoId)
    await materialiseAppointments(practitionerId, from, to)
    expect(await upcomingCountFor(brunoId)).toBeGreaterThan(0)

    await setPatientArchived(practitionerId, brunoId, true, 'deactivate')

    expect(await scheduleIsActive(scheduleId)).toBe(false)
    expect(await upcomingCountFor(brunoId)).toBe(0)

    await setPatientArchived(practitionerId, brunoId, false)
    await materialiseAppointments(practitionerId, from, to)
    expect(await upcomingCountFor(brunoId)).toBe(0)
  })

  it('no toca el pasado', async () => {
    await service.from('appointments').insert({
      practitioner_id: practitionerId,
      patient_id: anaId,
      scheduled_on: ayer,
      start_time: '09:00',
      duration_minutes: 45,
      source: 'manual',
    })

    await setPatientArchived(practitionerId, anaId, true, 'keep')

    const { count } = await service
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', anaId)
      .eq('scheduled_on', ayer)

    expect(count).toBe(1)
    await setPatientArchived(practitionerId, anaId, false)
  })
})

describe('borrar un paciente', () => {
  it('lo saca de la grilla de la agenda — Ley N.º 18.331', async () => {
    const carla = await newPatient('Carla Prueba')

    // Una sesión pasada y ya asistida, a propósito: `clearUpcomingFor` no la
    // toca, así que la fila sigue existiendo y lo único que puede sacarla de la
    // grilla es el filtro por nombre. Escrita con una sesión futura, esta
    // prueba pasaba sin el arreglo —la fila desaparecía por borrada, no por
    // filtrada— y no probaba nada.
    await service.from('appointments').insert({
      practitioner_id: practitionerId,
      patient_id: carla,
      scheduled_on: ayer,
      start_time: '11:00',
      duration_minutes: 45,
      status: 'attended',
      source: 'manual',
    })

    const antes = await listAppointments(practitionerId, ayer, to)
    expect(antes.some((row) => row.patients?.full_name === 'Carla Prueba')).toBe(true)

    await softDeletePatient(practitionerId, carla)

    const despues = await listAppointments(practitionerId, ayer, to)
    expect(despues.some((row) => row.patients?.full_name === 'Carla Prueba')).toBe(false)

    // Y la fila sigue en la base: borrar es `deleted_at`, no un DELETE.
    const { count } = await service
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', carla)
    expect(count).toBe(1)
  })

  it('un borrado de antes de este arreglo tampoco genera sesiones', async () => {
    // Sin pasar por `softDeletePatient`: así quedaron las filas que se borraron
    // cuando borrar no tocaba los horarios. El filtro de `listSchedules` es lo
    // que las cubre, y sin él estos pacientes seguirían apareciendo para siempre.
    const gonzalo = await newPatient('Gonzalo Prueba')
    await newSchedule(gonzalo)
    await service
      .from('patients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', gonzalo)

    await materialiseAppointments(practitionerId, from, to)

    expect(await upcomingCountFor(gonzalo)).toBe(0)
    const schedules = await listSchedules(practitionerId)
    expect(schedules.some((row) => row.patient_id === gonzalo)).toBe(false)
  })

  it('deja su horario fijo sin efecto, sin preguntar', async () => {
    const dante = await newPatient('Dante Prueba')
    const scheduleId = await newSchedule(dante)

    await softDeletePatient(practitionerId, dante)

    expect(await scheduleIsActive(scheduleId)).toBe(false)
    expect(await upcomingCountFor(dante)).toBe(0)

    await materialiseAppointments(practitionerId, from, to)
    expect(await upcomingCountFor(dante)).toBe(0)

    const schedules = await listSchedules(practitionerId)
    expect(schedules.some((row) => row.patient_id === dante)).toBe(false)
  })
})

describe('el libro de Cobros', () => {
  it('no baja el total al archivar a quien ya pagó', async () => {
    const eva = await newPatient('Eva Prueba')
    await service.from('payments').insert({
      practitioner_id: practitionerId,
      patient_id: eva,
      period,
      paid_on: today(),
      amount: 1500,
      method: 'cash',
      status: 'confirmed',
    })

    const antes = await monthlyLedger(practitionerId, period)
    expect(antes.totalPaid).toBe(1500)

    await setPatientArchived(practitionerId, eva, true, 'keep')

    const despues = await monthlyLedger(practitionerId, period)
    expect(despues.totalPaid).toBe(1500)

    const fila = despues.rows.find((row) => row.patientId === eva)
    expect(fila?.archived).toBe(true)
    expect(fila?.paid).toBe(1500)
    // De alguien archivado no se espera nada más, así que no engrosa lo pendiente.
    expect(fila?.expected).toBeNull()
  })

  it('no llena el libro de archivados sin movimiento', async () => {
    const fabio = await newPatient('Fabio Prueba')
    await setPatientArchived(practitionerId, fabio, true, 'keep')

    const ledger = await monthlyLedger(practitionerId, period)
    expect(ledger.rows.some((row) => row.patientId === fabio)).toBe(false)
  })
})
