'use client'

import { MessageCircle, Send, Sparkles, TriangleAlert } from '@/components/icons'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { readSseStream } from '@/lib/sse-client'

/**
 * "Preguntale a Hilo", on the dashboard — v1 put it there
 * (`legacy/index.html:557`) and that was right: it is the screen someone opens
 * between sessions, and the question they have is about the next one.
 *
 * A single exchange rather than a scrolling thread. The questions this answers
 * are one-shot ("¿qué trabajo con Tomás?"), a thread would need history sent on
 * every call — more clinical text leaving the app per question, for a
 * conversation nobody has — and the server keeps no transcript, deliberately.
 */

/** v1's `CHATQUICK` (`legacy/index.html:2526`). */
const QUICK = [
  '¿Qué tengo hoy?',
  '¿Cómo viene cada paciente?',
  'Sugerime materiales',
  '¿A quién le falta pagar?',
]

export function AskHilo() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function ask(text: string) {
    const asked = text.trim()
    if (!asked || asking) return

    setAsking(true)
    setAnswer('')
    setNote(null)
    setQuestion('')

    try {
      const response = await fetch('/api/ai/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: asked }),
      })

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        setNote(payload?.error ?? 'No pude responder esta vez. Probá de nuevo en un rato.')
        setAsking(false)
        return
      }

      let received = ''
      await readSseStream(response.body, {
        onDelta: (chunk) => {
          received += chunk
          setAnswer(received)
        },
        onError: setNote,
      })
    } catch {
      setNote('No pude responder esta vez. Probá de nuevo en un rato.')
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
        </CardTitle>
        <p className="text-[12.5px] text-muted-foreground">
          Sobre cualquier paciente o sobre tu práctica.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void ask(question)
          }}
          className="flex flex-wrap gap-2"
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
            placeholder="Ej: ¿qué me recomendás para Tomás?"
            maxLength={500}
            disabled={asking}
            aria-label="Tu pregunta"
            className="min-w-[200px] flex-1"
          />
          {/* Full width once it has wrapped onto its own line, which it always
              does on a phone — a small button alone at the left edge reads as
              an afterthought rather than as the way to send. */}
          <Button
            type="submit"
            disabled={asking || !question.trim()}
            className="max-sm:w-full"
          >
            <Send className="size-4" />
            {asking ? 'Pensando…' : 'Preguntar'}
          </Button>
        </form>

        {!answer && !asking ? (
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

        {answer ? (
          <div className="flex items-start gap-2.5 rounded-xl bg-violet-soft px-3.5 py-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-violet" />
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        ) : null}

        {asking && !answer ? (
          <p className="text-[13px] text-muted-foreground">Pensando…</p>
        ) : null}

        {/* Why the answer is the one on screen — an exhausted quota, a model that
            did not respond. The answer above it is still real either way, so this
            is a note beside it rather than an error instead of it. */}
        {note ? (
          <p className="flex items-start gap-2 rounded-xl bg-amber-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#8a5a12]">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{note}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
