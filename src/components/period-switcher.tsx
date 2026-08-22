import Link from 'next/link'

import { cn } from '@/lib/utils'

/**
 * `‹  Agosto 2026  ›` — the way Hilo moves through time.
 *
 * Ported from v1 (`legacy/index.html:2426-2433`). The shape matters more than it
 * looks like it should: the period is the *title* of everything under it, so it
 * sits centred above the content with an arrow on either side, and the arrows
 * are quiet squares rather than labelled buttons. v2 had turned this into a row
 * of three left-aligned pills reading "← Mes anterior / Este mes / Agosto 2026",
 * which puts the navigation first and the answer to "which month am I looking
 * at?" last.
 *
 * A missing `href` disables its arrow instead of hiding it. There is nothing to
 * collect in a month that has not happened yet, but an arrow that vanishes moves
 * everything beside it, and a control that jumps as you use it is worse than one
 * that greys out.
 */

const ARROW =
  'inline-flex size-[34px] items-center justify-center rounded-[10px] border border-border bg-card text-[20px] leading-none text-muted-foreground transition-colors'

export function PeriodSwitcher({
  prevHref,
  nextHref,
  label,
  caption,
  className,
}: {
  prevHref?: string
  nextHref?: string
  label: string
  /** Shown small and violet under the label — v1 used it for "Mes actual". */
  caption?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-center gap-4.5', className)}>
      <Arrow href={prevHref} label="Período anterior">
        ‹
      </Arrow>

      <div className="min-w-[150px] text-center">
        <div className="text-[15px] leading-tight font-extrabold">{label}</div>
        {caption ? (
          <div className="mt-0.5 text-[10px] font-bold tracking-[0.5px] text-violet uppercase">
            {caption}
          </div>
        ) : null}
      </div>

      <Arrow href={nextHref} label="Período siguiente">
        ›
      </Arrow>
    </div>
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
    <Link href={href} aria-label={label} className={cn(ARROW, 'hover:border-violet hover:text-violet')}>
      {children}
    </Link>
  )
}
