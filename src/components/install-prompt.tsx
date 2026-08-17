'use client'

import { Download, X } from '@/components/icons'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

/**
 * The offer to install Hilo, shown once and never again after it is refused.
 *
 * Only Chromium fires `beforeinstallprompt`, and it is the only way to open the
 * install dialog — the event cannot be constructed and it works exactly once.
 * So the bar is not a button that triggers an install; it is a button that
 * replays an event the browser already handed us. If the browser never hands it
 * over, this component renders nothing at all.
 *
 * That last part is deliberate on iOS, which never fires the event: adding to
 * the home screen there is a Safari share-sheet action no page can trigger, and
 * a button that opens instructions instead of an install is a button that lies.
 * `appleWebApp` in `src/app/layout.tsx` is what makes that route work well.
 */

/**
 * The `beforeinstallprompt` event is not in lib.dom — it is Chromium-only and
 * never made it into the standard. This is its shape.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED = 'hilo:install-dismissed'

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      // Without this Chrome shows its own mini-infobar, which we cannot style
      // or place. Preventing it is what hands the moment to the bar below.
      event.preventDefault()

      // Already installed and running from the home screen: there is nothing to
      // offer. Chrome usually withholds the event here, but not on every
      // platform, so the check is cheap insurance.
      if (window.matchMedia('(display-mode: standalone)').matches) return

      // Chrome re-fires this on every single load until the app is installed.
      // Without the stored refusal the bar would come back every morning.
      if (localStorage.getItem(DISMISSED)) return

      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    function onInstalled() {
      setInstallEvent(null)
    }

    // Setting state from these handlers is fine; what the lint rule forbids is
    // setting it synchronously while the effect runs.
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!installEvent) return null

  const event = installEvent

  async function install() {
    await event.prompt()
    const { outcome } = await event.userChoice
    // Single use, whatever they chose — the event cannot be replayed, so the
    // bar has to go either way.
    setInstallEvent(null)
    if (outcome === 'dismissed') localStorage.setItem(DISMISSED, '1')
  }

  function refuse() {
    localStorage.setItem(DISMISSED, '1')
    setInstallEvent(null)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-2xl border border-violet/15 bg-violet-soft px-4 py-3">
      <Download className="size-[18px] shrink-0 text-violet" />

      <p className="min-w-0 flex-1 text-[13px] leading-snug text-violet">
        <span className="font-semibold">Instalá Hilo en este dispositivo.</span>{' '}
        Queda en la pantalla de inicio y la abrís como una app, sin pasar por el
        navegador.
      </p>

      <div className="flex items-center gap-1.5">
        <Button type="button" size="sm" onClick={install}>
          Instalar
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Ahora no"
          onClick={refuse}
          className="text-violet hover:bg-violet/10"
        >
          <X />
        </Button>
      </div>
    </div>
  )
}
