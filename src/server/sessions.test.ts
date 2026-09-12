import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Que el registro de una sesión quede atado a la hora de la agenda que registra.
 *
 * Contra Postgres de verdad, como `document-versions.test.ts`: dos de las cuatro
 * promesas —que la cita sea tuya y de ese paciente, y que no haya dos registros
 * de la misma— las cumple el esquema y no el código, y un doble no tiene
 * foráneas ni índices únicos.
 *
 * Necesita el stack local levantado (`npm run db:start`).
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

// Marcar "vino" no toca Google, pero el módulo sí se importa; que ningún test
// dependa de que la red esté o no esté.
vi.mock('./google-calendar', () => ({
  pushAppointment: async () => {},
  removeAppointment: async () => {},
}))

const { createSession, sessionForAppointment, SessionLinkError } = await import('./sessions')

const service = serviceClient()
const email = testEmail('registro-cita')
const otherEmail = testEmail('registro-cita-ajena')

let practitionerId = ''
let otherId = ''
let patientId = ''
let siblingId = ''
let strangerPatientId = ''

async function newPatient(owner: string, fullName: string) {
  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: owner, full_name: fullName })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function newAppointment(owner: string, patient: string, scheduledOn = '2026-09-10') {
  const { data, error } = await service
    .from('appointments')
    .insert({
      practitioner_id: owner,
      patient_id: patient,
      scheduled_on: scheduledOn,
      start_time: '15:00',
      duration_minutes: 45,
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function appointmentStatus(appointmentId: string) {
  const { data } = await service
    .from('appointments')
    .select('status')
    .eq('id', appointmentId)
    .single()
  return data?.status ?? null
}

async function recordsFor(appointmentId: string) {
  const { count } = await service
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('appointment_id', appointmentId)
  return count ?? 0
}

const note = { heldOn: '2026-09-10', progressNote: 'Trabajamos la /r/ en posición inicial.' }

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Registro Prueba')
  otherId = await createTestPractitioner(otherEmail, 'Ajena Prueba')
  holder.db = await signedInAs(email)
  holder.service = service

  patientId = await newPatient(practitionerId, 'Tomás Prueba')
  siblingId = await newPatient(practitionerId, 'Martina Prueba')
  strangerPatientId = await newPatient(otherId, 'Paciente Ajeno')
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
  await deleteTestPractitioner(otherId)
})

describe('registrar una sesión de la agenda', () => {
  it('deja el registro atado a su hora', async () => {
    const appointmentId = await newAppointment(practitionerId, patientId)

    const session = await createSession(practitionerId, patientId, { ...note, appointmentId })

    expect(session.appointment_id).toBe(appointmentId)
    expect(await sessionForAppointment(practitionerId, appointmentId)).toBe(session.id)
  })

  it('escribir el registro marca que vino', async () => {
    // La otra mitad del hallazgo: sin esto la agenda puede decir "agendada" de
    // una sesión que ya tiene su registro escrito.
    const appointmentId = await newAppointment(practitionerId, patientId)

    await createSession(practitionerId, patientId, { ...note, appointmentId })

    expect(await appointmentStatus(appointmentId)).toBe('attended')
  })

  it('también la corrige si había quedado "no vino"', async () => {
    const appointmentId = await newAppointment(practitionerId, patientId)
    await service.from('appointments').update({ status: 'no_show' }).eq('id', appointmentId)

    await createSession(practitionerId, patientId, { ...note, appointmentId })

    expect(await appointmentStatus(appointmentId)).toBe('attended')
  })

  it('no deja escribir dos registros de la misma hora', async () => {
    const appointmentId = await newAppointment(practitionerId, patientId)
    await createSession(practitionerId, patientId, { ...note, appointmentId })

    await expect(
      createSession(practitionerId, patientId, { ...note, appointmentId }),
    ).rejects.toBeInstanceOf(SessionLinkError)
    expect(await recordsFor(appointmentId)).toBe(1)
  })

  it('no ata un registro a la cita de otra profesional', async () => {
    const appointmentId = await newAppointment(otherId, strangerPatientId)

    await expect(
      createSession(practitionerId, patientId, { ...note, appointmentId }),
    ).rejects.toBeInstanceOf(SessionLinkError)
    expect(await recordsFor(appointmentId)).toBe(0)
    expect(await appointmentStatus(appointmentId)).toBe('scheduled')
  })

  it('no ata el registro de un paciente a la cita de otro paciente propio', async () => {
    const appointmentId = await newAppointment(practitionerId, siblingId)

    await expect(
      createSession(practitionerId, patientId, { ...note, appointmentId }),
    ).rejects.toBeInstanceOf(SessionLinkError)
    expect(await recordsFor(appointmentId)).toBe(0)
  })

  it('la regla vive en la base, no sólo en la función', async () => {
    // Con la clave de servicio, que no pasa por RLS ni por `createSession`: si
    // alguna vez otro camino escribe la columna, el esquema lo sigue parando.
    const appointmentId = await newAppointment(practitionerId, siblingId)

    const { error } = await service.from('sessions').insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      held_on: '2026-09-10',
      progress_note: 'Escrita por otro camino.',
      appointment_id: appointmentId,
    })

    expect(error?.code).toBe('23503')
  })

  it('sin cita sigue funcionando, porque alguien puede venir sin estar agendado', async () => {
    const session = await createSession(practitionerId, patientId, note)

    expect(session.appointment_id).toBeNull()
  })

  it('borrar la cita no borra lo que se escribió de ella', async () => {
    const appointmentId = await newAppointment(practitionerId, patientId)
    const session = await createSession(practitionerId, patientId, { ...note, appointmentId })

    const { error } = await service.from('appointments').delete().eq('id', appointmentId)
    expect(error).toBeNull()

    const { data } = await service
      .from('sessions')
      .select('id, appointment_id, patient_id')
      .eq('id', session.id)
      .single()
    expect(data).toEqual({ id: session.id, appointment_id: null, patient_id: patientId })
  })
})
