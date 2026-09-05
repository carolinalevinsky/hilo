'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { toast } from 'sonner'

import { Mic, Square } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  newRecognition,
  speechErrorMessage,
  speechStore,
  type SpeechRecognitionLike,
} from '@/lib/speech'

/**
 * Dictation into a textarea, using the browser's own speech recognition.
 *
 * Ported from v1's `dictar()` (`legacy/index.html:1266`), and it earns its place:
 * a session note gets written in the two minutes between one patient leaving and
 * the next arriving. Speaking it is the difference between a note that exists
 * and one that does not — and the note is what the AI reads when it drafts a
 * report, so an empty one costs more than it looks.
 *
 * The plumbing lives in `src/lib/speech.ts`, shared with the session recorder.
 *
 * Two ways to receive what was said, because the fields differ. A textarea is
 * uncontrolled and is written straight through `targetId` — that is every note
 * field in the app. "Preguntale a Hilo" is a controlled input, so a write to
 * `.value` would show text React does not know about: the box would look full
 * and "Preguntar" would stay disabled. That one passes `onText` and its own
 * `value` instead.
 */
export function DictateButton({
  targetId,
  value,
  onText,
  compact,
}: {
  targetId?: string
  /** The field's current text, in `onText` mode. Dictation adds to it. */
  value?: string
  onText?: (text: string) => void
  /** Icon only, for a composer where a labelled button would not fit. */
  compact?: boolean
}) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const supported = useSyncExternalStore(
    speechStore.subscribe,
    speechStore.isSupportedOnClient,
    speechStore.isSupportedOnServer,
  )

  if (!supported) return null

  function stop() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }

  function start() {
    const target = targetId
      ? (document.getElementById(targetId) as HTMLTextAreaElement | null)
      : null
    const recognition = newRecognition()

    // Volver sin decir nada era lo que hacía que "no anda" fuera la única
    // descripción posible desde afuera. Cada una de estas dos ramas es un error
    // nuestro, no del entorno, y son las únicas que quedan mudas si no se dicen.
    if (targetId && !target) {
      toast.error('No encontramos el campo donde escribir. Recargá la pantalla.')
      return
    }
    if (!recognition) {
      toast.error('Tu navegador no puede dictar.')
      return
    }

    const existing = target ? target.value : (value ?? '')
    let committed = existing.trim() ? `${existing.trim()} ` : ''

    recognition.onresult = (event) => {
      let settled = ''
      let pending = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (!result) continue
        if (result.isFinal) settled += `${result[0].transcript} `
        else pending += result[0].transcript
      }
      if (settled) committed += settled

      const written = `${committed}${pending}`.replace(/\s{2,}/g, ' ')
      if (target) target.value = written
      else onText?.(written)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
    }

    recognition.onerror = (event) => {
      recognitionRef.current = null
      setListening(false)

      const message = speechErrorMessage(event.error)
      if (message) toast.error(message)
    }

    recognitionRef.current = recognition
    setListening(true)

    // `start()` tira si ya hay un reconocimiento andando. Sin este try la
    // excepción sube sin manejar, el botón queda diciendo "Parar" y no hay nada
    // corriendo detrás.
    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      setListening(false)
      toast.error('El dictado ya estaba andando. Esperá un segundo y probá de nuevo.')
    }
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant={listening ? 'destructive' : 'outline'}
        size="icon"
        aria-label={listening ? 'Parar el dictado' : 'Dictar la pregunta'}
        className="shrink-0"
        onClick={() => (listening ? stop() : start())}
      >
        {listening ? <Square className="size-3.5" /> : <Mic className="size-4" />}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={listening ? 'destructive' : 'outline'}
      size="sm"
      onClick={() => (listening ? stop() : start())}
    >
      {listening ? (
        <>
          <Square className="size-3.5" />
          Parar
        </>
      ) : (
        <>
          <Mic className="size-4" />
          Dictar
        </>
      )}
    </Button>
  )
}
