'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NAV_ITEMS, isNavItemActive } from '@/components/app-shell/nav-items'
import { cn } from '@/lib/utils'

/**
 * The desktop sidebar. Violet gradient, white pill on the active item —
 * v1's, ported from `legacy/index.html:41`.
 *
 * Hidden below 900px, where the bottom bar takes over.
 */
export function Sidebar({
  fullName,
  disciplineLabel,
}: {
  fullName: string
  disciplineLabel: string
}) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-1.5 bg-[linear-gradient(180deg,#5a4bd4,#6c5ce7_60%,#7d6ef0)] px-4 py-5.5 text-[#e9e6ff] lg:flex">
      <Link
        href="/inicio"
        className="mb-6 flex items-center gap-2.5 text-[22px] font-extrabold tracking-[-0.4px] text-white"
      >
        <span className="size-[18px] rounded-[6px] bg-white/90" />
        Hilo
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold transition-colors',
                active
                  ? 'bg-white text-violet shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
                  : 'text-[#e2ddff] hover:bg-white/12',
              )}
            >
              <item.icon className="size-[19px]" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <Link
        href="/perfil"
        aria-label="Editar mi perfil"
        className="rounded-[14px] bg-white/12 px-3.5 py-3 text-[12.5px] leading-relaxed hover:bg-white/18"
      >
        <b className="block text-white">{fullName}</b>
        <span className="opacity-85">{disciplineLabel}</span>
        {' · '}
        <span className="underline">editar perfil</span>
      </Link>
    </aside>
  )
}
