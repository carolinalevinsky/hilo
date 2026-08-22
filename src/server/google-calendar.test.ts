import { describe, expect, it } from 'vitest'

import {
  eventBody,
  minutesBetween,
  toLocalDateTime,
} from '@/server/google-calendar'

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
