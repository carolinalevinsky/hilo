'use client'

import { ChevronRight, Menu, User, X } from '@/components/icons'
import Link, { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import {
  isNavItemActive,
  mobileBarItemsFor,
  mobileSheetItemsFor,
  type NavItem,
} from '@/components/app-shell/nav-items'
import { cn } from '@/lib/utils'

/**
 * The bottom bar, for phones. Four destinations, the assistant, and "Más".
 *
 * `env(safe-area-inset-bottom)` in the padding is what keeps the last row of
 * buttons above the iPhone home indicator. v1 got this right
 * (`legacy/index.html:65`) and it is easy to lose.
 *
 * ─── Why the assistant is not in here ─────────────────────────────────────
 *
 * It used to be: a violet circle between Pagos and Más, because a button
 * floating over the page always lands on something (the Comentarios field of
 * "Registrar sesión", a goal's slider). But a filled circle among five outline
 * icons is the loudest thing on the screen, and it pushed the five labels so
 * close together that the bar read as one grey sentence. It lives in the top
 * bar now, beside the account — see `mobile-top-bar.tsx` — and this bar is
 * five equal places, which is what a tab bar is.
 *
 * ─── The look ─────────────────────────────────────────────────────────────
 *
 * The iOS tab bar's, because that is what the thumb already knows: a 24px icon,
 * a small medium-weight word under it, and nothing else. The place you are in
 * is violet with a soft pill behind the icon; the rest are one quiet grey.
 */
/** "Mi perfil" al final de la hoja. Una persona, no las tres rayitas: ésas ya
 *  son "Más", el botón que la abrió. */
const PROFILE_ITEM: NavItem = { href: '/perfil', label: 'Mi perfil', icon: User }

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const barItems = mobileBarItemsFor(isAdmin)
  const sheetItems = mobileSheetItemsFor(isAdmin)
  // La hoja recuerda en qué pantalla se abrió, y sólo está abierta ahí. La
  // barra vive en el layout y no se desmonta al navegar, así que con un
  // booleano la hoja seguía abierta encima de la pantalla nueva cuando se
  // llegaba por otro lado (el "atrás", un link de la página).
  const [openOn, setOpenOn] = useState<string | null>(null)
  const sheetOpen = openOn === pathname
  const setSheetOpen = (open: boolean) => setOpenOn(open ? pathname : null)

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

      <nav className="fixed inset-x-0 bottom-0 z-70 grid auto-cols-fr grid-flow-col border-t border-border/80 bg-card/94 px-1 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        {barItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isNavItemActive(item, pathname) ? 'page' : undefined}
            className="flex min-w-0"
          >
            <BarItem item={item} active={isNavItemActive(item, pathname)} />
          </Link>
        ))}

        {sheetItems.length > 0 ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className="flex min-w-0"
          >
            <BarLook icon={Menu} label="Más" active={sheetHasActive} />
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
  return <BarLook icon={item.icon} label={item.label} active={active || pending} />
}

function BarLook({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  active: boolean
}) {
  return (
    <span
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1 text-[10.5px] leading-tight tracking-[-0.1px] transition-colors',
        active ? 'font-semibold text-violet' : 'font-medium text-[#7c8194]',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-14 items-center justify-center rounded-full transition-colors',
          active && 'bg-violet-soft',
        )}
      >
        <Icon className="size-[22px] shrink-0" strokeWidth={active ? 2.1 : 1.8} />
      </span>
      {/* `truncate`: a 320 px phone leaves 62 px per place and "Pacientes" at
          this size wants 50. It fits; this is for a larger system font. */}
      <span className="max-w-full truncate px-0.5">{label}</span>
    </span>
  )
}
