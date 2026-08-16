'use client'

import { ErrorScreen } from '@/components/error-screen'

/**
 * The boundary for everything outside the signed-in shell: the landing page,
 * sign-in, the legal pages and the public booking form a family opens.
 *
 * It also catches a throw inside `(app)/layout.tsx` itself — `requireUser()`
 * failing, say — because a boundary cannot catch the layout it lives under.
 * Which is right: there is no shell left to keep when the shell is what broke.
 *
 * So this one carries no nav and centres on its own.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ErrorScreen error={error} reset={reset} />
      </div>
    </div>
  )
}
