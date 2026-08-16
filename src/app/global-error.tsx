'use client'

import { useEffect } from 'react'

/**
 * The last boundary. It only runs when the root layout itself threw, so by the
 * time it renders there is no root layout — this file supplies its own `<html>`
 * and `<body>`, and Next.js discards everything the layout brought with it.
 *
 * ─── Why this duplicates instead of sharing ────────────────────────────────
 *
 * `globals.css`, the Inter font and every component in `src/components/` are all
 * loaded by the root layout. Reaching for them here would mean the crash screen
 * depends on the thing that just crashed, and the plausible failure — a bad font
 * fetch, a broken stylesheet import, a throw in the layout's own module graph —
 * is exactly the one that would then take the crash screen down too and hand the
 * practitioner a blank page.
 *
 * So the violet, the background and the spacing below are written out as literal
 * values rather than as tokens, with no Tailwind class and no import. The
 * duplication is the feature: this file has to render when nothing else can,
 * which means it can afford to depend on nothing. If the palette in
 * `globals.css` ever changes, this being slightly out of date costs nothing.
 *
 * `reset()` is wired anyway — it re-mounts the whole tree, which is worth one
 * try — but a root layout that threw once usually throws again, so the honest
 * offer is the plain link out and it goes first.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // The console is the only place the real error is allowed to go.
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es-UY">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f5f6fb',
          color: '#1e2436',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <main
          style={{
            width: '100%',
            maxWidth: '420px',
            background: '#ffffff',
            borderRadius: '18px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 2px rgba(30,36,54,0.04), 0 5px 16px rgba(30,36,54,0.045)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 14px',
              borderRadius: '18px',
              background: '#efeaff',
            }}
          />

          <h1 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 800 }}>
            Hilo no pudo abrir
          </h1>

          <p
            style={{
              margin: '0 auto 20px',
              maxWidth: '340px',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#7a839a',
            }}
          >
            Fue un problema nuestro, no algo que hayas hecho mal. Probá de nuevo, y si
            sigue igual, volvé en un rato: tus datos están donde los dejaste.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: '12px',
                padding: '10px 16px',
                background: '#6c5ce7',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Probar de nuevo
            </button>
            <a
              href="/inicio"
              style={{
                borderRadius: '12px',
                border: '1px solid #eceef5',
                padding: '10px 16px',
                background: '#ffffff',
                color: '#1e2436',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Ir al inicio
            </a>
          </div>

          {/* Only the digest — a content-free hash Next.js computes on the
              server. `message` and `stack` can carry a patient's name. */}
          {error.digest ? (
            <p style={{ margin: '16px 0 0', fontSize: '11.5px', color: '#7a839a' }}>
              Si vuelve a pasar, pasanos este código:{' '}
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                {error.digest}
              </span>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
