import { CalendarPlus } from '@/components/icons'

import { Button } from '@/components/ui/button'

/**
 * El aviso de que Google Calendar todavía no está conectado.
 *
 * Sólo aparece cuando no lo está: quien ya conectó no tiene por qué volver a
 * leer esto cada vez que abre la Agenda, y un cartel que no se puede hacer
 * desaparecer se vuelve parte del mobiliario a los tres días.
 *
 * Vive en la Agenda y no en el perfil porque es acá donde la falta se nota — la
 * semana está a la vista y no coincide con lo que tenés en el teléfono. El botón
 * arranca el permiso directo, sin pasar por otra pantalla.
 *
 * ─── Por qué dice lo que dice ─────────────────────────────────────────────
 *
 * Nombra la privacidad antes de que la profesional apriete, no después. Lo que
 * se manda a un servidor de Google, fuera del país, es una decisión sobre datos
 * de un paciente, y el momento de enterarse es antes de autorizar.
 *
 * De todo lo que había para decir queda lo que entra en un renglón: que las
 * sesiones viajan, y que el evento dice "Ocupado". Lo demás —que mover una en el
 * teléfono la mueve acá, que la nota clínica no sale nunca, cómo cambiar el
 * título— está entero en la tarjeta de Mi perfil, que es donde se decide. Un
 * aviso que hay que leer en tres renglones no lo lee nadie.
 *
 * ─── La forma ─────────────────────────────────────────────────────────────
 *
 * Título y botón en la misma línea, cada uno contra su borde. El botón colgando
 * abajo de un párrafo deja un bloque sin eje: la vista baja leyendo, llega al
 * final y tiene que volver a subir para encontrar qué hacer.
 */
export function ConnectGoogle() {
  return (
    <div className="mb-3.5 rounded-xl border border-violet/30 bg-violet-soft px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-[13.5px] font-bold">
          <CalendarPlus className="size-[18px] shrink-0 text-violet" />
          <span className="truncate">Conectá tu Google Calendar</span>
        </p>

        {/* Un enlace y no un botón con acción: el final del camino es una
            redirección al dominio de Google. */}
        <Button asChild size="sm" className="shrink-0">
          <a href="/api/google/conectar">Conectar</a>
        </Button>
      </div>

      {/* Sangrado hasta donde arranca el título, para que las dos líneas caigan
          sobre el mismo borde y el ícono quede afuera de la columna de texto. */}
      <p className="mt-1 pl-[26px] text-[12.5px] text-muted-foreground">
        Tus sesiones van a tu calendario y el evento dice sólo “Ocupado”.
      </p>
    </div>
  )
}
