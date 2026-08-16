'use client'

import { Check, Pencil, Printer, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { DocumentBody } from '@/components/documents/clinical-document'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { readSseStream } from '@/lib/sse-client'

/**
 * The body of a clinical document: streams in, gets edited, gets saved.
 *
 * Three states and they are deliberately distinct on screen:
 *
 *   **streaming** — text arriving. Read-only, because editing a paragraph that
 *   is still being written loses the edit.
 *   **reading** — the finished draft, formatted like the printed page.
 *   **editing** — a textarea over the same text. Plain text, not a rich editor:
 *   the document has headings and paragraphs and nothing else, and a rich editor
 *   would introduce a markup format to sanitise on the way in.
 *
 * The banner above it is not decoration either. Rule 4 of the clinical
 * instructions says the judgement and the signature are the professional's; the
 * interface has to say so too, on the screen where they are about to sign.
 */
export function DocumentEditor({
  documentId,
  initialText,
  endpoint,
  idField,
  autoStart,
  onSave,
}: {
  documentId: string
  initialText: string
  /** `/api/ai/informe` or `/api/ai/evaluacion`. */
  endpoint: string
  /** `reportId` or `assessmentId`. */
  idField: string
  /** Start generating as soon as the page opens. */
  autoStart: boolean
  onSave: (text: string) => Promise<void>
}) {
  const [text, setText] = useState(initialText)
  const [status, setStatus] = useState<'idle' | 'streaming' | 'editing' | 'saving'>(
    'idle',
  )
  const [aiNote, setAiNote] = useState<'ok' | 'failed' | 'saved' | null>(null)
  // The reason, when there is a specific one worth reading — an exceeded quota,
  // a refusal. Shown in the banner rather than an alert(): a modal dialog over a
  // document that is still on screen is worse than a line of text next to it,
  // and browsers block alerts from a background tab anyway.
  const [aiError, setAiError] = useState<string | null>(null)
  const [adjustment, setAdjustment] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (!autoStart || started.current) return
    started.current = true
    void generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  async function generate(withAdjustment?: string) {
    setStatus('streaming')
    setAiNote(null)
    setAiError(null)
    setText('')

    let received = ''
    let failed = false

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [idField]: documentId, adjustment: withAdjustment }),
      })

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null)
        setText(initialText)
        setAiNote('failed')
        setAiError(typeof payload?.error === 'string' ? payload.error : null)
        setStatus('idle')
        return
      }

      await readSseStream(response.body, {
        onDelta: (chunk) => {
          received += chunk
          setText(received)
        },
        onError: (message) => {
          failed = true
          setAiNote('failed')
          setAiError(message)
        },
      })
    } catch {
      failed = true
      setAiNote('failed')
    }

    if (failed || !received.trim()) {
      // The offline draft is still better than an empty page: the practitioner
      // has something to edit and sign rather than a dead screen.
      setText(initialText)
      setAiNote('failed')
      setStatus('idle')
      return
    }

    setAiNote('ok')
    setStatus('idle')
    await save(received)
  }

  async function save(next: string) {
    setStatus('saving')
    await onSave(next)
    setStatus('idle')
    setAiNote('saved')
  }

  const streaming = status === 'streaming'

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center gap-2">
        {status === 'editing' ? (
          <Button onClick={() => void save(text).then(() => setStatus('idle'))}>
            <Check className="size-4" />
            Guardar cambios
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setStatus('editing')} disabled={streaming}>
            <Pencil className="size-4" />
            Editar
          </Button>
        )}

        <Button variant="outline" onClick={() => void generate()} disabled={streaming}>
          <RefreshCw className={`size-4 ${streaming ? 'animate-spin' : ''}`} />
          {streaming ? 'Escribiendo…' : 'Regenerar con IA'}
        </Button>

        <Button variant="outline" onClick={() => window.print()} disabled={streaming}>
          <Printer className="size-4" />
          Imprimir o guardar en PDF
        </Button>
      </div>

      {aiNote ? <AiNote state={aiNote} detail={aiError} /> : null}

      {status === 'editing' ? (
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={24}
          className="font-mono text-[13px] leading-relaxed"
          aria-label="Texto del documento"
        />
      ) : (
        <DocumentBody text={text} />
      )}

      {streaming && !text ? (
        <p className="text-[13px] text-muted-foreground">Redactando con IA…</p>
      ) : null}

      {/* Iterating is how a draft becomes the report she meant. v1 had this and
          it is the difference between "regenerate and hope" and asking for the
          one change you actually want. */}
      <div className="no-print flex flex-wrap items-end gap-2 border-t border-border pt-4">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="adjustment" className="text-[12.5px] font-medium">
            ¿Querés ajustar algo?
          </label>
          <Input
            id="adjustment"
            value={adjustment}
            onChange={(event) => setAdjustment(event.target.value)}
            placeholder="Ej: más breve, y sumá una recomendación para el aula"
            disabled={streaming}
          />
        </div>
        <Button
          variant="secondary"
          disabled={streaming || !adjustment.trim()}
          onClick={() => {
            void generate(adjustment)
            setAdjustment('')
          }}
        >
          <Sparkles className="size-4" />
          Rehacer con el ajuste
        </Button>
      </div>
    </div>
  )
}

function AiNote({
  state,
  detail,
}: {
  state: 'ok' | 'failed' | 'saved'
  detail?: string | null
}) {
  if (state === 'failed') {
    return (
      <p className="no-print flex items-start gap-2 rounded-xl bg-amber-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#8a5a12]">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <span>
          {detail ?? 'La IA no respondió esta vez.'} Te dejamos un borrador base: revisalo y
          firmá.
        </span>
      </p>
    )
  }

  if (state === 'saved') {
    return (
      <p className="no-print flex items-start gap-2 rounded-xl bg-green-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#1a8f57]">
        <Check className="mt-0.5 size-4 shrink-0" />
        Guardado. Podés seguir editándolo cuando quieras.
      </p>
    )
  }

  return (
    <p className="no-print flex items-start gap-2 rounded-xl bg-violet-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-violet">
      <Sparkles className="mt-0.5 size-4 shrink-0" />
      Borrador asistido por IA. Revisá y editá lo que corresponda: el criterio clínico y la
      firma son tuyos.
    </p>
  )
}
