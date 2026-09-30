'use client'

import { RotateCw, TriangleAlert } from '@/components/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

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
  const router = useRouter()
  const [retrying, startRetry] = useTransition()

  // ─── Reintentar de verdad ──────────────────────────────────────────────
  //
  // `reset()` solo vuelve a dibujar lo que hay en el navegador. Cuando el error
  // vino del servidor —casi siempre, en esta app—, eso es dibujar otra vez la
  // misma respuesta rota: "Probar de nuevo" no hacía nada y sólo F5 lo
  // arreglaba. `router.refresh()` vuelve a pedirle la pantalla al servidor, y
  // adentro de la misma transición `reset()` la muestra cuando llega.
  const retry = () =>
    startRetry(() => {
      router.refresh()
      reset()
    })

  // ─── Una vez, solo ─────────────────────────────────────────────────────
  //
  // El caso que más se ve es PGRST303 justo después de entrar: PostgREST
  // rechaza un token recién emitido porque su reloj interno quedó atrás
  // (`src/server/postgrest-clock.ts`), y un momento después lo acepta. Para
  // eso no hace falta que nadie lea un cartel de error: se reintenta una vez,
  // sin preguntar, y el cartel aparece sólo si también falla el reintento.
  //
  // Una vez por pantalla y por medio minuto, anotado en `sessionStorage`, para
  // que un error de verdad no quede reintentando en círculo.
  //
  // Se decide en el navegador —el servidor no tiene `sessionStorage`— y
  // mientras tanto se muestra "Cargando…", que es lo que de verdad está
  // pasando. Si no corresponde reintentar, el cartel aparece enseguida.
  const [pending, setPending] = useState(true)
  // En una ref porque en desarrollo React corre los efectos dos veces: la
  // segunda leería el `sessionStorage` que anotó la primera y no reintentaría.
  const eligibility = useRef<boolean | null>(null)

  useEffect(() => {
    if (eligibility.current === null) eligibility.current = claimAutoRetry()
    const eligible = eligibility.current
    const timer = setTimeout(
      () => {
        setPending(false)
        if (eligible) retry()
      },
      eligible ? 1500 : 0,
    )
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A throw during server rendering is already in the server log by the time
  // this mounts. This covers the other half — the ones that happen in the
  // browser, where nothing else is watching.
  useEffect(() => {
    console.error(error)
  }, [error])

  if (pending || retrying) {
    return (
      <Card>
        <p className="px-6 py-10 text-center text-body text-muted-foreground" role="status">
          Cargando…
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <EmptyState
        icon={TriangleAlert}
        title="No pudimos cargar esta pantalla"
        text="Fue un problema nuestro, no algo que hayas hecho mal. Probá de nuevo: casi siempre alcanza."
        action={
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" onClick={retry}>
                <RotateCw className="size-4" />
                Probar de nuevo
              </Button>
              <Button asChild variant="outline">
                <Link href="/inicio">Ir al inicio</Link>
              </Button>
            </div>

            {error.digest ? (
              <p className="text-micro text-muted-foreground">
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

const AUTO_RETRY_KEY = 'ombua:error-auto-retry'
const AUTO_RETRY_WINDOW_MS = 30_000

/**
 * Si esta pantalla todavía puede reintentarse sola, y lo anota. Cualquier
 * problema con `sessionStorage` (modo privado, bloqueado) es un "no": se
 * muestra el cartel como antes.
 */
function claimAutoRetry(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const path = window.location.pathname
    const last = JSON.parse(window.sessionStorage.getItem(AUTO_RETRY_KEY) ?? 'null') as {
      path: string
      at: number
    } | null
    if (last && last.path === path && Date.now() - last.at < AUTO_RETRY_WINDOW_MS) return false
    window.sessionStorage.setItem(AUTO_RETRY_KEY, JSON.stringify({ path, at: Date.now() }))
    return true
  } catch {
    return false
  }
}
