import { MobileNav } from '@/components/app-shell/mobile-nav'
import { Sidebar } from '@/components/app-shell/sidebar'
import { AskHiloFab } from '@/components/assistant/ask-hilo-fab'
import { InstallPrompt } from '@/components/install-prompt'
import { Toaster } from '@/components/ui/sonner'
import { disciplineLabel } from '@/lib/disciplines'
import { requireUser } from '@/server/auth'
import { getPractitioner } from '@/server/practitioners'

/**
 * The shell every signed-in screen renders inside.
 *
 * `requireUser()` runs here as well as in the proxy. That is not redundancy for
 * its own sake: the proxy is a convenience layer that can be bypassed by any
 * request that does not match its matcher, and this is the boundary that
 * actually decides whether a page renders. RLS in Postgres is the third and
 * final one.
 */
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

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
