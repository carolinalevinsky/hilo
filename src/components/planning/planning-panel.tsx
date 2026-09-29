import type { LucideIcon } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * The shape every panel of the planner shares: a tinted icon, what the panel
 * is, one line about how to use it, and whatever belongs on the right of that.
 *
 * Three cards on this screen used to each draw their own heading, which is how
 * "Sugerencias de Ombúa" ended up looking like a different kind of thing from
 * "Buscar material" when they are the same kind of thing — two places to take
 * something from.
 */

type PanelTone = 'violet' | 'blue' | 'teal'

const TONE_CLASSES: Record<PanelTone, string> = {
  violet: 'bg-violet-soft text-violet',
  blue: 'bg-blue-soft text-blue',
  teal: 'bg-teal-soft text-teal',
}

export function PlanningPanel({
  icon: Icon,
  tone = 'violet',
  title,
  hint,
  aside,
  children,
}: {
  icon: LucideIcon
  tone?: PanelTone
  title: string
  hint?: string
  /** The one control that belongs beside the title — a count, a link out. */
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-[10px]',
                TONE_CLASSES[tone],
              )}
            >
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <h3 className="text-item font-extrabold">{title}</h3>
              {hint ? <p className="mt-0.5 text-meta text-muted-foreground">{hint}</p> : null}
            </div>
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
