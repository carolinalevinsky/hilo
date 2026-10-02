'use client'

import { Globe, Lock, RefreshCw, Sparkles, TriangleAlert } from '@/components/icons'
import { useActionState, useEffect, useRef, useState } from 'react'

import { createMaterialAction, updateMaterialAction } from '@/app/(app)/materiales/actions'
import { FormMessage } from '@/components/auth/form-message'
import { MaterialAttachment } from '@/components/materials/material-attachment'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { AGE_RANGES, MATERIAL_KIND_LABELS } from '@/lib/material-areas'
import { readSseStream } from '@/lib/sse-client'
import { cn } from '@/lib/utils'
import type { Material, MaterialFileLinks, MaterialVisibility } from '@/server/materials'

/**
 * The strip above the activity field while Ombúa writes into it, and after.
 *
 * Three tones because they are three different things to be told. `working`
 * means wait: the field is being written and is locked until it ends. `info` is
 * a note about where the text came from. `warning` means the model did not
 * finish, and it is amber with its own icon because in violet with a sparkle it
 * read as one more hint and the practitioner saved a generic activity believing
 * it was the one she asked for.
 */
type Notice = { tone: 'working' | 'info' | 'warning'; text: string }

/**
 * The stream closed without saying how it ended — no `done`, no `error`. A
 * serverless timeout looks like this: the connection just stops. Without a
 * sentence for it the strip stayed on "está escribiendo…" forever.
 */
const STREAM_DROPPED = 'Se cortó la conexión antes de terminar. Revisá lo que quedó antes de guardarlo.'

/**
 * Writing or editing a material.
 *
 * One form for both, as everywhere else in Ombúa: the fields are identical and
 * two of them would drift. `material` being present is what switches it.
 *
 * The visibility selector is v1's (`legacy/index.html:823-836`) and in v1 it did
 * nothing — a "published" material lived in an array in memory until the tab was
 * reloaded. Here it is real, which is why the authorship declaration is a
 * requirement the server enforces and not a checkbox that only looks serious.
 */
