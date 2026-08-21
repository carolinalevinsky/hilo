import { MobileNav } from '@/components/app-shell/mobile-nav'
import { Sidebar } from '@/components/app-shell/sidebar'
import { AskHiloFab } from '@/components/assistant/ask-hilo-fab'
import { InstallPrompt } from '@/components/install-prompt'
import { Toaster } from '@/components/ui/sonner'
import { disciplineLabel } from '@/lib/disciplines'
import { redirect } from 'next/navigation'

import { findPractitioner } from '@/server/practitioners'

import { currentUser } from './session'

/**
 * The shell every signed-in screen renders inside.
 *
 * `requireUser()` runs here as well as in the proxy. That is not redundancy for
 * its own sake: the proxy is a convenience layer that can be bypassed by any
 * request that does not match its matcher, and this is the boundary that
 * actually decides whether a page renders. RLS in Postgres is the third and
 * final one.
 *
 * ─── Why the profile is looked up with `findPractitioner` ──────────────────
 *
 * It used to be `getPractitioner`, which throws when the row is missing. A
 * throw from a layout is not a broken page — it is a **broken application**:
 * the error screen renders on every route, and both of its buttons ("Probá de
 * nuevo", "Ir al inicio") lead straight back into this layout, so they fail
 * too. There is no way out and nothing on screen explains why.
 *
 * That state is reachable. The sign-up trigger fires `after insert on
 * auth.users`, so any account that existed before the trigger was installed has
 * no profile — every account carried over from v1, for one, which is exactly
 * how it was found: signing in to the first real deployment.
 */
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const user = await currentUser()
  const practitioner = await findPractitioner(user.id)

  if (!practitioner) redirect('/completar-perfil')

  return (
    <div className="grid min-h-dvh lg:grid-cols-[236px_minmax(0,1fr)]">
      <Sidebar
        fullName={practitioner.full_name}
        disciplineLabel={disciplineLabel(practitioner.discipline)}
      />

      <main className="min-w-0 px-3.5 pt-4.5 pb-[calc(80px+env(safe-area-inset-bottom))] lg:px-8.5 lg:pt-11 lg:pb-16">
        {/* Signed-in screens only. Offering to install the app to someone who
            has not signed in yet is asking for a commitment before the value. */}
        <InstallPrompt />
        {children}
      </main>

      <AskHiloFab />
      <MobileNav />
      <Toaster position="top-center" />
    </div>
  )
}
