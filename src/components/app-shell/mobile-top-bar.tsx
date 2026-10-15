import Link from 'next/link'

import { Wordmark } from '@/components/brand/wordmark'
import { initials } from '@/components/patients/patient-avatar'

/**
 * The strip across the top of a phone: the brand on the left, you on the right.
 *
 * Without it a phone screen started straight on a 22px heading with nothing
 * above it — no sign of which app this is, and "Mi perfil" only reachable by
 * opening "Más" and hunting for it. Every app on the same phone puts the account
 * in the top-right corner, so that is where a thumb looks for it.
 *
 * Sticky and translucent so it stays put while the page scrolls under it, the
 * same treatment as the bottom bar. Hidden from `lg` up, where the sidebar has
 * both things already, and from print.
 */
export function MobileTopBar({ fullName }: { fullName: string }) {
  return (
    <header className="sticky top-0 z-60 flex h-13 items-center justify-between border-b border-border/70 bg-background/90 px-3.5 pt-[env(safe-area-inset-top)] backdrop-blur-md box-content print:hidden lg:hidden">
      <Link href="/inicio" aria-label="Ir al inicio" className="flex items-center">
        <Wordmark height={20} />
      </Link>

      <Link
        href="/perfil"
        aria-label="Mi perfil"
        className="flex size-9 items-center justify-center rounded-full bg-violet-soft text-meta font-bold text-violet ring-1 ring-violet/15"
      >
        {initials(fullName)}
      </Link>
    </header>
  )
}
