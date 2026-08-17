'use client'

import { Menu, X } from '@/components/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import {
  MOBILE_BAR_ITEMS,
  MOBILE_SHEET_ITEMS,
  isNavItemActive,
} from '@/components/app-shell/nav-items'
import { cn } from '@/lib/utils'

/**
 * The bottom bar, for phones. Four destinations plus "Más".
 *
 * `env(safe-area-inset-bottom)` in the padding is what keeps the last row of
 * buttons above the iPhone home indicator. v1 got this right
 * (`legacy/index.html:65`) and it is easy to lose.
 */
export function MobileNav() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const sheetHasActive = MOBILE_SHEET_ITEMS.some((item) => isNavItemActive(item, pathname))

  return (
    <>
      {sheetOpen ? (
        <div
          className="fixed inset-0 z-80 bg-black/35 lg:hidden"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-5 pb-[calc(20px+env(safe-area-inset-bottom))]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Más</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Cerrar"
                className="text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_SHEET_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-2xl border border-border px-2 py-3.5 text-center text-[11.5px] font-semibold',
                    isNavItemActive(item, pathname) && 'border-violet bg-violet-soft text-violet',
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/perfil"
                onClick={() => setSheetOpen(false)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border border-border px-2 py-3.5 text-center text-[11.5px] font-semibold',
                  isActive('/perfil') && 'border-violet bg-violet-soft text-violet',
                )}
              >
                <Menu className="size-5" />
                Mi perfil
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-70 flex justify-around border-t border-border bg-card/96 px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] shadow-[0_-4px_22px_rgba(30,36,54,0.07)] backdrop-blur-md lg:hidden">
        {MOBILE_BAR_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-[3px] rounded-xl px-0.5 py-1.5 text-[10.5px] font-semibold',
              isNavItemActive(item, pathname) ? 'text-violet' : 'text-[#8b90a3]',
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}

        {MOBILE_SHEET_ITEMS.length > 0 ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center gap-[3px] rounded-xl px-0.5 py-1.5 text-[10.5px] font-semibold',
              sheetHasActive ? 'text-violet' : 'text-[#8b90a3]',
            )}
          >
            <Menu className="size-5" />
            Más
          </button>
        ) : null}
      </nav>
    </>
  )
}
