import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
} from '@/test/supabase'

/**
 * Que lo preparado sea para una sesión, y que la Agenda vea lo mismo (P14).
 *
 * Contra Postgres de verdad, como `sessions.test.ts`: la regla que decide qué
 * filas son el plan de una sesión está escrita dos veces —una como filtro para
 * Postgres, otra sobre filas en memoria para la Agenda— y lo que se prueba acá es
 * que las dos digan lo mismo. Eso no se puede probar contra un doble.
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

const { addActivityToPlan, clearPlan, listPlanItems, upcomingPlans } = await import(
  './session-plans'
)
const { planForRange } = await import('./planning')

const service = serviceClient()
const email = testEmail('plan-sesion')
const otherEmail = testEmail('plan-sesion-ajena')

let me = ''
let other = ''

// Far enough ahead that "the next session" is the one these tests create, never
// something left over from a real day.
const SOON = '2031-03-03'
const LATER = '2031-03-10'

async function newPatient(owner: string, fullName: string) {
  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: owner, full_name: fullName })
    .select()
    .single()
  if (error) throw error
  return data.id
}

async function newAppointment(owner: string, patientId: string, scheduledOn: string) {
  const { data, error } = await service
    .from('appointments')
    .insert({
      practitioner_id: owner,
      patient_id: patientId,
      scheduled_on: scheduledOn,
      start_time: '17:00',
      duration_minutes: 45,
    })
    .select()
    .single()
  if (error) throw error
  return data.id
}

/** A row as it was written before plans had a session. */
async function looseItem(patientId: string, title: string) {
  const { error } = await service
    .from('session_plan_items')
    .insert({ practitioner_id: me, patient_id: patientId, title })
  if (error) throw error
}

const titles = (items: { title: string | null }[]) => items.map((item) => item.title)

beforeAll(async () => {
  // Names no other test file uses. The slug comes from the name, and test files
  // run in parallel: two "Ajena Prueba" signing up at the same instant collide
  // on it and one of them fails with "Database error creating new user".
  me = await createTestPractitioner(email, 'Planificadora Sesiones Prueba')
  other = await createTestPractitioner(otherEmail, 'Ajena Planes Prueba')
  holder.db = await signedInAs(email)
  holder.service = service
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(me)
  await deleteTestPractitioner(other)
})

describe('lo preparado es para una sesión', () => {
  it('lo de una sesión no aparece en la otra del mismo paciente', async () => {
    const tomas = await newPatient(me, 'Tomás Prueba')
    const lunes = await newAppointment(me, tomas, SOON)
    const lunesQueViene = await newAppointment(me, tomas, LATER)

    await addActivityToPlan(me, tomas, 'Oca con sílabas', lunes)
    await addActivityToPlan(me, tomas, 'Lámina de la vez pasada', lunesQueViene)

    expect(titles(await listPlanItems(me, tomas, lunes))).toEqual(['Oca con sílabas'])
    expect(titles(await listPlanItems(me, tomas, lunesQueViene))).toEqual([
      'Lámina de la vez pasada',
    ])
  })

  it('sin decir la sesión, es la próxima', async () => {
    // Lo que hacen la ficha y "Sumar a la sesión" desde un material: sólo
    // conocen al paciente.
    const martina = await newPatient(me, 'Martina Prueba')
    const proxima = await newAppointment(me, martina, SOON)
    await newAppointment(me, martina, LATER)

    await addActivityToPlan(me, martina, 'Lotería de campos semánticos')

    const { data } = await service
      .from('session_plan_items')
      .select('appointment_id')
      .eq('patient_id', martina)
    expect(data).toEqual([{ appointment_id: proxima }])
  })

  it('lo preparado antes, sin sesión, es de la próxima y no de las siguientes', async () => {
    const ana = await newPatient(me, 'Ana Prueba')
    const proxima = await newAppointment(me, ana, SOON)
    const despues = await newAppointment(me, ana, LATER)
    await looseItem(ana, 'Preparado antes de P14')

    expect(titles(await listPlanItems(me, ana))).toEqual(['Preparado antes de P14'])
    expect(titles(await listPlanItems(me, ana, proxima))).toEqual(['Preparado antes de P14'])
    expect(await listPlanItems(me, ana, despues)).toEqual([])
  })

  it('un paciente sin nada agendado se puede preparar igual', async () => {
    const lucas = await newPatient(me, 'Lucas Prueba')

    await addActivityToPlan(me, lucas, 'Rompecabezas de secuencias')

    expect(titles(await listPlanItems(me, lucas))).toEqual(['Rompecabezas de secuencias'])
    const plans = await upcomingPlans(me)
    expect(plans.find((plan) => plan.patientId === lucas)?.appointment).toBeNull()
  })

  it('vaciar una sesión no toca lo preparado para la otra', async () => {
    const sofia = await newPatient(me, 'Sofía Prueba')
    const proxima = await newAppointment(me, sofia, SOON)
    const despues = await newAppointment(me, sofia, LATER)
    await addActivityToPlan(me, sofia, 'Para el lunes', proxima)
    await addActivityToPlan(me, sofia, 'Para el otro lunes', despues)

    await clearPlan(me, sofia, proxima)

    expect(await listPlanItems(me, sofia, proxima)).toEqual([])
    expect(titles(await listPlanItems(me, sofia, despues))).toEqual(['Para el otro lunes'])
  })

  it('si se borra la cita, lo preparado no se pierde', async () => {
    const bruno = await newPatient(me, 'Bruno Prueba')
    const cita = await newAppointment(me, bruno, SOON)
    await addActivityToPlan(me, bruno, 'Memotest de fonemas', cita)

    const { error } = await service.from('appointments').delete().eq('id', cita)
    expect(error).toBeNull()

    // Sin sesión y sin otra agendada: vuelve a ser lo preparado para Bruno.
    expect(titles(await listPlanItems(me, bruno))).toEqual(['Memotest de fonemas'])
  })

  it('la base no deja colgar un plan de la cita de otro paciente', async () => {
    const uno = await newPatient(me, 'Uno Prueba')
    const dos = await newPatient(me, 'Dos Prueba')
    const citaDeDos = await newAppointment(me, dos, SOON)
    const ajeno = await newPatient(other, 'Ajeno Prueba')
    const citaAjena = await newAppointment(other, ajeno, SOON)

    for (const appointment_id of [citaDeDos, citaAjena]) {
      const { error } = await service.from('session_plan_items').insert({
        practitioner_id: me,
        patient_id: uno,
        appointment_id,
        title: 'No debería entrar',
      })
      expect(error?.code).toBe('23503')
    }
  })
})

