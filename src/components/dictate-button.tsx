'use client'

import { Mic, Square } from '@/components/icons'
import { useRef, useState, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'

/**
 * Dictation into a textarea, using the browser's own speech recognition.
 *
 * Ported from v1's `dictar()` (`legacy/index.html:1266`), and it earns its place:
 * a session note gets written in the two minutes between one patient leaving and
 * the next arriving. Speaking it is the difference between a note that exists
 * and one that does not — and the note is what the AI reads when it drafts a
 * report, so an empty one costs more than it looks.
 *
 * Where the API is missing — Firefox, and most iOS browsers — the button is not
 * rendered at all and the practitioner uses the microphone on their phone's own
 * keyboard, which does the same job. An offer that does nothing when tapped is
 * worse than no offer.
 */

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: { isFinal: boolean; 0: { transcript: string }; length: number }[] & {
    length: number
  }
}

function recognitionCtor() {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

/**
 * `useSyncExternalStore` rather than an effect: the server snapshot is `false`,
 * so the button is absent in the HTML and appears on hydration where the API
 * exists. Deciding this in an effect would render one frame with the wrong
 * answer, and deciding it during render would be a hydration mismatch.
 */
const subscribe = () => () => {}
const isSupportedOnClient = () => recognitionCtor() !== undefined
const isSupportedOnServer = () => false

export function DictateButton({ targetId }: { targetId: string }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const supported = useSyncExternalStore(
    subscribe,
    isSupportedOnClient,
    isSupportedOnServer,
  )

  if (!supported) return null

  function stop() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }

  function start() {
    const target = document.getElementById(targetId) as HTMLTextAreaElement | null
    const Ctor = recognitionCtor()
    if (!target || !Ctor) return
    const recognition = new Ctor()

    recognition.lang = 'es-UY'
    recognition.interimResults = true
    recognition.continuous = true

    let committed = target.value ? `${target.value.trim()} ` : ''

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
      target.value = `${committed}${pending}`.replace(/\s{2,}/g, ' ')
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
    }

    recognition.onerror = () => {
      recognitionRef.current = null
      setListening(false)
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
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
