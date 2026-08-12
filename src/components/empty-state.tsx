import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * The "there is nothing here yet" block. Ported from `legacy/index.html:973`.
 *
 * Every list in Hilo mounts one. An empty screen with no explanation reads as
 * broken; an empty screen that says what goes here and offers the button reads
 * as the beginning of something.
 */
export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="px-5 py-9 text-center">
      <div className="mx-auto mb-3.5 flex size-16 items-center justify-center rounded-[18px] bg-violet-soft text-violet">
        <Icon className="size-7" />
      </div>
      <p className="mb-1.5 text-[16.5px] font-extrabold">{title}</p>
      <p className="mx-auto mb-4 max-w-[360px] text-[13px] leading-relaxed text-muted-foreground">
        {text}
      </p>
      {action}
    </div>
  )
}