describe('la Agenda ve lo mismo que Planificación', () => {
  it('"Plan de la semana" muestra el plan de cada sesión, y el objetivo sale de ahí', async () => {
    const paz = await newPatient(me, 'Paz Prueba')
    const { data: goals, error } = await service
      .from('goals')
      .insert([
        { practitioner_id: me, patient_id: paz, title: 'El más atrasado', progress: 10 },
        { practitioner_id: me, patient_id: paz, title: 'El que preparé', progress: 70 },
      ])
      .select()
    if (error) throw error
    const prepared = goals.find((goal) => goal.title === 'El que preparé')!

    const cita = await newAppointment(me, paz, SOON)
    await service.from('session_plan_items').insert({
      practitioner_id: me,
      patient_id: paz,
      appointment_id: cita,
      goal_id: prepared.id,
      title: prepared.title,
    })

    const week = await planForRange(me, 'speech_therapy', SOON, SOON)
    const row = week.find((session) => session.appointmentId === cita)

    expect(row?.plan.map((line) => line.title)).toEqual(['El que preparé'])
    // Sin el plan, Hilo sugeriría el más atrasado.
    expect(row?.focus?.title).toBe('El que preparé')
    expect(row?.focusChosen).toBe(true)
  })

  it('lo preparado sin sesión aparece en la próxima de la Agenda, y sólo ahí', async () => {
    const juan = await newPatient(me, 'Juan Prueba')
    const proxima = await newAppointment(me, juan, SOON)
    const despues = await newAppointment(me, juan, LATER)
    await looseItem(juan, 'Preparado sin sesión')

    const range = await planForRange(me, 'speech_therapy', SOON, LATER)
    const plan = (id: string) =>
      range.find((session) => session.appointmentId === id)?.plan.map((line) => line.title)

    expect(plan(proxima)).toEqual(['Preparado sin sesión'])
    expect(plan(despues)).toEqual([])
  })

  it('"Planes preparados" agrupa por sesión, con su fecha', async () => {
    const eva = await newPatient(me, 'Eva Prueba')
    const proxima = await newAppointment(me, eva, SOON)
    const despues = await newAppointment(me, eva, LATER)
    await addActivityToPlan(me, eva, 'Primera', proxima)
    await addActivityToPlan(me, eva, 'Segunda', despues)

    const mine = (await upcomingPlans(me)).filter((plan) => plan.patientId === eva)

    expect(mine.map((plan) => [plan.appointment?.scheduledOn, plan.items])).toEqual([
      [SOON, ['Primera']],
      [LATER, ['Segunda']],
    ])
  })
})
