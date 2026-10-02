'use client'

import { MessageCircle, RotateCw, Send, Sparkles, TriangleAlert } from '@/components/icons'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DictateButton } from '@/components/dictate-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { readSseStream } from '@/lib/sse-client'
import { cn } from '@/lib/utils'

/**
 * "Preguntale a Ombúa", on the dashboard — v1 put it there
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

/**
 * `fill` is the difference between the two places this lives: the card on Inicio
 * sizes to its content and caps the thread so a long conversation does not push
 * the rest of the dashboard off the screen, and the docked panel has a height of
 * its own, so there the thread takes whatever is left between the header and the
 * box you type in.
 */
export function Ask({ fill = false }: { fill?: boolean }) {
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
    <Card
      className={cn(fill && 'flex h-full flex-col border-0 bg-transparent pt-0 shadow-none')}
    >
      {/* In the panel the header is a band: a pale strip to the top edge, ruled
          off from the conversation below it, so the title and the thread do not
          read as one column of text.

          `pr-10` leaves room for the panel's ✕, which floats over this corner —
          without it the close button lands on top of "Empezar de nuevo".
          `rounded-t-none` because the panel already rounds and clips this
          corner, at a wider radius than the card's own. The bottom padding
          comes free: `CardHeader` adds it whenever there is a `border-b`. */}
      <CardHeader
        className={cn(
          fill && 'rounded-t-none border-b bg-muted pt-(--card-spacing) pr-10',
        )}
      >
        <CardTitle className="flex items-center gap-3">
          {/* En la tarjeta de Inicio el ícono es el cuadrado con degradé del
              diseño; en el panel sigue siendo el de siempre, que ahí convive
              con el ✕ y con "Empezar de nuevo" en un renglón angosto. */}
          {fill ? (
            <MessageCircle className="size-[18px] text-violet" />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet to-[#5f50d7] text-white">
              <Sparkles className="size-6" />
            </span>
          )}
          <span className="flex items-center gap-2">
            Preguntale a Ombúa
            {fill ? null : (
              <span className="rounded bg-violet-soft px-1.5 py-0.5 text-nano font-bold tracking-[0.08em] text-violet uppercase">
                IA
              </span>
            )}
          </span>
          {turns.length ? (
            /* Icon only. The arrow says "start over" on its own, and the
               words were the widest thing in a header that also has to hold the
               title and the ✕. The label stays for anyone who cannot see it. */
            <button
              type="button"
              onClick={() => {
                setTurns([])
                inputRef.current?.focus()
              }}
              aria-label="Empezar de nuevo"
              title="Empezar de nuevo"
              className="ml-auto inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              <RotateCw className="size-4" />
            </button>
          ) : null}
        </CardTitle>
        {/* Not in the panel: there the band should be a title and two icons,
            and a second line of grey text under it is what made it read as a
            form rather than as a chat. The card on Inicio keeps it — that one
            is being seen for the first time, and it is where the promise that
            nothing is written down still gets made. */}
        {fill ? null : (
          <p className="pl-15 text-meta text-muted-foreground">
            {turns.length
              ? 'Se acuerda de esta charla. Cuando la cerrás, no queda guardada.'
              : 'Sobre cualquier paciente o sobre tu práctica.'}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn('space-y-3', fill && 'flex min-h-0 flex-1 flex-col')}>
        {turns.length ? (
          <div
            ref={threadRef}
            aria-live="polite"
            className={cn('flex flex-col overflow-y-auto', fill ? 'min-h-0 flex-1' : 'max-h-[46vh]')}
          >
            {/* `mt-auto`, not `justify-end`, and the difference is not cosmetic:
                with `justify-end` a conversation taller than the panel has its
                oldest messages pushed out of the top and no way to scroll back
                to them. An auto margin collapses to nothing once the content
                overflows, so it only does something while there is room. */}
            <div className="mt-auto space-y-2.5">
              {turns.map((turn, index) =>
                turn.role === 'user' ? (
                  <p
                    key={index}
                    className="ml-auto w-fit max-w-[85%] rounded-xl bg-muted px-3.5 py-2.5 text-body leading-relaxed"
                  >
                    {turn.content}
                  </p>
                ) : (
                  <div key={index} className="space-y-2">
                    {turn.content ? (
                      <p className="w-fit max-w-[92%] rounded-xl bg-violet-soft px-3.5 py-3 text-body leading-relaxed whitespace-pre-wrap">
                        {turn.content}
                      </p>
                    ) : null}

                    {!turn.content && asking && index === turns.length - 1 ? (
                      <p className="text-body text-muted-foreground">Pensando…</p>
                    ) : null}

                    {/* Beside the answer, not instead of it: the answer above is
                        real either way, it just did not come from the model. */}
                    {turn.note ? (
                      <p className="flex items-start gap-2 rounded-xl bg-amber-soft px-3.5 py-2.5 text-meta leading-relaxed text-amber-ink">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                        <span>{turn.note}</span>
                      </p>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          /* An empty panel is not an empty box. Ombúa speaks first, and the four
             questions under it are the answer to "¿y qué le pregunto?" — the
             thing a first-time user actually gets stuck on.

             Greeting and shortcuts at the top, the box you type in at the
             bottom: the shape of every chat someone already uses. The composer
             does not move when the conversation starts, so the one control the
             practitioner reaches for is in the same place before and after.

             The greeting belongs to the panel alone. On Inicio the card's
             header already puts a line of grey text under the title, and two
             greetings stacked is one too many. */
          <div className={cn('space-y-3', fill && 'min-h-0 flex-1 overflow-y-auto')}>
            {fill ? (
              <p className="w-fit max-w-[92%] rounded-xl bg-violet-soft px-3.5 py-3 text-[13.5px] leading-relaxed">
                Hola, ¿cómo puedo ayudarte?
              </p>
            ) : null}

            {/* Not decoration: tapping one asks it. */}
            {fill ? null : (
              <p className="text-nano font-bold tracking-[0.08em] text-muted-foreground uppercase">
                Sugerencias rápidas
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {QUICK.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => void ask(text)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full text-xs font-semibold transition-colors',
                    fill
                      ? 'border border-border bg-card px-3 py-1.5 text-muted-foreground hover:bg-muted'
                      : 'bg-muted px-3.5 py-2 text-foreground hover:bg-violet-soft',
                  )}
                >
                  {fill ? null : <span className="size-1.5 rounded-full bg-violet" />}
                  {text}
                </button>
              ))}
            </div>

            {/* Qué se le puede preguntar, dicho con un ejemplo en vez de con una
                promesa. Es texto fijo: no es una respuesta del modelo. */}
            {fill ? null : (
              <p className="flex items-start gap-2 rounded-[16px] bg-muted/70 px-4 py-3.5 text-body leading-relaxed text-muted-foreground">
                <MessageCircle className="mt-0.5 size-5 shrink-0 text-violet" />
                Podés consultarme dudas sobre el progreso terapéutico, informes clínicos
                pendientes o recursos didácticos recomendados.
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void ask(question)
          }}
          // One box, and the controls live inside it — which is how every chat
          // people already use is built, so it needs no learning. The border and
          // the focus ring move from the field to the box; the field keeps the
          // caret and gives up everything else.
          className={cn(
            'transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
            fill
              ? 'rounded-xl border border-input bg-card px-3 py-2.5'
              : 'rounded-[16px] border border-transparent bg-muted p-1.5 sm:flex sm:items-center sm:gap-1',
          )}
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
            className={cn(
              'h-auto w-full border-0 bg-transparent py-0 shadow-none focus-visible:border-transparent focus-visible:ring-0',
              fill ? 'px-0' : 'px-2 py-1.5 text-sm sm:py-0',
            )}
          />
          {/* En el panel los controles van debajo del campo; en la tarjeta,
              en el mismo renglón.

              No es una inconsistencia: compartir renglón dejaba el campo a la
              mitad del ancho del panel —tan angosto que se cortaba su propio
              placeholder a mitad de palabra, que es la única línea que le dice a
              alguien qué escribir ahí—. El panel es angosto en todos lados: un
              diálogo en el escritorio, la pantalla entera en un teléfono. La
              tarjeta de Inicio no tiene ese problema y el diseño la pide así.

              `ml-auto` en vez de `justify-between`: el micrófono no dibuja nada
              donde el navegador no puede escuchar, y el botón sigue yendo a la
              derecha cuando queda solo. En la tarjeta eso lo resuelve el
              `contents` — los dos controles son hijos directos del renglón. */}
          <div
            className={cn(
              'mt-2 flex items-center gap-2',
              // En la tarjeta, un solo renglón — pero recién cuando entra. En un
              // teléfono el campo quedaría tan angosto que se corta su propio
              // placeholder, que es la única línea que dice qué escribir ahí.
              !fill && 'sm:mt-0 sm:contents',
            )}
          >
            {/* The same dictation as every note field. The audio goes to the
                browser's dictation service, not to Ombúa — see
                `src/lib/speech.ts`. Icon only: this box is often used with a
                patient still in the room. */}
            <DictateButton compact value={question} onText={setQuestion} />
            <Button
              type="submit"
              disabled={asking || !question.trim()}
              className={cn('ml-auto shrink-0', fill || 'rounded-xl sm:ml-0')}
            >
              {asking ? 'Pensando…' : 'Preguntar'}
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
