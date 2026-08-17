'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { Mic, Sparkles, Square, TriangleAlert } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { readSseStream } from '@/lib/sse-client'
import { newRecognition, speechStore, type SpeechRecognitionLike } from '@/lib/speech'

/**
 * "Grabá y Hilo arma el registro" — v1's promise
 * (`legacy/index.html:1943`), delivered.
 *
 * You press record at the start of the session, leave the phone on the table,
 * and press stop at the end. What the browser heard becomes the session record,
 * in the field, for you to fix and save.
 *
 * ─── The audio never leaves this page ──────────────────────────────────────
 *
 * The browser turns speech into text itself; only the text is posted. That is
 * the whole reason this feature could be built at all — uploading audio of a
 * session with a child would mean a new processor, a retention policy and a new
 * line in the privacy notice, none of which this button is entitled to decide.
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

    recognition.onerror = () => {
      wantedRef.current = false
      recognitionRef.current = null
      setState('idle')
      setNote('Se cortó la grabación. Lo que se había escuchado quedó guardado.')
    }

    wantedRef.current = true
    recognitionRef.current = recognition
    setState('recording')
    recognition.start()
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
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold tabular-nums">
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

      <p className="mt-2 text-[12px] text-muted-foreground">
        {state === 'recording'
          ? 'Estoy escuchando. Dejá el teléfono sobre la mesa y seguí con la sesión.'
          : 'Grabás y Hilo arma el registro solo. El audio no sale de este dispositivo: se convierte en texto acá mismo.'}
      </p>

      {note ? (
        <p className="mt-2 inline-flex items-start gap-1.5 text-[12px] text-[#8a5a00]">
          <TriangleAlert className="mt-px size-3.5 shrink-0" />
          {note}
        </p>
      ) : null}
    </div>
  )
}
