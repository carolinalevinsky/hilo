'use client'

import { Menu, MessageCircle, X } from '@/components/icons'
import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import {
  MOBILE_BAR_ITEMS,
  MOBILE_SHEET_ITEMS,
  isNavItemActive,
  type NavItem,
} from '@/components/app-shell/nav-items'
import { useAskHilo } from '@/components/assistant/ask-hilo-dock'
import { cn } from '@/lib/utils'

/**
 * The bottom bar, for phones. Four destinations, the assistant, and "Más".
 *
 * `env(safe-area-inset-bottom)` in the padding is what keeps the last row of
 * buttons above the iPhone home indicator. v1 got this right
 * (`legacy/index.html:65`) and it is easy to lose.
 *
 * ─── Why the assistant is in here ─────────────────────────────────────────
 *
 * Because the alternative is a button floating over the page, and on a phone
 * the bottom-right corner of the page is never empty: it was measured sitting
 * on top of the Comentarios field of "Registrar sesión" and on top of a goal's
 * progress slider on the ficha. See `ask-hilo-dock.tsx`.
 *
 * It is an action and the other five are destinations, and it is drawn as one:
 * a violet circle with no label, between Cobros and Más. That is not only
 * semantics — measured, six labelled items do not fit. At 375 px the six labels
 * add up to 367 of the 367 available and touch each other; at 320 px they add up
 * to 344 and "Más" runs off the right edge. Without a label it costs 44 px and
 * the five words keep their room.
 */
export function MobileNav() {
  const pathname = usePathname()
  const askHilo = useAskHilo()
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
                    'flex flex-col items-center gap-1.5 rounded-2xl border border-border px-2 py-3.5 text-center text-micro font-semibold',
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
                  'flex flex-col items-center gap-1.5 rounded-2xl border border-border px-2 py-3.5 text-center text-micro font-semibold',
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
          <Link key={item.href} href={item.href} className="flex min-w-0 flex-auto">
            <BarItem item={item} active={isNavItemActive(item, pathname)} />
          </Link>
        ))}

        {/* Sin etiqueta y en violeta: es lo único de la barra que no lleva a
            otra pantalla, y es lo único que no entra si además lleva palabra.
            El color es el del `.fab` de v1 — quien lo usaba lo reconoce. */}
        <button
          type="button"
          onClick={askHilo}
          aria-haspopup="dialog"
          aria-label="Preguntá a Hilo"
          title="Preguntá a Hilo"
          className="mx-1 flex size-11 shrink-0 items-center justify-center self-center rounded-full bg-violet text-white shadow-[0_4px_12px_rgb(108_92_231_/_35%)] hover:brightness-107"
        >
          <MessageCircle className="size-5" />
        </button>

        {MOBILE_SHEET_ITEMS.length > 0 ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex min-w-0 flex-auto flex-col items-center gap-[3px] rounded-xl px-0.5 py-1.5 text-micro font-semibold',
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

/**
 * Un botón de la barra, que se pinta apenas lo tocás.
 *
 * Igual que en el menú de escritorio: `useLinkStatus` sólo se lee adentro del
 * `<Link>`, así que el estilo bajó un nivel. En el celular importa más todavía,
 * porque no hay estado de hover que confirme que el dedo dio en el lugar.
 */
function BarItem({ item, active }: { item: NavItem; active: boolean }) {
  const { pending } = useLinkStatus()

  return (
    <span
      className={cn(
        'flex min-w-0 flex-auto flex-col items-center gap-[3px] rounded-xl px-0.5 py-1.5 text-micro font-semibold',
        active || pending ? 'text-violet' : 'text-[#8b90a3]',
      )}
    >
      <item.icon className="size-5 shrink-0" />
      {/* `truncate`: a 320 px phone leaves ~52 px per item and "Pacientes" wants
          80. Recortado se lee peor; desbordado se le encima al de al lado. */}
      <span className="max-w-full truncate">{item.label}</span>
    </span>
  )
}
