import { describe, expect, it } from 'vitest'

import {
  eventBody,
  minutesBetween,
  toBusyBlocks,
  toLocalDateTime,
} from '@/server/google-calendar'
import type { GoogleEvent } from '@/server/google-calendar'

/**
 * Exactamente qué sale de Hilo hacia el calendario de Google.
 *
 * Se prueba `eventBody` y no las funciones que llaman a la API porque esto es lo
 * que se puede afirmar sin una cuenta de Google del otro lado — y porque es
 * donde están las dos cosas que importan: qué se cuenta del paciente, y a qué
 * hora queda la sesión.
 *
 * La hora es el error silencioso clásico de este tipo de integración. Nada
 * falla, nadie se entera, y las sesiones aparecen corridas unas horas.
 */

const sesion = {
  id: 'aaaaaaaa-0000-4000-8000-000000000001',
  patient_id: 'bbbbbbbb-0000-4000-8000-000000000001',
  scheduled_on: '2026-08-24',
  start_time: '15:00:00',
  duration_minutes: 45,
  gcal_event_id: null,
}

describe('la hora del evento', () => {
  it('manda hora de pared con el nombre de la zona, sin convertir a UTC', () => {
    const body = eventBody(sesion, 'Ocupado')

    expect(body.start).toEqual({
      dateTime: '2026-08-24T15:00:00',
      timeZone: 'America/Montevideo',
    })
  })

  it('suma la duración para el final', () => {
    expect(eventBody(sesion, 'Ocupado').end.dateTime).toBe('2026-08-24T15:45:00')
  })

  it('cruza bien la hora en punto', () => {
    const body = eventBody({ ...sesion, start_time: '15:30:00' }, 'Ocupado')
    expect(body.end.dateTime).toBe('2026-08-24T16:15:00')
  })

  it('cruza bien la medianoche', () => {
    const body = eventBody(
      { ...sesion, start_time: '23:45:00', duration_minutes: 45 },
      'Ocupado',
    )
    expect(body.end.dateTime).toBe('2026-08-25T00:30:00')
  })

  it('acepta la hora sin segundos, que es como la escribe un formulario', () => {
    const body = eventBody({ ...sesion, start_time: '09:00' }, 'Ocupado')
    expect(body.start.dateTime).toBe('2026-08-24T09:00:00')
    expect(body.end.dateTime).toBe('2026-08-24T09:45:00')
  })
})

describe('la hora que vuelve de Google', () => {
  // Este bloque existe por un error concreto y silencioso: leer la hora con
  // `new Date(...).getHours()`, que devuelve la hora del servidor. En Vercel el
  // servidor está en UTC, así que las tres de la tarde en Montevideo se
  // guardarían como las seis — en todas las sesiones, sin que nada falle.
  //
  // El script de tests fija `TZ=UTC` (ver `package.json`), y eso es lo que hace
  // que estos tests signifiquen algo: en una Mac uruguaya la versión con el bug
  // daría la respuesta correcta por casualidad y pasarían igual. Con el reloj en
  // UTC, la máquina de quien programa se comporta como el servidor.

  it('lee una hora de Montevideo como hora de Montevideo', () => {
    expect(toLocalDateTime('2026-08-24T15:00:00-03:00')).toEqual({
      date: '2026-08-24',
      time: '15:00:00',
    })
  })

  it('convierte una hora que viene en UTC', () => {
    // Las 18:00 UTC son las 15:00 en Montevideo, el mismo día.
    expect(toLocalDateTime('2026-08-24T18:00:00Z')).toEqual({
      date: '2026-08-24',
      time: '15:00:00',
    })
  })

  it('retrocede el día cuando en UTC ya es el siguiente', () => {
    // Las 02:00 UTC del 25 son las 23:00 del 24 en Montevideo. Si la fecha se
    // tomara de UTC, esta sesión aparecería un día después.
    expect(toLocalDateTime('2026-08-25T02:00:00Z')).toEqual({
      date: '2026-08-24',
      time: '23:00:00',
    })
  })

  it('escribe la medianoche como 00 y no como 24', () => {
    // `hour12: false` devuelve "24" en algunos entornos, y "24:00:00" no es una
    // hora válida para Postgres: la fila se rechaza y la sesión no se mueve.
    expect(toLocalDateTime('2026-08-24T03:00:00Z').time).toBe('00:00:00')
  })
})

describe('cuánto dura', () => {
  it('cuenta los minutos entre principio y fin', () => {
    expect(
      minutesBetween('2026-08-24T15:00:00-03:00', '2026-08-24T15:45:00-03:00'),
    ).toBe(45)
  })

  it('cuenta bien aunque los desfasajes vengan escritos distinto', () => {
    expect(minutesBetween('2026-08-24T18:00:00Z', '2026-08-24T16:00:00-03:00')).toBe(60)
  })

  it('nunca devuelve menos de cinco minutos', () => {
    // La tabla tiene `check (duration_minutes between 5 and 480)`. Un evento de
    // duración cero —posible arrastrando en el calendario— rebotaría contra ese
    // check y la sesión no se movería, sin que nadie sepa por qué.
    expect(minutesBetween('2026-08-24T15:00:00Z', '2026-08-24T15:00:00Z')).toBe(5)
  })
})

