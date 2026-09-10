'use client'

import { Check, Pencil, Printer, RefreshCw, Sparkles, TriangleAlert } from '@/components/icons'
import { useEffect, useRef, useState } from 'react'

import { DocumentBody } from '@/components/documents/clinical-document'
import { DocumentDiff } from '@/components/documents/document-diff'
import { DocumentHistory } from '@/components/documents/document-history'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { readSseStream } from '@/lib/sse-client'
import type { DocumentVersion } from '@/server/document-versions'

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
 *
 * ─── La IA no pisa lo escrito ──────────────────────────────────────────────
 *
 * "Regenerar con IA" hacía exactamente eso: vaciaba la pantalla, escribía el
 * texto nuevo encima y lo guardaba. Cuarenta minutos de redacción y ajuste a
 * mano se perdían apretando un botón que dice "Regenerar", que suena a "hacelo
 * de nuevo" y no a "tirá lo que escribí". Es la peor pérdida de datos que tenía
 * la aplicación, porque lo que se perdía era criterio clínico escrito.
 *
 * Ahora, **si ya hay texto, la generación propone en vez de reemplazar**: llega
 * a un panel aparte, se muestra al lado de lo que hay —lo nuevo en su lugar, lo
 * que reemplaza tachado debajo— y no se guarda nada hasta apretar "Aplicar".
 *
 * La excepción es la primera generación, la que dispara `?ia=1` apenas se crea
 * el documento. Ahí lo que hay es el borrador base que escribió el propio
 * sistema al insertar la fila, no algo que alguien redactó, así que pedir que se
 * apruebe un cambio contra un texto que nadie escribió es una pantalla de más en
 * el camino más común. Esa primera vez entra directo — y aun así queda copiada,
 * porque el historial lo lleva `replaceDocumentBody` del lado del servidor y no
 * depende de que esta pantalla se acuerde.
 */
export function DocumentEditor({
  documentId,
  initialText,
  initialVersions,
  endpoint,
  idField,
  autoStart,
  onSave,
  onRestore,
}: {
  documentId: string
  initialText: string
  /** Las versiones que ya tenía el documento al abrir la pantalla. */
  initialVersions: DocumentVersion[]
  /** `/api/ai/informe` or `/api/ai/evaluacion`. */
  endpoint: string
  /** `reportId` or `assessmentId`. */
  idField: string
  /** Start generating as soon as the page opens. */
  autoStart: boolean
  /** Devuelve el historial ya actualizado, para no recargar la pantalla. */
  onSave: (text: string, reason: 'ai' | 'edit') => Promise<DocumentVersion[]>
  onRestore: (versionId: string) => Promise<{ body: string; versions: DocumentVersion[] }>
}) {
  const [text, setText] = useState(initialText)
  const [versions, setVersions] = useState(initialVersions)
  const [status, setStatus] = useState<'idle' | 'streaming' | 'editing' | 'saving'>(
    'idle',
  )
  // La propuesta de la IA mientras se decide qué hacer con ella. `done` la
  // separa en dos momentos: mientras llega se muestra el texto crudo, y recién
  // cuando termina se puede comparar contra lo que hay. Un diff recalculado en
  // cada chunk parpadea y no se puede leer.
  const [pending, setPending] = useState<{ text: string; done: boolean } | null>(null)
  // `kept` es `failed` cuando había texto propio: la IA no respondió y no se
  // tocó nada. Es otro mensaje porque el de `failed` promete un borrador base
  // que en ese caso no existe — lo que hay es lo que ella escribió, intacto.
  const [aiNote, setAiNote] = useState<'ok' | 'failed' | 'kept' | 'saved' | null>(null)
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
    // La única que reemplaza sin preguntar. Ver la nota de arriba.
    void generate(undefined, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  async function generate(withAdjustment?: string, replaceDirectly = false) {
    const proposing = !replaceDirectly && text.trim() !== ''

    setStatus('streaming')
    setAiNote(null)
    setAiError(null)
    setPending(proposing ? { text: '', done: false } : null)
    if (!proposing) setText('')

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
        if (!proposing) setText(initialText)
        setPending(null)
        setAiNote(proposing ? 'kept' : 'failed')
        setAiError(typeof payload?.error === 'string' ? payload.error : null)
        setStatus('idle')
        return
      }

      await readSseStream(response.body, {
        onDelta: (chunk) => {
          received += chunk
          if (proposing) setPending({ text: received, done: false })
          else setText(received)
        },
        onError: (message) => {
          failed = true
          setAiNote(proposing ? 'kept' : 'failed')
          setAiError(message)
        },
      })
    } catch {
      failed = true
      setAiNote(proposing ? 'kept' : 'failed')
    }

    if (failed || !received.trim()) {
      // The offline draft is still better than an empty page: the practitioner
      // has something to edit and sign rather than a dead screen. Cuando hay
      // texto propio no se toca nada — el borrador de emergencia no vale lo que
      // ya está escrito.
      if (!proposing) setText(initialText)
      setPending(null)
      setAiNote(proposing ? 'kept' : 'failed')
      setStatus('idle')
      return
    }

    setStatus('idle')

    if (proposing) {
      setPending({ text: received.trim(), done: true })
      return
    }

    setAiNote('ok')
    await save(received, 'ai')
  }

  async function save(next: string, reason: 'ai' | 'edit') {
    setStatus('saving')
    setVersions(await onSave(next, reason))
    setStatus('idle')
    setAiNote('saved')
  }

  async function apply() {
    if (!pending?.done) return
    const next = pending.text
    setPending(null)
    setText(next)
    await save(next, 'ai')
  }

  async function restore(versionId: string) {
    const restored = await onRestore(versionId)
    setText(restored.body)
    setVersions(restored.versions)
    setPending(null)
    setAiNote(null)
    setAiError(null)
    setStatus('idle')
  }

  const streaming = status === 'streaming'
  const proposal = pending?.done ? pending.text : null
  const applicable = proposal !== null && proposal !== text

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center gap-2">
        {status === 'editing' ? (
          <Button onClick={() => void save(text, 'edit').then(() => setStatus('idle'))}>
            <Check className="size-4" />
            Guardar cambios
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setStatus('editing')}
            disabled={streaming || pending !== null}
          >
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
          className="font-mono text-body leading-relaxed"
          aria-label="Texto del documento"
        />
      ) : (
        <DocumentBody text={text} />
      )}

      {streaming && !text && !pending ? (
        <p className="text-body text-muted-foreground">Redactando con IA…</p>
      ) : null}

      {pending ? (
        <Proposal
          before={text}
          pending={pending}
          applicable={applicable}
          onApply={() => void apply()}
          onDiscard={() => setPending(null)}
        />
      ) : null}

      {/* Iterating is how a draft becomes the report she meant. v1 had this and
          it is the difference between "regenerate and hope" and asking for the
          one change you actually want. */}
      <div className="no-print flex flex-wrap items-end gap-2 border-t border-border pt-4">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="adjustment" className="text-meta font-medium">
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

      <DocumentHistory
        versions={versions}
        onRestore={restore}
        disabled={streaming || status === 'saving'}
      />
    </div>
  )
}