export function MaterialForm({
  areas,
  material,
  generateFor,
  describeFile = false,
  file = null,
}: {
  areas: Record<string, string[]>
  material?: Material
  /**
   * What was asked for, when arriving from "Generar con IA". The model writes
   * into the activity field as soon as the form is on screen.
   */
  generateFor?: string
  /** Arriving from "Subir un material": read the file and fill the three fields. */
  describeFile?: boolean
  /** Signed links for the attached file, so it can be looked at while editing. */
  file?: MaterialFileLinks | null
}) {
  const [state, formAction, pending] = useActionState(
    material ? updateMaterialAction : createMaterialAction,
    EMPTY_FORM_STATE,
  )
  const [area, setArea] = useState(material?.area ?? Object.keys(areas)[0] ?? '')
  const [ownWork, setOwnWork] = useState(false)
  const [visibility, setVisibility] = useState<MaterialVisibility>(
    material?.visibility === 'public' ? 'public' : 'private',
  )

  const content = useRef<HTMLTextAreaElement>(null)
  const title = useRef<HTMLInputElement>(null)
  const objective = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<Notice | null>(
    generateFor
      ? { tone: 'working', text: 'Ombúa está escribiendo la actividad…' }
      : describeFile
        ? { tone: 'working', text: 'Ombúa está leyendo el archivo…' }
        : null,
  )
  // Whether "Probar de nuevo" is offered: only after a generation that failed.
  const [canRetry, setCanRetry] = useState(false)
  const started = useRef(false)
  const [adjusting, setAdjusting] = useState(false)
  const [adjustment, setAdjustment] = useState('')

  // The field is being written by the model. Typing into it now would be
  // interleaved with the stream, and saving now would save half an activity.
  const busy = notice?.tone === 'working'

  /**
   * "Modificar con IA" — v1's button, doing what it said.
   *
   * v1 appended a canned paragraph based on which words it spotted in your
   * request; this rewrites the activity. The old text goes back if the request
   * fails, because losing an activity you had is worse than not changing it.
   */
  async function adjust() {
    const field = content.current
    // `busy` too: Enter in the box gets here without passing by the button.
    if (!material || !field || !adjustment.trim() || busy) return

    const previous = field.value
    setNotice({ tone: 'working', text: 'Ombúa está ajustando la actividad…' })
    setCanRetry(false)
    setAdjusting(true)
    field.value = ''

    let failure: string | null = null
    let finished = false

    try {
      const response = await fetch('/api/ai/material', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ materialId: material.id, adjustment }),
      })
      if (!response.ok || !response.body) {
        const { error } = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(error ?? 'No pudimos ajustar la actividad.')
      }

      await readSseStream(response.body, {
        onDelta: (text) => {
          if (content.current) content.current.value += text
        },
        onError: (message) => {
          failure = message
        },
        onDone: () => {
          finished = true
        },
      })

      if (finished) {
        setNotice(null)
        setAdjustment('')
      } else {
        // The request stays in the box: asking again is one click.
        setNotice({ tone: 'warning', text: failure ?? STREAM_DROPPED })
      }
    } catch (error) {
      if (content.current) content.current.value = previous
      setNotice({
        tone: 'warning',
        text: `${(error as Error).message} Te dejo la actividad como estaba.`,
      })
    } finally {
      setAdjusting(false)
    }
  }

  // Reads the uploaded file and fills the three fields, once.
  //
  // It answers all at once rather than streaming: the reply is three sections
  // that only mean anything split apart, so there is nothing worth showing until
  // it is whole. What arrives is a draft in a form the practitioner is already
  // looking at — nothing is saved until they press the button.
  useEffect(() => {
    if (!describeFile || !material || started.current) return
    started.current = true

    fetch('/api/ai/material-archivo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ materialId: material.id }),
    })
      .then(async (response) => {
        const body = (await response.json()) as {
          title?: string
          objective?: string
          content?: string
          error?: string
        }
        if (!response.ok) throw new Error(body.error ?? 'No pudimos leer el archivo.')

        if (title.current && body.title) title.current.value = body.title
        if (objective.current && body.objective) objective.current.value = body.objective
        if (content.current && body.content) content.current.value = body.content

        setNotice({
          tone: 'info',
          text: 'Lo escribió Ombúa leyendo el archivo. Revisalo y corregí lo que haga falta.',
        })
      })
      .catch((error: Error) => {
        setNotice({ tone: 'warning', text: `${error.message} Escribí la descripción a mano.` })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Streams the generated activity into the field.
  //
  // It writes through the ref rather than through state, for the same reason the
  // remembered email does: this is a `defaultValue` textarea the practitioner is
  // about to edit, and turning it into a controlled input to receive one stream
  // would fight every keystroke afterwards.
  async function streamActivity() {
    if (!generateFor || !material) return

    const field = content.current
    if (field) field.value = ''

    let failure: string | null = null
    let finished = false

    try {
      const response = await fetch('/api/ai/material', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ materialId: material.id, request: generateFor }),
      })
      if (!response.ok || !response.body) {
        const { error } = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(error ?? 'No pudimos generar la actividad.')
      }

      await readSseStream(response.body, {
        onDelta: (text) => {
          if (content.current) content.current.value += text
        },
        onError: (message) => {
          failure = message
        },
        onDone: () => {
          finished = true
        },
      })

      if (finished) {
        setNotice(null)
        return
      }
      setNotice({ tone: 'warning', text: failure ?? STREAM_DROPPED })
    } catch (error) {
      setNotice({
        tone: 'warning',
        text: `${(error as Error).message} Te dejo la actividad base para editar.`,
      })
      // Whatever the server already saved is still in the row, and the
      // practitioner is told rather than left looking at an empty field.
      if (content.current && !content.current.value) {
        content.current.value = material.content
      }
    }

    // Every way of getting here is a generation that did not finish, and the
    // row is already counted against the month (`alreadyCounted` in the route),
    // so asking again costs the practitioner nothing.
    setCanRetry(true)
  }

  function retry() {
    setCanRetry(false)
    setNotice({ tone: 'working', text: 'Ombúa está escribiendo la actividad…' })
    void streamActivity()
  }

  // Once, on arriving from "Generar con IA".
  useEffect(() => {
    if (!generateFor || !material || started.current) return
    started.current = true
    void streamActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />
      {material ? <input type="hidden" name="materialId" value={material.id} /> : null}

      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          ref={title}
          id="title"
          name="title"
          placeholder="Ej: Bingo de sonidos iniciales"
          defaultValue={material?.title ?? ''}
          required
          // Not while Ombúa is filling the form in: a focus ring on the title
          // points at the one field where nothing is happening.
          autoFocus={!generateFor && !describeFile}
        />
      </div>

      {/* The attached file, shown while you correct a description that was
          written from it — which is the whole reason it is here and not behind
          a link. Shorter than on the material's own page: this is a reference
          beside a form, not the thing you came to read. */}
      {file ? (
        <MaterialAttachment
          url={file.url}
          downloadUrl={file.downloadUrl}
          fileType={material?.file_type ?? null}
          title={material?.title ?? 'el material'}
          height={340}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="area">Área</Label>
          <NativeSelect
            id="area"
            name="area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            required
          >
            {Object.keys(areas).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="focus" className="block leading-snug sm:leading-none">
            Dentro del área
            <span className="font-normal text-muted-foreground"> ·&nbsp;opcional</span>
          </Label>
          <NativeSelect id="focus" name="focus" defaultValue={material?.focus ?? ''}>
            <option value="">Sin especificar</option>
            {(areas[area] ?? []).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kind">Tipo</Label>
          <NativeSelect id="kind" name="kind" defaultValue={material?.kind ?? 'activity'}>
            {Object.entries(MATERIAL_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ageRange" className="block leading-snug sm:leading-none">
            Edad
            <span className="font-normal text-muted-foreground"> ·&nbsp;opcional</span>
          </Label>
          <NativeSelect id="ageRange" name="ageRange" defaultValue={material?.age_range ?? ''}>
            <option value="">Cualquier edad</option>
            {AGE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="objective">¿Para qué sirve?</Label>
        <Input
          ref={objective}
          id="objective"
          name="objective"
          placeholder="Ej: Identificar con qué sonido empieza cada palabra"
          defaultValue={material?.objective ?? ''}
        />
        <p className="text-xs text-muted-foreground">
          Con esto Ombúa te lo sugiere solo cuando tenés un objetivo parecido.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">La actividad</Label>
        {notice ? (
          <div
            role={notice.tone === 'warning' ? 'alert' : 'status'}
            className={cn(
              'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2.5 text-meta leading-relaxed',
              notice.tone === 'warning'
                ? 'bg-amber-soft text-[#8a5a12]'
                : 'bg-violet-soft text-violet',
            )}
          >
            <span className="flex min-w-0 flex-1 basis-60 items-start gap-2">
              {notice.tone === 'warning' ? (
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              ) : (
                <Sparkles className={cn('mt-0.5 size-4 shrink-0', busy && 'animate-pulse')} />
              )}
              {notice.text}
            </span>
            {canRetry ? (
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                <RefreshCw />
                Probar de nuevo
              </Button>
            ) : null}
          </div>
        ) : null}
        <Textarea
          ref={content}
          id="content"
          name="content"
          rows={12}
          required
          readOnly={busy}
          aria-busy={busy}
          defaultValue={material?.content ?? ''}
          // Empty while Ombúa writes: the example in an emptied field read as
          // the first lines of the activity arriving.
          placeholder={busy ? '' : `Cómo se juega:\nSe dice una palabra en voz alta y el niño marca la imagen que empieza con el mismo sonido.\n\nMateriales:\nCartones impresos y fichas.`}
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Los renglones cortos que terminan en dos puntos, como{' '}
          <b className="font-semibold">Materiales:</b>, se ven como títulos cuando lo
          imprimís. Todo lo demás queda como texto común.
        </p>

        {/* v1's "Modificar con IA", with v1's own placeholder — those three
            examples are the three things a practitioner actually asks for. */}
        {material ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <Input
              value={adjustment}
              onChange={(event) => setAdjustment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  // Inside a form: Enter here means "adjust", not "save".
                  event.preventDefault()
                  void adjust()
                }
              }}
              placeholder="¿Qué querés cambiar? más fácil · con temática de animales · para 4º"
              aria-label="Qué querés cambiar de la actividad"
              className="min-w-[200px] flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void adjust()}
              disabled={busy || !adjustment.trim()}
            >
              <Sparkles className="size-4" />
              {adjusting ? 'Ajustando…' : 'Modificar con IA'}
            </Button>
          </div>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-medium">Visibilidad</legend>

        {/* v1's `.seg`: two halves of one control, not two checkboxes. */}
        <div className="flex gap-1.5 rounded-xl border border-border bg-muted/60 p-1">
          <VisibilityOption
            icon={Lock}
            label="Privado · solo para mí"
            value="private"
            current={visibility}
            onPick={setVisibility}
          />
          <VisibilityOption
            icon={Globe}
            label="Público · comunidad"
            value="public"
            current={visibility}
            onPick={setVisibility}
          />
        </div>
        <input type="hidden" name="visibility" value={visibility} />

        <p className="rounded-xl bg-violet-soft px-3 py-2.5 text-meta text-violet">
          {visibility === 'public'
            ? 'Público: cualquier profesional de Ombúa lo ve en su biblioteca y puede copiarlo, con tu nombre. Vos seguís siendo quien lo edita.'
            : 'Privado: queda solo en tu biblioteca. Nadie más lo ve.'}
        </p>

        {visibility === 'public' ? (
          <Label
            htmlFor="ownWork"
            className="flex items-start gap-2.5 text-meta leading-relaxed font-normal"
          >
            <Checkbox
              id="ownWork"
              name="ownWork"
              className="mt-0.5"
              checked={ownWork}
              onCheckedChange={(value) => setOwnWork(value === true)}
            />
            <span>
              Declaro que este material es de mi autoría o tengo permiso para compartirlo, y
              que no incluye contenido con derechos de autor de terceros.
            </span>
          </Label>
        ) : null}
      </fieldset>

      {/* Deshabilitado hasta marcar la declaración, en vez de dejar apretar y
          contestar con un error. El servidor la sigue validando —`materials.ts`
          es lo que manda, y una casilla del navegador no protege nada— pero
          llegar al error después de intentar no le sirve a nadie. */}
      <Button
        type="submit"
        size="lg"
        disabled={pending || busy || (visibility === 'public' && !ownWork)}
        className="max-sm:w-full"
      >
        {pending
          ? 'Guardando…'
          : visibility === 'public'
            ? 'Publicar en la comunidad'
            : material
              ? 'Guardar cambios'
              : 'Guardar en mi biblioteca'}
      </Button>
    </form>
  )
}

function VisibilityOption({
  icon: Icon,
  label,
  value,
  current,
  onPick,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement
  label: string
  value: MaterialVisibility
  current: MaterialVisibility
  onPick: (value: MaterialVisibility) => void
}) {
  const active = current === value

  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={active}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-meta font-bold transition-colors',
        active ? 'bg-card text-violet shadow-card' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-[15px]" />
      {label}
    </button>
  )
}

