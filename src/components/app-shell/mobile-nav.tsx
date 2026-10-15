'use client'

import { ChevronRight, Menu, MessageCircle, User, X } from '@/components/icons'
import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import {
  isNavItemActive,
  mobileBarItemsFor,
  mobileSheetItemsFor,
  type NavItem,
} from '@/components/app-shell/nav-items'
import { useAsk } from '@/components/assistant/ask-dock'
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
 * progress slider on the ficha. See `ask-dock.tsx`.
 *
 * It is an action and the other five are destinations, and it is drawn as one:
 * a violet circle with no label, between Cobros and Más. That is not only
 * semantics — measured, six labelled items do not fit. At 375 px the six labels
 * add up to 367 of the 367 available and touch each other; at 320 px they add up
 * to 344 and "Más" runs off the right edge. Without a label it costs 44 px and
 * the five words keep their room.
 */
/** "Mi perfil" al final de la hoja. Una persona, no las tres rayitas: ésas ya
 *  son "Más", el botón que la abrió. */
const PROFILE_ITEM: NavItem = { href: '/perfil', label: 'Mi perfil', icon: User }

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const barItems = mobileBarItemsFor(isAdmin)
  const sheetItems = mobileSheetItemsFor(isAdmin)
  const askHilo = useAsk()
  const [sheetOpen, setSheetOpen] = useState(false)

  const sheetHasActive = sheetItems.some((item) => isNavItemActive(item, pathname))

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
            <div aria-hidden className="mx-auto -mt-1.5 mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="mb-2 flex items-center justify-between">
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
            {/* Una lista y no una grilla de baldosas: tres por fila partían
                "Informes y evaluaciones" en dos renglones y cada baldosa medía
                lo mismo que un botón de la barra, sin decir qué había adentro.
                Renglón con ícono y flecha es lo que un teléfono lee como "ir a". */}
            <ul className="-mx-2 flex flex-col">
              {[...sheetItems, PROFILE_ITEM].map((item) => {
                const active = isNavItemActive(item, pathname)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-2 py-2.5 text-item font-semibold',
                        active ? 'bg-violet-soft text-violet' : 'text-foreground active:bg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-[11px]',
                          active ? 'bg-white/70' : 'bg-muted',
                        )}
                      >
                        <item.icon className="size-[18px]" />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-70 flex justify-around border-t border-border bg-card/96 px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] shadow-[0_-4px_22px_rgba(30,36,54,0.07)] backdrop-blur-md lg:hidden">
        {barItems.map((item) => (
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
          aria-label="Preguntá a Ombúa"
          title="Preguntá a Ombúa"
          className="mx-1 flex size-11 shrink-0 items-center justify-center self-center rounded-full bg-violet text-white shadow-violet hover:brightness-107"
        >
          <MessageCircle className="size-5" />
        </button>

        {sheetItems.length > 0 ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex min-w-0 flex-auto flex-col items-center gap-[3px] rounded-xl px-0.5 py-1 text-micro font-semibold',
              sheetHasActive ? 'text-violet' : 'text-[#6b7186]',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-12 items-center justify-center rounded-full',
                sheetHasActive && 'bg-violet-soft',
              )}
            >
              <Menu className="size-5" />
            </span>
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
        'flex min-w-0 flex-auto flex-col items-center gap-[3px] rounded-xl px-0.5 py-1 text-micro font-semibold',
        active || pending ? 'text-violet' : 'text-[#6b7186]',
      )}
    >
      {/* La píldora detrás del ícono es la marca de "estás acá". El color
          solo, violeta contra gris, se perdía a pleno sol. */}
      <span
        className={cn(
          'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
          (active || pending) && 'bg-violet-soft',
        )}
      >
        <item.icon className="size-5 shrink-0" />
      </span>
      {/* `truncate`: a 320 px phone leaves ~52 px per item and "Pacientes" wants
          80. Recortado se lee peor; desbordado se le encima al de al lado. */}
      <span className="max-w-full truncate">{item.label}</span>
    </span>
  )
}
