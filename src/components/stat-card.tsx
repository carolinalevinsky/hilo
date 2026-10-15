import type { LucideIcon } from '@/components/icons'

import { cn } from '@/lib/utils'

/**
 * The number card, ported from v1's `.kpi` (`legacy/index.html:118-124`).
 *
 * Every screen in Ombúa that shows a total shows it in this shape: a white card,
 * the icon in a tinted rounded square, the number large and tight, the label
 * quiet underneath. It reads in that order — symbol, quantity, meaning — which
 * is why the label goes below and not above. v2 had grown two different
 * versions of this card and Inicio had none at all, and a product where the
 * same fact looks different on two screens feels unfinished even when every
 * number is right.
 *
 * The measurements are v1's and are not approximations: 44px icon at 13px
 * radius, 27px number at -0.6px tracking, 12.5px label — from `sm` up. On a
 * phone the row becomes one card with the numbers side by side; see
 * `StatCardGrid`.
 */

export type StatTone = 'violet' | 'teal' | 'coral' | 'amber' | 'green' | 'blue'

const TONE_CLASSES: Record<StatTone, string> = {
  violet: 'bg-violet-soft text-violet',
  teal: 'bg-teal-soft text-teal-ink',
  coral: 'bg-coral-soft text-coral-ink',
  amber: 'bg-amber-soft text-amber-ink',
  green: 'bg-green-soft text-green-ink',
  blue: 'bg-blue-soft text-blue-ink',
}

export function StatCardGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        // En teléfono, una sola tarjeta con los números lado a lado, separados
        // por una línea, sin los cuadrados de color. Como tarjetas sueltas, tres
        // números se llevaban dos filas y la tercera quedaba sola y estirada;
        // los íconos repetían lo que ya dice la palabra de abajo.
        'mb-4 grid grid-flow-col auto-cols-fr divide-x divide-border overflow-hidden rounded-lg bg-card shadow-card sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:gap-4 sm:divide-x-0 sm:overflow-visible sm:bg-transparent sm:shadow-none lg:mb-6 lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatCard({
  icon: Icon,
  value,
  label,
  tone = 'violet',
  hint,
}: {
  icon: LucideIcon
  value: React.ReactNode
  label: string
  tone?: StatTone
  /**
   * A third line, quieter than the label — a comparison, or what to do to make
   * the number exist. v1's card had no room for one; it also had no number that
   * needed explaining. "12" means something different when it is four more than
   * last month, and hiding that costs the card its point.
   */
  hint?: string
}) {
  return (
    <div className="min-w-0 px-2 py-3 text-center sm:overflow-hidden sm:rounded-lg sm:bg-card sm:p-4.5 sm:text-left sm:shadow-card">
      <div
        className={cn(
          'mb-3 hidden size-11 items-center justify-center rounded-[13px] sm:flex',
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-[23px]" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[18px] leading-tight font-extrabold tracking-[-0.5px] sm:text-[27px] sm:tracking-[-0.6px]">
          {value}
        </div>
        <div className="text-meta leading-snug text-muted-foreground sm:mt-0.5">
          {label}
        </div>
        {hint ? (
          <div className="mt-0.5 text-micro text-muted-foreground/80">{hint}</div>
        ) : null}
      </div>
    </div>
  )
}