describe('lo que se cuenta del paciente', () => {
  // El título entra ya resuelto: quien lo arma es `calendarEventTitle`, con lo
  // que la profesional eligió. Acá se comprueba lo otro — que no haya ninguna
  // otra puerta por donde se escape algo.

  it('el título es el que se le pasa y nada más', () => {
    expect(eventBody(sesion, 'T. P.').summary).toBe('T. P.')
  })

  it('la descripción es fija y no dice nada de nadie', () => {
    expect(eventBody(sesion, 'Tomás').description).toBe('Agendado desde Hilo')
  })

  it('no manda invitados: una sesión no es una invitación a la familia', () => {
    expect(eventBody(sesion, 'Tomás')).not.toHaveProperty('attendees')
  })

  it('no manda ubicación ni ningún campo libre de más', () => {
    const body = eventBody(sesion, 'Tomás')

    // La lista completa de lo que viaja. Si alguien agrega un campo, este test
    // se cae y lo obliga a mirar qué está mandando — que es justo lo que uno
    // quiere que pase cuando el destino es un servidor de otra empresa.
    expect(Object.keys(body).sort()).toEqual([
      'description',
      'end',
      'extendedProperties',
      'start',
      'summary',
    ])
  })

  it('lo único que identifica es el id de la sesión, que no dice nada por sí solo', () => {
    const body = eventBody(sesion, 'Ocupado')
    expect(body.extendedProperties.private).toEqual({ hilo_appointment_id: sesion.id })
  })
})

/**
 * Qué del calendario de Google termina dibujado en la Agenda.
 *
 * `toBusyBlocks` está separada de `listBusyBlocks` justamente para esto: la que
 * decide se puede probar entera, sin cuenta de Google y sin red.
 *
 * Lo que se afirma acá es sobre todo lo que **no** aparece. Un bloque de más es
 * una hora que parece ocupada y no lo está, y sobre eso se decide no agendar a
 * un paciente.
 */
describe('lo que se muestra del calendario de Google', () => {
  const semana = { from: '2026-08-31', to: '2026-09-06' }

  const evento = (extra: Partial<GoogleEvent> = {}): GoogleEvent => ({
    id: 'evt-1',
    summary: 'Devlane',
    start: { dateTime: '2026-08-31T09:00:00-03:00' },
    end: { dateTime: '2026-08-31T17:00:00-03:00' },
    ...extra,
  })

  it('trae un evento propio de la profesional, en hora de Montevideo', () => {
    const [block] = toBusyBlocks([evento()], semana.from, semana.to)

    expect(block).toEqual({
      id: 'evt-1',
      title: 'Devlane',
      date: '2026-08-31',
      startTime: '09:00:00',
      endTime: '17:00:00',
    })
  })

  it('descarta lo que escribió Hilo, que ya está en la grilla como sesión', () => {
    const propio = evento({
      extendedProperties: { private: { hilo_appointment_id: 'aaaa-0000' } },
    })

    expect(toBusyBlocks([propio], semana.from, semana.to)).toEqual([])
  })

  it('descarta un evento borrado en Google', () => {
    expect(toBusyBlocks([evento({ status: 'cancelled' })], semana.from, semana.to)).toEqual(
      [],
    )
  })

  it('descarta lo que cae fuera de la semana en pantalla', () => {
    // La ventana se le pide a Google con un día de más de cada lado, así que
    // esto llega de verdad y hay que recortarlo acá.
    const domingoAnterior = evento({ start: { dateTime: '2026-08-30T09:00:00-03:00' } })
    const lunesSiguiente = evento({ start: { dateTime: '2026-09-07T09:00:00-03:00' } })

    expect(toBusyBlocks([domingoAnterior, lunesSiguiente], semana.from, semana.to)).toEqual(
      [],
    )
  })

  it('marca el evento de todo el día sin inventarle una hora', () => {
    const feriado = evento({
      summary: 'Feriado',
      start: { date: '2026-09-02' },
      end: { date: '2026-09-03' },
    })

    const [block] = toBusyBlocks([feriado], semana.from, semana.to)

    expect(block?.startTime).toBeNull()
    expect(block?.endTime).toBeNull()
    expect(block?.date).toBe('2026-09-02')
  })

  it('le pone "Ocupado" al evento sin título, en vez de dejar el hueco', () => {
    expect(toBusyBlocks([evento({ summary: '   ' })], semana.from, semana.to)[0]?.title).toBe(
      'Ocupado',
    )
    expect(toBusyBlocks([evento({ summary: undefined })], semana.from, semana.to)[0]?.title).toBe(
      'Ocupado',
    )
  })

  it('no se cae si Google manda un evento sin final', () => {
    const [block] = toBusyBlocks([evento({ end: undefined })], semana.from, semana.to)

    expect(block?.startTime).toBe('09:00:00')
    expect(block?.endTime).toBeNull()
  })

  it('usa la zona de Montevideo y no la del servidor', () => {
    // Un evento a las 23:30 de Montevideo es el día siguiente en UTC. Si esto se
    // leyera con la hora del servidor —que en Vercel es UTC— la cena del lunes
    // aparecería el martes.
    const cena = evento({ start: { dateTime: '2026-08-31T23:30:00-03:00' }, end: undefined })

    expect(toBusyBlocks([cena], semana.from, semana.to)[0]).toMatchObject({
      date: '2026-08-31',
      startTime: '23:30:00',
    })
  })
})
