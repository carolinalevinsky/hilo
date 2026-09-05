import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * `‹ ›  31 de agosto – 6 de setiembre de 2026  [Hoy]`
 *
 * La navegación de la Agenda en escritorio, adentro de la barra de la tarjeta
 * del calendario.
 *
 * Distinta de `PeriodSwitcher`, que sigue usándose en Cobros y en las demás
 * pantallas y en la Agenda en teléfono. Ahí el período es el *título* de lo que
 * hay abajo, así que va centrado con una flecha de cada lado. Acá no es un
 * título: es una barra de herramientas arriba de una grilla, y en una barra los
 * controles van juntos a la izquierda y el texto los acompaña. Son dos formas
 * porque son dos funciones, no por descuido.
 */

const ARROW =
  'inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-[18px] leading-none text-muted-foreground transition-colors'

export function WeekNav({
  prevHref,
  nextHref,
  todayHref,
  label,
  isCurrentWeek,
}: {
  prevHref: string
  nextHref: string
  todayHref: string
  /** "31 de agosto – 6 de setiembre de 2026" */
  label: string
  isCurrentWeek: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <Arrow href={prevHref} label="Semana anterior">
          ‹
        </Arrow>
        <Arrow href={nextHref} label="Semana siguiente">
          ›
        </Arrow>
      </div>

      <p className="text-[15px] leading-tight font-extrabold">{label}</p>

      {/* "Hoy" siempre está, incluso en la semana actual. Un botón que aparece y
          desaparece corre todo lo que tiene al lado, y esto es una barra a la
          que se le apunta sin mirar. En la semana actual queda apagado en vez de
          irse. */}
      {isCurrentWeek ? (
        <span className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-muted-foreground/60">
          Hoy
        </span>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={todayHref}>Hoy</Link>
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
  href: string
  label: string
  children: React.ReactNode
}) {
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
