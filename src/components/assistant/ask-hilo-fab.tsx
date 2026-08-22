'use client'

import { MessageCircle } from '@/components/icons'
import { useState } from 'react'

import { AskHilo } from '@/components/assistant/ask-hilo'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * "Preguntá a Hilo", floating, on every screen — v1's `.fab`
 * (`legacy/index.html:145`).
 *
 * The question a practitioner has does not arrive while they are on the home
 * screen. It arrives while they are looking at a goal that has not moved, or at
 * a week that does not fit. v2 had the assistant only as a card on Inicio, which
 * means going back to Inicio and losing what you were looking at first.
 *
 * `no-print` because it is interface: `globals.css` drops it out of a printed
 * document along with the nav.
 */
export function AskHiloFab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Preguntá a Hilo"
        className="no-print fixed right-5 bottom-[calc(74px+env(safe-area-inset-bottom))] z-50 inline-flex h-[52px] items-center gap-2 rounded-[26px] bg-violet px-5 text-[14.5px] font-bold text-white shadow-[0_8px_20px_rgb(108_92_231_/_30%)] hover:brightness-107 max-lg:h-13 max-lg:px-4 lg:bottom-5.5"
      >
        <MessageCircle className="size-5" />
        {/* On a phone the label would sit on top of the content it is meant to
            help with. v1 shrank it to a circle at the same breakpoint. */}
        <span className="max-sm:hidden">Preguntá a Hilo</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Preguntale a Hilo</DialogTitle>
            <DialogDescription>
              Preguntas sobre cualquier paciente o sobre tu práctica.
            </DialogDescription>
          </DialogHeader>

          <AskHilo />
        </DialogContent>
      </Dialog>
    </>
  )
}
