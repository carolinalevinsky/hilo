import { ChevronLeft, ChevronRight } from '@/components/icons'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * `Octubre 2026                  [Este mes] ‹ ›`
 *
 * El período en un teléfono: el nombre a la izquierda, del tamaño de un
 * subtítulo, y las flechas juntas a la derecha, como en la agenda del teléfono.
 * La usan la Agenda (la semana) y Pagos (el mes).
 *
 * Antes eran dos cosas distintas y las dos raras: en la Agenda el rango iba
 * centrado entre dos flechas grandes, en negrita de 16 px, y competía con el
 * título de la pantalla; en Pagos, flechas, mes y "Este mes" apagado en una fila
 * que no se alineaba con nada.
 *
 * "Volver al actual" aparece sólo cuando no estás en el actual. Escondido no
 * corre nada de lugar: está entre el nombre, que se acorta, y las flechas, que
 * se quedan quietas contra el borde.
 *
 * En escritorio sigue `PeriodNav`, que es una barra de herramientas.
 */
export function PeriodBar({
  prevHref,
  nextHref,
  label,
  resetHref,
  resetLabel,
  isCurrent,
  className,
}: {
  prevHref: string
  /** Sin `href` la flecha se apaga: no hay nada que cobrar en un mes que no pasó. */
  nextHref?: string
  label: string
  resetHref: string
  /** "Hoy" en la Agenda, "Este mes" en Pagos. */
  resetLabel: string
  isCurrent: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <p className="min-w-0 flex-1 truncate text-item font-bold">{label}</p>

      {isCurrent ? null : (
        <Button asChild variant="outline" size="sm">
          <Link href={resetHref}>{resetLabel}</Link>
        </Button>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <Button asChild variant="outline" size="icon-sm" aria-label="Anterior">
          <Link href={prevHref}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        {nextHref ? (
          <Button asChild variant="outline" size="icon-sm" aria-label="Siguiente">
            <Link href={nextHref}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="icon-sm" disabled aria-label="Siguiente">
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
