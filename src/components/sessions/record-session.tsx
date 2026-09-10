'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { Mic, Sparkles, Square, TriangleAlert } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { readSseStream } from '@/lib/sse-client'
import {
  newRecognition,
  speechErrorMessage,
  speechStore,
  type SpeechRecognitionLike,
} from '@/lib/speech'

/**
 * "Grabá y Hilo arma el registro" — v1's promise
 * (`legacy/index.html:1943`), delivered.
 *
 * You press record at the start of the session, leave the phone on the table,
 * and press stop at the end. What the browser heard becomes the session record,
 * in the field, for you to fix and save.
 *
 * ─── Where the audio actually goes ─────────────────────────────────────────
 *
 * This block used to say the audio never left the page. It was wrong, and the
 * correction is the reason to read the rest of it carefully.
 *
 * `SpeechRecognition` does not transcribe on the device by default. MDN: "By
 * default, using speech recognition on a web page involves a server-based
 * recognition engine. Your audio is sent to a web service for recognition
 * processing, so it won't work offline." In Chrome that web service is Google's.
 * The tell was here all along — `speechErrorMessage` has a `network` case
 * saying dictation needs the internet, which on-device recognition would not.
 *
 * So audio of a therapy session with a child reaches a third party that is not
 * Hilo and is not in the privacy notice as a processor of it. Hilo itself still
 * only ever receives and stores text — that part was true — but "the audio does
 * not leave this device" was a promise this product could not keep, and it was
 * printed under the button.
 *
 * `processLocally = true` (Chrome 139+) is the switch that would make the old
 * sentence true. It is not flipped here yet: it needs a language pack the user
 * may not have, `available()` crashes the renderer in current Chromium
 * (crbug 444393111), and silently falling back to the server engine would put
 * the same false promise back on the screen. Until that is worked out, the copy
 * below says what actually happens.
 *
 * Nothing is saved automatically. The draft lands in the field and the
 * practitioner presses "Guardar sesión", the same as if they had typed it.
 */
export function RecordSession({
  patientId,
  targetId,
}: {
  patientId: string
  /** The textarea the draft lands in. */
  targetId: string
}) {
  const [state, setState] = useState<'idle' | 'recording' | 'drafting'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [note, setNote] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const transcriptRef = useRef('')
  // Whether the practitioner still wants to be recording. A ref and not `state`
  // because `onend` fires from a listener registered once, which would keep
  // reading whatever `state` was when the recogniser started — always 'idle'.
  const wantedRef = useRef(false)

  const supported = useSyncExternalStore(
    speechStore.subscribe,
    speechStore.isSupportedOnClient,
    speechStore.isSupportedOnServer,
  )

  // The clock only exists while recording, and it is the only thing on screen
  // that says the microphone is still on.
  useEffect(() => {
    if (state !== 'recording') return
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [state])

  // A recogniser left running after the form unmounts keeps the microphone open
  // with nothing listening to it.
  useEffect(() => {
    return () => {
      wantedRef.current = false
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [])

  if (!supported) return null

  function start() {
    const recognition = newRecognition()
    if (!recognition) return

    transcriptRef.current = ''
    setNote(null)
    setSeconds(0)

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        // Only settled text is kept: what is still being revised would be
        // counted twice as the browser corrects itself.
        if (result?.isFinal) transcriptRef.current += `${result[0].transcript} `
      }
    }

    // Recognition stops itself on a long silence, which in a session is normal —
    // a child working quietly. Restart it until the practitioner says otherwise.
    recognition.onend = () => {
      if (wantedRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start()
          return
        } catch {
          // Already restarting; nothing to do.
        }
      }
      recognitionRef.current = null
    }

    recognition.onerror = (event) => {
      wantedRef.current = false
      recognitionRef.current = null
      setState('idle')

      // "Se cortó la grabación" para todo servía cuando el corte era de veras un
      // corte a mitad de camino. Pero el mismo texto aparecía si el micrófono
      // estaba bloqueado o si no había ninguno — o sea, cuando nunca había
      // arrancado— y ahí decir que se cortó y que "quedó guardado" es dos veces
      // falso, y no menciona lo único que hay que hacer.
      const message = speechErrorMessage(event.error)
      setNote(
        message
          ? `${message} Lo que se haya escuchado hasta ahora quedó guardado.`
          : 'Se cortó la grabación. Lo que se había escuchado quedó guardado.',
      )
    }

    wantedRef.current = true
    recognitionRef.current = recognition
    setState('recording')

    try {
      recognition.start()
    } catch {
      wantedRef.current = false
      recognitionRef.current = null
      setState('idle')
      setNote('La grabación ya estaba andando. Esperá un segundo y probá de nuevo.')
    }
  }

  async function stop() {
    wantedRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null

    const transcript = transcriptRef.current.replace(/\s{2,}/g, ' ').trim()
    const target = document.getElementById(targetId) as HTMLTextAreaElement | null

    if (transcript.length < 40) {
      setState('idle')
      setNote('Quedó muy corta para armar un registro. Probá de nuevo o escribilo a mano.')
      return
    }

    setState('drafting')

    try {
      const response = await fetch('/api/ai/sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, transcript }),
      })

      if (!response.ok || !response.body) {
        const problem = (await response.json().catch(() => ({}))) as { error?: string }
        // The words are not lost just because the draft failed.
        if (target) target.value = transcript
        setNote(problem.error ?? 'No pudimos armar el registro. Te dejo lo que se escuchó.')
        return
      }

      await readSseStream(response.body, {
        onDelta: (text) => {
          if (target) target.value = text
        },
        onError: (message) => setNote(message),
      })
    } catch {
      if (target) target.value = transcript
      setNote('No pudimos armar el registro. Te dejo lo que se escuchó.')
    } finally {
      setState('idle')
    }
  }

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const rest = String(seconds % 60).padStart(2, '0')

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {state === 'recording' ? (
          <>
            <Button type="button" variant="destructive" size="sm" onClick={stop}>
              <Square className="size-3.5" />
              Terminar y armar el registro
            </Button>
            <span className="inline-flex items-center gap-1.5 text-body font-bold tabular-nums">
              <span className="size-2 animate-pulse rounded-full bg-coral" />
              {minutes}:{rest}
            </span>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={start}
            disabled={state === 'drafting'}
          >
            {state === 'drafting' ? (
              <>
                <Sparkles className="size-4" />
                Armando el registro…
              </>
            ) : (
              <>
                <Mic className="size-4" />
                Grabar sesión
              </>
            )}
          </Button>
        )}
      </div>

      <p className="mt-2 text-meta text-muted-foreground">
        {state === 'recording'
          ? 'Estoy escuchando. Dejá el teléfono sobre la mesa y seguí con la sesión.'
          : 'Grabás y Hilo arma el registro solo. Para pasar la voz a texto, el navegador manda el audio a su servicio de dictado (en Chrome, el de Google). Hilo recibe y guarda solo el texto.'}
      </p>

      {note ? (
        <p className="mt-2 inline-flex items-start gap-1.5 text-meta text-[#8a5a00]">
          <TriangleAlert className="mt-px size-3.5 shrink-0" />
          {note}
        </p>
      ) : null}
    </div>
  )
}
