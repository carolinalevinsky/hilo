'use client'

import { useEffect, useState } from 'react'

import { HOUR_HEIGHT } from '@/lib/agenda-layout'
import { TIME_ZONE } from '@/lib/dates'

/**
 * La línea de "ahora" cruzando la columna de hoy.
 *
 * Es lo que convierte la grilla en algo que se mira de reojo entre paciente y
 * paciente: sin ella hay que leer los números de la izquierda y calcular. Con
 * ella se ve de un vistazo qué viene después, que es la única pregunta que uno
 * le hace a una agenda en mitad del día.
 *
 * ─── Por qué es un componente de cliente y arranca en null ─────────────────
 *
 * La hora actual no existe en el servidor: lo que existe es la hora del
 * servidor, que en Vercel es UTC y está tres horas adelante de Montevideo.
 * Dibujarla durante el render pondría la línea tres horas abajo, y encima el
 * HTML del servidor no coincidiría con el del navegador.
 *
 * Así que el primer render no dibuja nada y la línea aparece después de hidratar,
 * cuando se puede leer el reloj de quien está mirando. Un parpadeo, contra una
 * línea puesta en la hora equivocada.
 */
export function NowLine({
  firstHour,
  lastHour,
}: {
  /** La primera hora que dibuja la grilla, para restarla. */
  firstHour: number
  /** La última, para no dibujar la línea fuera del lienzo. */
  lastHour: number
}) {
  const [minutes, setMinutes] = useState<number | null>(null)

  useEffect(() => {
    /**
     * Los minutos desde medianoche **en Montevideo**, no en la máquina de quien
     * mira. Una profesional viajando, o con el reloj mal puesto, tiene que ver
     * su agenda en la hora de su consultorio.
     */
    function read() {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).formatToParts(new Date())

      const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
      setMinutes(get('hour') * 60 + get('minute'))
    }

    read()
    // Cada medio minuto: la línea se mueve un píxel cada poco más de un minuto,
    // así que más seguido no se notaría y menos seguido se atrasa a la vista.
    const timer = setInterval(read, 30_000)
    return () => clearInterval(timer)
  }, [])

  if (minutes === null) return null

  const from = firstHour * 60
  // La grilla llega hasta el final de `lastHour`, no hasta su principio.
  const to = (lastHour + 1) * 60
  if (minutes < from || minutes > to) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-40 flex items-center"
      style={{ top: ((minutes - from) / 60) * HOUR_HEIGHT }}
    >
      <span className="-ml-[3px] size-[7px] shrink-0 rounded-full bg-violet" />
      <span className="h-px flex-1 bg-violet" />
    </div>
  )
}
