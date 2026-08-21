'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import { TOUR_STOPS } from '@/components/onboarding/tour-stops'
import { Button } from '@/components/ui/button'

/**
 * "Acá tenés esto, acá tal otra cosa." A short guided tour of the six screens.
 *
 * ─── The two things that make a tour tolerable ─────────────────────────────
 *
 * **It points at the real thing.** A carousel of screenshots teaches nothing,
 * because the reader still has to find the screen afterwards. This highlights
 * the actual nav item, in the actual sidebar, so the next time they look for
 * Cobros their eye already knows where to go.
 *
 * **It runs once and says so.** Five stops, a counter that shows how many are
 * left, and "Saltar" on every one of them. A tour that cannot be skipped gets
 * clicked through without reading, which is worse than not showing it.
 *
 * ─── When the target is not on screen ──────────────────────────────────────
 *
 * On a phone the sidebar does not exist: four items live in the bottom bar and
 * the other two behind "Más". Highlighting an element that is not rendered would
 * either crash or draw a ring around the top left corner.
 *
 * So the highlight is optional. When the element is missing or off screen the
 * card centres itself and the tour reads as a short explanation of the app,
 * which is the same content minus the pointing. That is a real fallback, not a
 * degraded one, and it is why this never needs to know whether it is on a phone.
 */

const SEEN_KEY = 'hilo:tour-visto'

/** Dispatch this to start the tour from anywhere. See `TourButton`. */
export const TOUR_EVENT = 'hilo:tour'

/** Fired by this file when the flag changes, so the store below hears its own writes. */
const SEEN_EVENT = 'hilo:tour-visto-cambio'

type Box = { top: number; left: number; width: number; height: number }

/**
 * Whether this browser has already been shown the tour.
 *
 * Read through `useSyncExternalStore` rather than an effect that calls
 * `setState`. localStorage *is* an external store, and reading it in an effect
 * to set state is the pattern `react-hooks/set-state-in-effect` exists to catch:
 * it renders once with the wrong answer and then again with the right one.
 *
 * The server snapshot says "already seen", so nothing renders during SSR and
 * the tour appears after hydration, when the flag can actually be read.
 */
function subscribeSeen(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(SEEN_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(SEEN_EVENT, onChange)
  }
}

function readSeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    // Private browsing, or storage disabled. Offering the tour again next time
    // is a much smaller problem than crashing.
    return false
  }
}

export function AppTour() {
  const seen = useSyncExternalStore(subscribeSeen, readSeen, () => true)

  const [step, setStep] = useState(0)
  const [restarted, setRestarted] = useState(false)
  const [box, setBox] = useState<Box | null>(null)

  const running = !seen || restarted
  const stop = running ? TOUR_STOPS[step] : undefined

  const close = useCallback(() => {
    setRestarted(false)
    setStep(0)
    setBox(null)
    try {
      window.localStorage.setItem(SEEN_KEY, '1')
      window.dispatchEvent(new Event(SEEN_EVENT))
    } catch {
      // See readSeen.
    }
  }, [])

  /** "Siguiente" on the last stop is the same thing as finishing. */
  const next = useCallback(() => {
    setStep((n) => {
      if (n + 1 >= TOUR_STOPS.length) {
        close()
        return 0
      }
      return n + 1
    })
  }, [close])

  // Only a subscription: the state change happens in the callback, when the
  // event fires, which is what effects are for.
  useEffect(() => {
    const start = () => {
      setStep(0)
      setRestarted(true)
    }
    window.addEventListener(TOUR_EVENT, start)
    return () => window.removeEventListener(TOUR_EVENT, start)
  }, [])

  // Where to draw the ring. Recomputed on every step and whenever the page
  // moves under it, because a ring that stays behind is worse than none.
  useEffect(() => {
    if (!stop) return

    const measure = () => {
      const element = document.querySelector(`[data-tour="${stop.target}"]`)
      if (!element) return setBox(null)

      const rect = element.getBoundingClientRect()
      const offScreen =
        rect.width === 0 ||
        rect.height === 0 ||
        rect.bottom < 0 ||
        rect.top > window.innerHeight

      setBox(offScreen ? null : rect)
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [stop])

  useEffect(() => {
    if (!stop) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') setStep((n) => (n === 0 ? 0 : n - 1))
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stop, close, next])

  if (!stop) return null

  const last = step === TOUR_STOPS.length - 1

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Recorrido por Hilo, paso ${step + 1} de ${TOUR_STOPS.length}`}
      // Above everything. The bottom bar on a phone is `z-70` and the sheet
      // behind it `z-80`, and the assistant button is `z-50` like this used to
      // be: same layer, later in the DOM, so it sat on top of "Saltar".
      className="fixed inset-0 z-90"
    >
      {/* The dimming and the hole are the same element: a box over the target
          with a shadow big enough to cover everything else. Two stacked divs
          with a cut-out would need to agree on the geometry; this cannot
          disagree with itself. */}
      {box ? (
        <div
          // Distinct keys so React does not reuse one div as the other. It did,
          // and with `transition-all` on it the ring animated in from the
          // full-screen overlay's position: a visible slide out of the top left
          // corner on the very first stop.
          key="foco"
          aria-hidden
          className="pointer-events-none absolute rounded-xl transition-all duration-200"
          style={{
            top: box.top - 4,
            left: box.left - 4,
            width: box.width + 8,
            height: box.height + 8,
            // Both in one declaration. A Tailwind `ring-2` would be a second
            // box-shadow on the same element, and an inline one replaces the
            // class outright, so the ring simply never appeared.
            boxShadow: '0 0 0 2px #fff, 0 0 0 9999px rgba(15,10,45,0.66)',
          }}
        />
      ) : (
        <div key="atenuado" aria-hidden className="absolute inset-0 bg-[#0f0a2d]/65" />
      )}

      {/* Width, position and the ring are inline styles rather than classes.
          Position has to be: it is measured at runtime. The other two are there
          because a class that fails to generate fails **silently** — the string
          stays in the className and the element renders with no width at all,
          which is how this card first appeared 900px wide across half the
          screen. Whatever the cause was in that build, an inline style has no
          such failure mode, and these are computed values anyway. */}
      <div
        className="absolute rounded-2xl bg-card p-5 shadow-2xl"
        style={{
          width: 'min(340px, calc(100vw - 32px))',
          ...(box
            ? {
                top: Math.min(box.top, window.innerHeight - 260),
                left: box.left + box.width + 16,
              }
            : {
                left: '50%',
                bottom: 'calc(88px + env(safe-area-inset-bottom))',
                transform: 'translateX(-50%)',
              }),
        }}
      >
        <p className="mb-1 text-[11.5px] font-semibold tracking-wide text-violet uppercase">
          {step + 1} de {TOUR_STOPS.length}
        </p>

        <h2 className="text-[17px] font-extrabold tracking-[-0.3px]">{stop.title}</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {stop.body}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" onClick={next}>
            {last ? 'Listo' : 'Siguiente'}
          </Button>

          {step > 0 ? (
            <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          ) : null}

          {/* On every stop, not only the first. Somebody who wants out on the
              fourth should not have to click through the fifth. */}
          <button
            type="button"
            onClick={close}
            className="ml-auto text-[12.5px] text-muted-foreground underline hover:text-foreground"
          >
            Saltar
          </button>
        </div>
      </div>
    </div>
  )
}

/** Starts the tour again, from wherever it is placed. */
export function TourButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}
      className="font-semibold text-violet underline hover:opacity-80"
    >
      {children}
    </button>
  )
}
