'use client'

import { MessageCircle, X } from '@/components/icons'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useState } from 'react'

import { AskHilo } from '@/components/assistant/ask-hilo'
import { cn } from '@/lib/utils'

/**
 * "Preguntá a Hilo", floating, on every screen — v1's `.fab`
 * (`legacy/index.html:145`).
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
 * So it docks — bottom right on a desktop, above the button that opened it; a
 * sheet rising from the bottom edge on a phone. Three consequences, each
 * deliberate:
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
 */
export function AskHiloFab() {
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <DialogPrimitive.Trigger
        aria-label="Preguntá a Hilo"
        className={cn(
          'no-print fixed right-5 bottom-[calc(74px+env(safe-area-inset-bottom))] z-50 inline-flex h-[52px] items-center gap-2 rounded-[26px] bg-violet px-5 text-[14.5px] font-bold text-white shadow-[0_8px_20px_rgb(108_92_231_/_30%)] hover:brightness-107 max-lg:h-13 max-lg:px-4 lg:bottom-5.5',
          // On a phone the panel reaches the bottom edge, so the button would
          // sit on top of the box you type in.
          open && 'max-sm:hidden',
        )}
      >
        <MessageCircle className="size-5" />
        {/* On a phone the label would sit on top of the content it is meant to
            help with. v1 shrank it to a circle at the same breakpoint. */}
        <span className="max-sm:hidden">Preguntá a Hilo</span>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          onInteractOutside={(event) => event.preventDefault()}
          className={cn(
            'no-print fixed z-50 flex flex-col overflow-hidden bg-popover text-popover-foreground ring-1 ring-foreground/10 outline-none',
            'shadow-[0_12px_40px_rgb(0_0_0_/_18%)] duration-150',
            'data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-4',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-4',
            // A phone: a sheet on the bottom edge, tall enough to be the screen
            // without hiding what you were looking at entirely.
            'inset-x-0 bottom-0 h-[82svh] rounded-t-2xl',
            // A desktop: a column in the corner, clear of the button below it.
            'sm:inset-x-auto sm:right-5 sm:bottom-[140px] sm:h-[min(620px,calc(100svh-13rem))] sm:w-[400px] sm:rounded-2xl lg:bottom-[88px] lg:h-[min(620px,calc(100svh-8rem))]',
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
