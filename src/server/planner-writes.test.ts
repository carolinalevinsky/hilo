import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Lo que el planificador escribe además del plan.
 *
 * Dos cosas que agregó el rediseño y que no se ven en la lista de la sesión: la
 * nota previa, que vive en la cita y no en el plan, y la actividad propia, que
 * además de entrar al plan queda guardada como material privado.
 *
 * Contra Postgres de verdad: las dos son escrituras, y lo que importa de las dos
 * es dónde caen — una nota que se guardara en otra fila que la que mira la
 * Agenda sería invisible justo cuando hace falta.
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

const { planSessionContext, setAppointmentNote } = await import('./appointments')
const { createOwnActivity, listMaterials } = await import('./materials')
const { addActivityToPlan, addGoalToPlan, listPlanItems, setPlanItemDuration } =
  await import('./session-plans')

const service = serviceClient()
const email = testEmail('planificador-escribe')

let me = ''
let patientId = ''
let appointmentId = ''

beforeAll(async () => {
  me = await createTestPractitioner(email, 'Escribiente Planes Prueba')
  holder.db = await signedInAs(email)
  holder.service = service

  const { data: patient, error: patientError } = await service
    .from('patients')
    .insert({ practitioner_id: me, full_name: 'Paciente Nota Prueba' })
    .select()
    .single()
  if (patientError) throw patientError
  patientId = patient.id

  const { data: appointment, error: appointmentError } = await service
    .from('appointments')
    .insert({
      practitioner_id: me,
      patient_id: patientId,
      scheduled_on: '2031-05-05',
      start_time: '10:00',
      duration_minutes: 45,
    })
    .select()
    .single()
  if (appointmentError) throw appointmentError
  appointmentId = appointment.id
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(me)
})

describe('la nota previa', () => {
  it('se guarda en la cita, que es de donde la lee la Agenda', async () => {
    await setAppointmentNote(me, appointmentId, 'Traer las tarjetas de la vez pasada.')

    expect((await planSessionContext(me, appointmentId)).note).toBe(
      'Traer las tarjetas de la vez pasada.',
    )

    // En la fila de la cita, no en una tabla del planificador: es la misma nota
    // que se escribe al agendar.
    const { data } = await service
      .from('appointments')
      .select('note')
      .eq('id', appointmentId)
      .single()
    expect(data?.note).toBe('Traer las tarjetas de la vez pasada.')
  })

  it('vaciarla la borra en vez de dejar una cadena vacía', async () => {
    await setAppointmentNote(me, appointmentId, '   ')
    expect((await planSessionContext(me, appointmentId)).note).toBeNull()
  })
})

describe('la duración de lo planificado', () => {
  it('son quince minutos cuando no se elige nada', async () => {
    await addActivityToPlan(me, patientId, 'Caldeamiento inicial', appointmentId)

    const item = (await listPlanItems(me, patientId, appointmentId)).find(
      (row) => row.title === 'Caldeamiento inicial',
    )
    expect(item?.durationMinutes).toBe(15)
  })

  it('se puede elegir al sumar y cambiar después', async () => {
    await addActivityToPlan(me, patientId, 'Juego de la oca', appointmentId, 30)

    const added = (await listPlanItems(me, patientId, appointmentId)).find(
      (row) => row.title === 'Juego de la oca',
    )
    expect(added?.durationMinutes).toBe(30)

    await setPlanItemDuration(me, added!.id, 45)
    const changed = (await listPlanItems(me, patientId, appointmentId)).find(
      (row) => row.id === added!.id,
    )
    expect(changed?.durationMinutes).toBe(45)
  })

  it('un largo que no está en la lista cae en el de siempre', async () => {
    // Lo que llega de un formulario es una cadena y puede ser cualquier cosa.
    await addActivityToPlan(me, patientId, 'Cierre', appointmentId, '37')

    const cierre = (await listPlanItems(me, patientId, appointmentId)).find(
      (row) => row.title === 'Cierre',
    )
    expect(cierre?.durationMinutes).toBe(15)
  })
})

describe('una actividad propia', () => {
  it('queda en la biblioteca como material privado de quien la escribió', async () => {
    await createOwnActivity(me, 'psychology', 'Juego de la oca con sílabas')

    const mine = await listMaterials(me, { discipline: 'psychology', onlyMine: true })
    const saved = mine.find((row) => row.title === 'Juego de la oca con sílabas')

    expect(saved).toBeDefined()
    expect(saved?.visibility).toBe('private')
    expect(saved?.practitioner_id).toBe(me)
  })

  it('sumada dos veces es un material, no dos', async () => {
    const first = await createOwnActivity(me, 'psychology', 'Ruleta de emociones propia')
    const second = await createOwnActivity(me, 'psychology', 'Ruleta de emociones propia')

    expect(second).toBe(first)

    const { count } = await service
      .from('materials')
      .select('id', { count: 'exact', head: true })
      .eq('practitioner_id', me)
      .eq('title', 'Ruleta de emociones propia')
    expect(count).toBe(1)
  })

  it('no guarda nada cuando el texto viene vacío', async () => {
    expect(await createOwnActivity(me, 'psychology', '   ')).toBeNull()
  })
})

describe('un objetivo que entra al plan', () => {
  it('entra solo, aunque haya en la biblioteca un material que le calce', async () => {
    const title = 'Reconocer emociones en fotos'

    // El material que el viejo `bestMaterialFor` habría elegido: mismo título
    // que el objetivo, así que la coincidencia es la máxima posible.
    await createOwnActivity(me, 'psychology', title)

    const { data: goal, error } = await service
      .from('goals')
      .insert({ practitioner_id: me, patient_id: patientId, title })
      .select()
      .single()
    if (error) throw error

    await addGoalToPlan(me, patientId, goal.id, null, appointmentId)

    const item = (await listPlanItems(me, patientId, appointmentId)).find(
      (row) => row.goalId === goal.id,
    )

    expect(item).toBeDefined()
    // Sin material. Antes se guardaba el que mejor puntuara contra el título, y
    // el plan mostraba una ficha que nadie había elegido.
    expect(item?.material).toBeNull()
  })
})
