'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

/**
 * The two halves of Planificación.
 *
 * In v1 these were tabs inside one screen (`legacy/index.html:611`) — the
 * library of materials and the session you are preparing, side by side, because
 * you move between them constantly: you look at what is coming, you go find
 * something to do in it. Splitting them into two sidebar destinations is what
 * made materials feel like a filing cabinet nobody opens.
 *
 * They are two routes rather than one screen with client-side tabs, and that is
 * deliberate: each half loads its own data on the server, a material keeps a URL
 * that can be linked to from a session, and the browser's back button does what
 * it should. The tab *look* is v1's; the mechanism underneath is not.
 */

const TABS = [
  { href: '/materiales', label: 'Materiales' },
  { href: '/planificacion', label: 'Planificar sesión' },
]

export function PlanningTabs() {
  const pathname = usePathname()

  return (
    <div role="tablist" className="mb-4 flex gap-2.5">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              'rounded-full border px-4 py-2.5 text-[13.5px] font-bold transition-colors',
              active
                ? 'border-violet bg-violet-soft text-violet'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
