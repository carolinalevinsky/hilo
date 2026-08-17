'use client'

import { useRef, useState, useSyncExternalStore } from 'react'

import { Mic, Square } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { newRecognition, speechStore, type SpeechRecognitionLike } from '@/lib/speech'

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
 */
export function DictateButton({ targetId }: { targetId: string }) {
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
    const target = document.getElementById(targetId) as HTMLTextAreaElement | null
    const recognition = newRecognition()
    if (!target || !recognition) return

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
