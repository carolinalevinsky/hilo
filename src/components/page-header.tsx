import type { ReactNode } from 'react'

/**
 * The title block at the top of every screen: heading, one line of context, and
 * whatever the primary action is.
 *
 * The subtitle is not filler. v1 put one on every screen ("Todos tus pacientes
 * en un solo lugar", "Tu semana de sesiones") and they are what make the product
 * feel like it is talking to you rather than labelling itself.
 */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:mb-6 lg:gap-4">
      <div className="min-w-0">
        <h1 className="text-[22px] font-extrabold tracking-[-0.6px] lg:text-[25px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-[12.5px] text-muted-foreground lg:text-[13.5px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex max-lg:w-full [&>*]:max-lg:w-full">{action}</div> : null}
    </div>
  )
}
