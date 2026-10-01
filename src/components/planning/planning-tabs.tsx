'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

/**
 * The three parts of Planificación.
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

/**
 * The order is the work, not the catalogue: you plan the next session, you check
 * what is already prepared, and Materiales sits last as the shelf you reach for
 * when you need something to fill a plan with.
 *
 * `exact` matters for `/planificacion`: without it the tab stays lit on
 * `/planificacion/proximas`, and two tabs highlighted at once means neither of
 * them tells you where you are. `/materiales` keeps the prefix match on purpose,
 * because a material's own page is still the library.
 */
const TABS = [
  { href: '/planificacion', label: 'Planificar sesión', exact: true },
  // "Planes", not "Próximas sesiones" (P13): the upcoming sessions are the ones
  // in the Agenda. What this tab lists is what was prepared for them.
  { href: '/planificacion/proximas', label: 'Planes preparados', exact: false },
  { href: '/materiales', label: 'Materiales', exact: false },
]

export function PlanningTabs() {
  const pathname = usePathname()

  return (
    // One control with three positions, not three loose pills. v1 drew these as
    // a `.seg` of separate bordered buttons (`legacy/index.html:609`); the track
    // around them is the one addition, and it is what says the three are views of
    // the same place rather than three destinations that happen to sit in a row.
    // The selected one keeps v1's violet.
    //
    // On a phone the three labels do not fit in one row, and `flex-wrap` used to
    // drop "Materiales" alone onto a second line inside a pill-shaped track —
    // it read as a broken control. Below `sm` it is three equal columns, the
    // full width, and a long label breaks inside its own tab instead.
    <div
      role="tablist"
      className="no-print mb-4 grid grid-cols-3 gap-1 rounded-[22px] border border-border bg-muted p-1 sm:inline-flex sm:max-w-full sm:rounded-full"
    >
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              'flex items-center justify-center rounded-[18px] px-2 py-2 text-center text-meta leading-tight font-bold transition-colors sm:rounded-full sm:px-4 sm:text-body',
              active
                ? 'bg-card text-violet shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
