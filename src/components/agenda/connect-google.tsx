'use client'

import { CalendarPlus, X } from '@/components/icons'
import { useRouter } from 'next/navigation'

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
 * ─── La X ─────────────────────────────────────────────────────────────────
 *
 * El párrafo de arriba decía que un cartel que no se puede cerrar se vuelve
 * mobiliario, y después no daba forma de cerrarlo. En teléfono eso costaba
 * 220 px arriba de la semana, todos los días, hasta conectar la cuenta —
 * medido: la primera sesión de la semana caía cerca de y 1400.
 *
 * Se apaga por un mes y no para siempre, a propósito. "Ahora no" es lo que
 * quiere decir la mayoría de las veces que alguien cierra un cartel, y a un mes
 * de distancia la invitación vuelve a ser útil en vez de molesta.
 *
 * Va en una cookie y no en `localStorage` porque el servidor la lee antes de
 * pintar: con `localStorage` el aviso aparecería en el primer cuadro y se
 * borraría en el segundo, que es justo el parpadeo que no queremos arriba de la
 * semana. `max-age` hace de reloj — no hay ninguna fecha que guardar ni comparar.
 *
 * El nombre de la cookie llega como prop y no se exporta desde acá. Este archivo
 * es `'use client'`: cuando un componente de servidor importa una constante de
 * un módulo de cliente, no recibe el texto sino una referencia al cliente, y
 * `cookies().get(esaReferencia)` devuelve `undefined` sin decir nada. La cookie
 * aparecía en el frasco y el aviso no se iba nunca. El dueño del nombre es la
 * página, que es la que lee.
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

const ONE_MONTH_SECONDS = 60 * 60 * 24 * 30

export function ConnectGoogle({ cookieName }: { cookieName: string }) {
  const router = useRouter()

  function dismiss() {
    document.cookie = `${cookieName}=off; max-age=${ONE_MONTH_SECONDS}; path=/; samesite=lax`
    router.refresh()
  }

  return (
    // `flex-wrap`: con la ✕ al lado del botón, en un teléfono de 375 px el
    // título se recortaba a "Conectá tu Google…" y el párrafo caía a cuatro
    // renglones. Envuelto, el texto se lleva la línea entera y los botones la
    // siguiente.
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet/30 bg-violet-soft px-4 py-3.5">
      <div className="min-w-[190px] flex-1">
        <p className="flex items-center gap-2 text-body font-bold">
          <CalendarPlus className="size-[18px] shrink-0 text-violet" />
          Conectá tu Google Calendar
        </p>
        <p className="mt-1 text-meta text-muted-foreground">
          Conectá tu cuenta de Google para tener tu calendario siempre sincronizado.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 max-sm:w-full max-sm:justify-end">
        {/* Un enlace y no un botón con acción: el final del camino es una
            redirección al dominio de Google. */}
        <Button asChild>
          <a href="/api/google/conectar">Conectar</a>
        </Button>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Ocultar este aviso por un mes"
          title="Ahora no"
          // 44 px de zona táctil en teléfono, como el `···` de Cobros: el ícono
          // se queda chico y lo que crece es el aire alrededor.
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-violet/10 hover:text-foreground max-lg:size-11"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
