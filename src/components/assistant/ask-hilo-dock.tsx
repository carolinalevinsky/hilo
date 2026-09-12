'use client'

import { X } from '@/components/icons'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { createContext, useCallback, useContext, useState } from 'react'

import { AskHilo } from '@/components/assistant/ask-hilo'
import { cn } from '@/lib/utils'

/**
 * "Preguntá a Hilo", reachable from every screen — v1's `.fab`
 * (`legacy/index.html:145`), without the floating.
 *
 * The question a practitioner has does not arrive while they are on the home
 * screen. It arrives while they are looking at a goal that has not moved, or at
 * a week that does not fit. v2 had the assistant only as a card on Inicio, which
 * means going back to Inicio and losing what you were looking at first.
 *
 * ─── Why this is not `DialogContent` ──────────────────────────────────────
 *
 * It was, and it opened as a box in the middle of the screen, over a dimmed
 * page. That is right for "confirmá que querés borrar esto" and wrong for a
 * conversation: it covers the very thing the question is about, and it makes a
 * chat feel like an interruption rather than something open beside you.
 *
 * So it docks — bottom right on a desktop; a sheet standing on the bottom bar
 * on a phone. Three consequences, each deliberate:
 *
 *   `modal={false}` — the app behind stays usable. You can scroll the goal you
 *   are asking about while you ask about it. That is the whole point of docking.
 *
 *   No overlay. Dimming the page would undo it.
 *
 *   Outside clicks do not close it. A chat window that vanished because you
 *   clicked the page you were reading would be infuriating, and the thread is
 *   gone for good when it closes. Escape and the ✕ close it; so does the button
 *   that opened it.
 *
 * It is built on the Radix primitive rather than on `src/components/ui/dialog.tsx`
 * because almost everything that file provides — the centring, the overlay, the
 * modal behaviour — is what had to go. Reaching in to undo it class by class
 * would break the next time someone adjusts the shared dialog.
 *
 * `no-print` because it is interface: `globals.css` drops it out of a printed
 * document along with the nav.
 *
 * ─── Why nothing floats any more ──────────────────────────────────────────
 *
 * A fixed button in the bottom-right corner covers whatever is in the
 * bottom-right corner. On a desktop that was Google Calendar's *Conectar*
 * button on Perfil, the 14:00 row of the Agenda, and a line of the patient
 * ficha, so the button moved into the sidebar. On a phone it was worse and it
 * lasted longer: measured at 375 px it sat on top of `#progressNote` — the
 * Comentarios field, the one thing a session is written into — and on the ficha
 * it covered a goal's progress slider and its edit button. A corner is never
 * free real estate; it is just real estate you cannot see from a desktop.
 *
 * So the trigger lives in the navigation on both sizes: the sidebar above `lg`,
 * the bottom bar below it. Nothing is fixed over the content any more, which is
 * why the panel now stops above the bar instead of reaching the bottom edge.
 * Both entry points open the same panel, which is why the open state lives in a
 * provider rather than in a button.
 */

const AskHiloContext = createContext<(() => void) | null>(null)

/** Opens the assistant panel. Only valid under `AskHiloProvider`. */
export function useAskHilo() {
  const open = useContext(AskHiloContext)
  if (!open) throw new Error('useAskHilo used outside AskHiloProvider')
  return open
}

export function AskHiloProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const openPanel = useCallback(() => setOpen(true), [])

  return (
    <AskHiloContext.Provider value={openPanel}>
      {children}
      <AskHiloDock open={open} setOpen={setOpen} />
    </AskHiloContext.Provider>
  )
}

function AskHiloDock({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          onInteractOutside={(event) => event.preventDefault()}
          className={cn(
            'no-print fixed z-50 flex flex-col overflow-hidden bg-popover text-popover-foreground ring-1 ring-foreground/10 outline-none',
            'shadow-[0_12px_40px_rgb(0_0_0_/_18%)] duration-150',
            'data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-4',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-4',
            // A phone: a sheet that rises to sit on the bottom bar, not over
            // it. Reaching the bottom edge put the box you type in underneath
            // the navigation, which is `z-70` to this panel's `z-50`.
            'inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] h-[72svh] rounded-t-2xl',
            // A desktop: a column in the corner. Below `lg` the bottom bar is
            // still there and the panel stands on it; at `lg` the bar is gone
            // and it drops to the edge.
            'sm:inset-x-auto sm:right-5 sm:bottom-[calc(84px+env(safe-area-inset-bottom))] sm:h-[min(620px,calc(100svh-11rem))] sm:w-[400px] sm:rounded-2xl lg:bottom-5 lg:h-[min(620px,calc(100svh-3.5rem))]',
          )}
        >
          <DialogPrimitive.Title className="sr-only">Preguntale a Hilo</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Preguntas sobre cualquier paciente o sobre tu práctica.
          </DialogPrimitive.Description>

          <DialogPrimitive.Close
            aria-label="Cerrar"
            className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>

          <AskHilo fill />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
