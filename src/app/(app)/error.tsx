'use client'

import { ErrorScreen } from '@/components/error-screen'

/**
 * The signed-in shell gets its own boundary, and that is the whole reason this
 * file exists.
 *
 * Without it the root boundary catches the throw and replaces the entire
 * document, sidebar and bottom bar included. A practitioner mid-session would be
 * left on a dead page with nothing to click but the back button. Caught here,
 * the failure stays inside `<main>`: the nav is still on screen and the rest of
 * their work is one tap away, which is the difference between a screen that
 * failed and an app that fell over.
 *
 * The layout is unchanged, so this sits where the page's content would have.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-md pt-6 lg:pt-12">
      <ErrorScreen error={error} reset={reset} />
    </div>
  )
}
