'use client'

import { RotateCw, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * The screen both error boundaries render — the root one and the one inside the
 * signed-in shell. Two boundaries, one set of words, so they cannot drift apart.
 *
 * ─── Nothing from `error` is rendered except `digest` ───────────────────────
 *
 * A thrown Postgres error carries the failing statement and often the failing
 * row with it, which in this product means a patient's name on screen — and on
 * whatever the browser or the practitioner does with the page next. `message`
 * and `stack` therefore never leave the console.
 *
 * `digest` is the exception, and it is worth the extra line. Next.js hashes
 * every server error into it and deliberately puts no content in it, so it is
 * the only thing a practitioner can quote that means anything: without it the
 * bug report we receive is "no me anduvo", with it we can find the throw in the
 * server log. It is shown small, grey, and framed as something to send us, so it
 * reads as a reference number rather than as debris.
 *
 * ─── Violet, not red ───────────────────────────────────────────────────────
 *
 * The person reading this has a patient in the room. An alarm colour makes a
 * screen that failed to load look like a record that was lost.
 */
export function ErrorScreen({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // A throw during server rendering is already in the server log by the time
  // this mounts. This covers the other half — the ones that happen in the
  // browser, where nothing else is watching.
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Card>
      <EmptyState
        icon={TriangleAlert}
        title="No pudimos cargar esta pantalla"
        text="Fue un problema nuestro, no algo que hayas hecho mal. Probá de nuevo: casi siempre alcanza."
        action={
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" onClick={reset}>
                <RotateCw className="size-4" />
                Probar de nuevo
              </Button>
              <Button asChild variant="outline">
                <Link href="/inicio">Ir al inicio</Link>
              </Button>
            </div>

            {error.digest ? (
              <p className="text-[11.5px] text-muted-foreground">
                Si vuelve a pasar, pasanos este código:{' '}
                <span className="font-mono">{error.digest}</span>
              </p>
            ) : null}
          </div>
        }
      />
    </Card>
  )
}
