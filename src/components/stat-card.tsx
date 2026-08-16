import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * The number card, ported from v1's `.kpi` (`legacy/index.html:118-124`).
 *
 * Every screen in Hilo that shows a total shows it in this shape: a white card,
 * the icon in a tinted rounded square, the number large and tight, the label
 * quiet underneath. It reads in that order — symbol, quantity, meaning — which
 * is why the label goes below and not above. v2 had grown two different
 * versions of this card and Inicio had none at all, and a product where the
 * same fact looks different on two screens feels unfinished even when every
 * number is right.
 *
 * The measurements are v1's and are not approximations: 44px icon at 13px
 * radius, 27px number at -0.6px tracking, 12.5px label. They shrink on a phone
 * exactly where v1 shrank them (`legacy/index.html:384-386`).
 */

export type StatTone = 'violet' | 'teal' | 'coral' | 'amber' | 'green' | 'blue'

const TONE_CLASSES: Record<StatTone, string> = {
  violet: 'bg-violet-soft text-violet',
  teal: 'bg-teal-soft text-teal',
  coral: 'bg-coral-soft text-coral',
  amber: 'bg-amber-soft text-amber',
  green: 'bg-green-soft text-green',
  blue: 'bg-blue-soft text-blue',
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
        'mb-4.5 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:mb-6',
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
    <div className="overflow-hidden rounded-lg bg-card p-3.5 shadow-card sm:p-4.5">
      <div
        className={cn(
          'mb-2 flex size-[38px] items-center justify-center rounded-[13px] sm:mb-3 sm:size-11',
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-[18px] sm:size-[23px]" />
      </div>
      <div className="text-[22px] font-extrabold tracking-[-0.6px] sm:text-[27px]">
        {value}
      </div>
      <div className="mt-0.5 text-[12.5px] text-muted-foreground">{label}</div>
      {hint ? (
        <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">{hint}</div>
      ) : null}
    </div>
  )
}
