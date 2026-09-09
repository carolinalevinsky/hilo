import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * `‹ ›  31 de agosto – 6 de setiembre de 2026  [Hoy]`
 *
 * La barra de navegación por período: flechas juntas a la izquierda, el rango al
 * lado, y el botón para volver al actual.
 *
 * Distinta de `PeriodSwitcher`, que sigue usándose en la Agenda en teléfono. Ahí
 * el período es el *título* de lo que hay abajo, así que va centrado con una
 * flecha de cada lado. Acá no es un título: es una barra de herramientas arriba
 * del contenido, y en una barra los controles van juntos a la izquierda y el
 * texto los acompaña.
 *
 * Devuelve un fragmento, no un contenedor. Quien la usa pone la fila: en la
 * Agenda va adentro de la barra de la tarjeta del calendario, que además tiene
 * cosas contra el borde derecho; en Cobros va suelta arriba de las tarjetas.
 */

const ARROW =
  'inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-[18px] leading-none text-muted-foreground transition-colors'

export function PeriodNav({
  prevHref,
  nextHref,
  resetHref,
  label,
  isCurrent,
  resetLabel,
}: {
  prevHref: string
  /**
   * Sin `href` la flecha se apaga en vez de esconderse: no hay nada que cobrar
   * en un mes que todavía no pasó, pero una flecha que desaparece corre todo lo
   * que tiene al lado, y un control que se mueve mientras lo usás es peor que
   * uno apagado.
   */
  nextHref?: string
  resetHref: string
  /** "31 de agosto – 6 de setiembre de 2026", "Agosto 2026" */
  label: string
  isCurrent: boolean
  /** "Hoy" en la Agenda, "Este mes" en Cobros. */
  resetLabel: string
}) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <Arrow href={prevHref} label="Período anterior">
          ‹
        </Arrow>
        <Arrow href={nextHref} label="Período siguiente">
          ›
        </Arrow>
      </div>

      <p className="text-[15px] leading-tight font-extrabold">{label}</p>

      {/* El botón siempre está, incluso cuando ya estás en el período actual. Uno
          que aparece y desaparece corre todo lo que tiene al lado, y esta es una
          barra a la que se le apunta sin mirar. En el período actual queda
          apagado en vez de irse. */}
      {isCurrent ? (
        <span className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-muted-foreground/60">
          {resetLabel}
        </span>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={resetHref}>{resetLabel}</Link>
        </Button>
      )}
    </>
  )
}

function Arrow({
  href,
  label,
  children,
}: {
  href?: string
  label: string
  children: React.ReactNode
}) {
  if (!href) {
    return (
      <span aria-hidden className={cn(ARROW, 'opacity-30')}>
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(ARROW, 'hover:border-violet hover:text-violet')}
    >
      {children}
    </Link>
  )
}
