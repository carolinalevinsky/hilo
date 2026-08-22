import { describe, expect, it } from 'vitest'

import { eventBody } from '@/server/google-calendar'

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
