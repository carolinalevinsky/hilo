'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

/**
 * "Crear cuenta | Entrar", above the form — v1's `.seg`
 * (`legacy/index.html:512`).
 *
 * v2 had moved this to a sentence under the button ("¿Ya tenés cuenta? Entrá
 * acá"). Both options being visible at once is the better shape for this
 * particular screen: somebody arriving from a link a colleague sent them does
 * not yet know which of the two they are, and the answer should not be at the
 * bottom in smaller type.
 */

const TABS = [
  { href: '/crear-cuenta', label: 'Crear cuenta' },
  { href: '/entrar', label: 'Entrar' },
]

export function AuthTabs() {
  const pathname = usePathname()

  return (
    <div role="tablist" className="mb-5 grid grid-cols-2 gap-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-center text-[13.5px] font-bold transition-colors',
              active
                ? 'border-violet bg-violet-soft text-violet'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