/**
 * La propuesta, mientras llega y cuando está lista.
 *
 * El aviso de que no se guardó nada va arriba y el de que aplicar reemplaza va
 * pegado a los botones. Los dos, y no uno: el primero es lo que hay que saber
 * para leer tranquila, el segundo es lo que hay que saber para decidir.
 */
function Proposal({
  before,
  pending,
  applicable,
  onApply,
  onDiscard,
}: {
  before: string
  pending: { text: string; done: boolean }
  applicable: boolean
  onApply: () => void
  onDiscard: () => void
}) {
  return (
    <div className="no-print space-y-3 rounded-xl border-2 border-violet p-3.5">
      <p className="flex items-start gap-2 text-meta leading-relaxed text-violet">
        <Sparkles className="mt-0.5 size-4 shrink-0" />
        <span>
          {pending.done
            ? 'Esto es lo que propone la IA. Todavía no se guardó nada: tu texto sigue como está.'
            : 'La IA está escribiendo una propuesta. Tu texto sigue intacto arriba.'}
        </span>
      </p>

      {!pending.done ? (
        <p className="whitespace-pre-wrap text-body leading-[1.65] text-muted-foreground">
          {pending.text || 'Redactando…'}
        </p>
      ) : applicable ? (
        <DocumentDiff before={before} after={pending.text} />
      ) : (
        <p className="text-body text-muted-foreground">
          La IA escribió lo mismo que ya tenías. No hay nada para aplicar.
        </p>
      )}

      {pending.done ? (
        <>
          <p className="text-meta leading-relaxed text-muted-foreground">
            Aplicar reemplaza el texto actual. Lo que hay ahora queda guardado en
            &quot;Versiones anteriores&quot;, así que siempre podés volver.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onApply} disabled={!applicable}>
              <Check className="size-4" />
              Aplicar
            </Button>
            <Button variant="ghost" onClick={onDiscard}>
              Descartar
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}

function AiNote({
  state,
  detail,
}: {
  state: 'ok' | 'failed' | 'kept' | 'saved'
  detail?: string | null
}) {
  if (state === 'kept') {
    return (
      <p className="no-print flex items-start gap-2 rounded-xl bg-amber-soft px-3.5 py-2.5 text-meta leading-relaxed text-[#8a5a12]">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <span>
          {detail ?? 'La IA no respondió esta vez.'} No se cambió nada: tu texto quedó como
          estaba.
        </span>
      </p>
    )
  }

  if (state === 'failed') {
    return (
      <p className="no-print flex items-start gap-2 rounded-xl bg-amber-soft px-3.5 py-2.5 text-meta leading-relaxed text-[#8a5a12]">
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
      <p className="no-print flex items-start gap-2 rounded-xl bg-green-soft px-3.5 py-2.5 text-meta leading-relaxed text-[#1a8f57]">
        <Check className="mt-0.5 size-4 shrink-0" />
        Guardado. Podés seguir editándolo cuando quieras.
      </p>
    )
  }

  return (
    <p className="no-print flex items-start gap-2 rounded-xl bg-violet-soft px-3.5 py-2.5 text-meta leading-relaxed text-violet">
      <Sparkles className="mt-0.5 size-4 shrink-0" />
      Borrador asistido por IA. Revisá y editá lo que corresponda: el criterio clínico y la
      firma son tuyos.
    </p>
  )
}
