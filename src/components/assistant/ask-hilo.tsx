'use client'

import { MessageCircle, RotateCw, Send, TriangleAlert } from '@/components/icons'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DictateButton } from '@/components/dictate-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { readSseStream } from '@/lib/sse-client'

/**
 * "Preguntale a Hilo", on the dashboard — v1 put it there
 * (`legacy/index.html:557`) and that was right: it is the screen someone opens
 * between sessions, and the question they have is about the next one.
 *
 * A thread, not a single exchange. This was the other way around on purpose and
 * was changed on purpose: a practitioner asking "¿qué trabajo con Tomás?" has a
 * second question about the same answer, and having to restate the patient in
 * every question is not how anyone talks. The cost is real and it was the
 * argument against it — the earlier turns go back to Anthropic with each new
 * question, so clinical text the practitioner typed leaves the app again — and
 * it is bounded on both sides: the server forwards five exchanges at most
 * (`HISTORY_LIMIT` in `src/server/assistant.ts`), and the conversation exists
 * only here, in this tab. No transcript is stored, so "Empezar de nuevo" and
 * closing the panel are the same thing and both are final.
 */

/** v1's `CHATQUICK` (`legacy/index.html:2526`). */
const QUICK = [
  '¿Qué tengo hoy?',
  '¿Cómo viene cada paciente?',
  'Sugerime materiales',
  '¿A quién le falta pagar?',
]

/**
 * Matches `HISTORY_LIMIT` on the server, which is the one that counts — this is
 * only so the request body is not carrying turns that will be dropped on
 * arrival.
 */
const SENT_TURNS = 10

type Turn = {
  role: 'user' | 'assistant'
  content: string
  /** Why this answer is the one on screen: a spent quota, a model that failed. */
  note?: string
}

export function AskHilo() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  // The answer is written from the top, so without this the practitioner watches
  // the first line and never sees the last one.
  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTop = thread.scrollHeight
  }, [turns])

  async function ask(text: string) {
    const asked = text.trim()
    if (!asked || asking) return

    const history = turns
      .filter((turn) => turn.content.trim())
      .slice(-SENT_TURNS)
      .map((turn) => ({ role: turn.role, content: turn.content }))

    setAsking(true)
    setQuestion('')
    setTurns((current) => [
      ...current,
      { role: 'user', content: asked },
      { role: 'assistant', content: '' },
    ])

    // Only ever the answer being written, which is the last turn.
    const patch = (changes: Partial<Turn>) =>
      setTurns((current) =>
        current.map((turn, index) =>
          index === current.length - 1 ? { ...turn, ...changes } : turn,
        ),
      )

    try {
      const response = await fetch('/api/ai/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: asked, history }),
      })

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        patch({ note: payload?.error ?? 'No pude responder esta vez. Probá de nuevo en un rato.' })
        setAsking(false)
        inputRef.current?.focus()
        return
      }

      let received = ''
      await readSseStream(response.body, {
        onDelta: (chunk) => {
          received += chunk
          patch({ content: received })
        },
        onError: (message) => patch({ note: message }),
      })
    } catch {
      patch({ note: 'No pude responder esta vez. Probá de nuevo en un rato.' })
    }

    setAsking(false)
    inputRef.current?.focus()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-[18px] text-violet" />
          Preguntale a Hilo
          {turns.length ? (
            <button
              type="button"
              onClick={() => {
                setTurns([])
                inputRef.current?.focus()
              }}
              className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCw className="size-3.5" />
              Empezar de nuevo
            </button>
          ) : null}
        </CardTitle>
        <p className="text-[12.5px] text-muted-foreground">
          {turns.length
            ? 'Se acuerda de esta charla. Cuando la cerrás, no queda guardada.'
            : 'Sobre cualquier paciente o sobre tu práctica.'}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {turns.length ? (
          <div
            ref={threadRef}
            aria-live="polite"
            className="max-h-[46vh] space-y-2.5 overflow-y-auto"
          >
            {turns.map((turn, index) =>
              turn.role === 'user' ? (
                <p
                  key={index}
                  className="ml-auto w-fit max-w-[85%] rounded-xl bg-muted px-3.5 py-2.5 text-[13.5px] leading-relaxed"
                >
                  {turn.content}
                </p>
              ) : (
                <div key={index} className="space-y-2">
                  {turn.content ? (
                    <p className="w-fit max-w-[92%] rounded-xl bg-violet-soft px-3.5 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap">
                      {turn.content}
                    </p>
                  ) : null}

                  {!turn.content && asking && index === turns.length - 1 ? (
                    <p className="text-[13px] text-muted-foreground">Pensando…</p>
                  ) : null}

                  {/* Beside the answer, not instead of it: the answer above is
                      real either way, it just did not come from the model. */}
                  {turn.note ? (
                    <p className="flex items-start gap-2 rounded-xl bg-amber-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#8a5a12]">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                      <span>{turn.note}</span>
                    </p>
                  ) : null}
                </div>
              ),
            )}
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void ask(question)
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            // Explicit, rather than relying on a form's implicit submission.
            // v1 bound Enter directly (`legacy/index.html:563`) and this is the
            // one control in the app someone uses without reaching for the
            // mouse — worth not depending on a browser default.
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              void ask(question)
            }}
            placeholder={
              turns.length ? 'Seguí preguntando…' : 'Ej: ¿qué me recomendás para Tomás?'
            }
            maxLength={500}
            disabled={asking}
            aria-label="Tu pregunta"
            className="min-w-0 flex-1"
          />
          {/* The same dictation as every note field, in the browser: the audio
              never leaves the page, only the text does. Icon only — the panel is
              narrow, and this box is often used with a patient still in the
              room. Renders nothing where the browser cannot listen. */}
          <DictateButton compact value={question} onText={setQuestion} />
          {/* One row, always. Letting it wrap left the button alone at the left
              edge of the floating panel, reading as an afterthought rather than
              as the way to send — and the panel is narrow everywhere: it is a
              dialog on a desktop and the whole screen on a phone. */}
          <Button type="submit" disabled={asking || !question.trim()} className="shrink-0">
            <Send className="size-4" />
            {asking ? 'Pensando…' : 'Preguntar'}
          </Button>
        </form>

        {turns.length === 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => void ask(text)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                {text}
              </button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
