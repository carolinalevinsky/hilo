'use client'

import { ChevronDown } from '@/components/icons'

import { useUrlState } from '@/components/use-url-state'

/**
 * Cuántos días muestra la grilla: la semana laboral o los siete.
 *
 * ─── "Semana laboral" no esconde trabajo ──────────────────────────────────
 *
 * Esta es la decisión importante de este control, y no se ve. "Semana laboral"
 * **no** significa "mostrar sólo lunes a viernes": significa "no me muestres el
 * fin de semana si está vacío". Un sábado con una sesión aparece igual.
 *
 * La versión obvia —esconder sábado y domingo siempre— tiene una consecuencia
 * que nadie ve venir: la sesión de recuperación que pusiste el sábado desaparece
 * de la pantalla, y no hay nada que indique que falta algo. La agenda pasaría a
 * mentir en el único caso en que más caro sale.
 *
 * Así que la diferencia real entre las dos opciones es qué pasa con un fin de
 * semana **vacío**: en "laboral" no ocupa lugar, en "completa" se dibuja igual
 * para poder agendar ahí.
 *
 * ─── Por qué vive en la URL ───────────────────────────────────────────────
 *
 * Como la sesión abierta en el panel: se puede volver con el botón de atrás, se
 * puede recargar, y la grilla la sigue dibujando el servidor. `useUrlState`
 * además pinta el cambio antes de que llegue la respuesta.
 */
export function WeekViewSelect({ value }: { value: 'laboral' | 'completa' }) {
  const { set, pending } = useUrlState()

  return (
    <div className="relative" aria-busy={pending}>
      <select
        aria-label="Qué días mostrar"
        value={value}
        onChange={(event) =>
          // "laboral" es el valor por defecto, así que se borra de la dirección
          // en vez de escribirse: una URL limpia para el caso normal.
          set({ vista: event.target.value === 'completa' ? 'completa' : '' })
        }
        className="h-8 appearance-none rounded-lg border border-border bg-card py-0 pr-8 pl-3 text-meta font-semibold outline-none hover:border-violet focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="laboral">Semana laboral</option>
        <option value="completa">Semana completa</option>
      </select>

      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
