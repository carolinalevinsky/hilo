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
 * ─── La forma ─────────────────────────────────────────────────────────────
 *
 * Título y botón en la misma línea, cada uno contra su borde, y el botón
 * centrado contra el alto de todo el bloque. Un botón colgando abajo de un
 * párrafo deja el aviso sin eje: la vista baja leyendo, llega al final y tiene
 * que volver a subir para encontrar qué hacer.
 *
 * La segunda línea arranca debajo del ícono y no debajo del título. Sangrarla
 * hasta la primera letra deja al ícono flotando solo sobre un espacio vacío;
 * alineadas las dos contra el mismo borde, el bloque se lee como uno.
 *
 * ─── Lo que este texto ya no dice ─────────────────────────────────────────
 *
 * Antes nombraba la privacidad —que el evento dice "Ocupado"— para que se
 * supiera antes de autorizar. Ya no. Sigue siendo cierto y sigue siendo el valor
 * por defecto, y la explicación entera está en la tarjeta de Mi perfil, que es
 * donde se elige qué sale hacia Google. Acá quedó la invitación sola.
 */
export function ConnectGoogle() {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-4 rounded-xl border border-violet/30 bg-violet-soft px-4 py-3.5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13.5px] font-bold">
          <CalendarPlus className="size-[18px] shrink-0 text-violet" />
          <span className="truncate">Conectá tu Google Calendar</span>
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Conectá tu cuenta de Google para tener tu calendario siempre sincronizado.
        </p>
      </div>

      {/* Un enlace y no un botón con acción: el final del camino es una
          redirección al dominio de Google. */}
      <Button asChild className="shrink-0">
        <a href="/api/google/conectar">Conectar</a>
      </Button>
    </div>
  )
}
