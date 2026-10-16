'use client'

import { useState, useTransition } from 'react'

import { importPlanningAction } from '@/app/(app)/materiales/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Sparkles } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileInput } from '@/components/ui/file-input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { AGE_RANGES, MATERIAL_KIND_LABELS } from '@/lib/material-areas'
import { cn } from '@/lib/utils'
import type { ImportedActivity } from '@/server/planning-import'

type Draft = ImportedActivity & { keep: boolean }

/**
 * Bringing a plan in: pick the file, Ombúa proposes one material per activity,
 * the practitioner corrects and unticks, and saves.
 *
 * Every field of every proposal is editable here, before anything exists,
 * because fixing ten activities after the fact means opening ten edit pages.
 * The content sits in a collapsed block — ten open textareas are a wall — and
 * opens with one click for whoever wants to read before saving.
 */
export function PlanningImport({ areas }: { areas: string[] }) {
  const [file, setFile] = useState<File | null>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [saving, startSaving] = useTransition()

  async function read() {
    if (!file) return
    setReading(true)
    setError(null)
    setDrafts(null)

    try {
      const body = new FormData()
      body.set('file', file)
      const response = await fetch('/api/ai/planificacion', { method: 'POST', body })
      const result = (await response.json().catch(() => ({}))) as {
        activities?: ImportedActivity[]
        error?: string
      }
      if (!response.ok || !result.activities) {
        throw new Error(result.error ?? 'No pudimos leer la planificación. Probá de nuevo.')
      }
      setDrafts(result.activities.map((activity) => ({ ...activity, keep: true })))
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setReading(false)
    }
  }

  function change(index: number, patch: Partial<Draft>) {
    setDrafts((current) =>
      current ? current.map((draft, i) => (i === index ? { ...draft, ...patch } : draft)) : current,
    )
  }

  function save() {
    if (!drafts) return
    const kept = drafts
      .filter((draft) => draft.keep)
      .map((draft) => ({
        title: draft.title,
        area: draft.area,
        kind: draft.kind,
        ageRange: draft.ageRange,
        objective: draft.objective,
        content: draft.content,
      }))
    setError(null)
    startSaving(async () => {
      // Returns only when something went wrong; on success it redirects.
      const result = await importPlanningAction(kept)
      if (result?.error) setError(result.error)
    })
  }

  const count = drafts?.filter((draft) => draft.keep).length ?? 0

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="rounded-xl bg-amber-soft px-3 py-2.5 text-meta leading-relaxed text-amber-ink">
          Para leerla, Ombúa le manda el archivo al modelo de IA. Fijate que no tenga el
          nombre de ningún paciente: si lo tiene, borralo del Word antes de subirlo, o tapalo
          en la foto. Lo que se guarda son las actividades, nunca datos de pacientes.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="planning-file">Tu planificación</Label>
          <FileInput
            id="planning-file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            Word, PDF o una foto (JPG o PNG). Hasta 4 MB. Si tenés varias, subilas de a una.
          </p>
        </div>

        <Button type="button" size="lg" onClick={() => void read()} disabled={!file || reading}>
          <Sparkles className="size-4" />
          {reading ? 'Leyendo la planificación…' : 'Leer las actividades'}
        </Button>
        {reading ? (
          <p className="text-meta text-muted-foreground">
            Una planificación larga puede tardar un minuto.
          </p>
        ) : null}
      </div>

      <FormMessage message={error} />

      {drafts ? (
        <div className="space-y-4">
          <p className="text-meta leading-relaxed">
            Encontramos <b>{drafts.length}</b>{' '}
            {drafts.length === 1 ? 'actividad' : 'actividades'}. Corregí lo que haga falta y
            destildá las que no quieras guardar.
          </p>

          <ol className="space-y-3">
            {drafts.map((draft, index) => (
              <li
                key={index}
                className={cn(
                  'space-y-3 rounded-2xl border border-border p-4',
                  !draft.keep && 'opacity-60',
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={draft.keep}
                    onChange={(event) => change(index, { keep: event.target.checked })}
                    aria-label={`Guardar «${draft.title}»`}
                    className="mt-2.5 size-4 shrink-0 accent-violet"
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Input
                      value={draft.title}
                      onChange={(event) => change(index, { title: event.target.value })}
                      aria-label="Título"
                      className="font-semibold"
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <NativeSelect
                        value={draft.area}
                        onChange={(event) => change(index, { area: event.target.value })}
                        aria-label="Área"
                      >
                        {areas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </NativeSelect>
                      <NativeSelect
                        value={draft.kind}
                        onChange={(event) =>
                          change(index, { kind: event.target.value as Draft['kind'] })
                        }
                        aria-label="Tipo"
                      >
                        {Object.entries(MATERIAL_KIND_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </NativeSelect>
                      <NativeSelect
                        value={draft.ageRange ?? ''}
                        onChange={(event) => change(index, { ageRange: event.target.value || null })}
                        aria-label="Edad"
                      >
                        <option value="">Cualquier edad</option>
                        {AGE_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                    {draft.objective ? (
                      <p className="text-meta text-muted-foreground">{draft.objective}</p>
                    ) : null}
                    <details>
                      <summary className="cursor-pointer text-meta font-semibold text-violet">
                        Ver y corregir la actividad
                      </summary>
                      <Textarea
                        value={draft.content}
                        onChange={(event) => change(index, { content: event.target.value })}
                        rows={10}
                        aria-label="La actividad"
                        className="mt-2"
                      />
                    </details>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={save} disabled={saving || count === 0}>
              {saving
                ? 'Guardando…'
                : `Guardar ${count} ${count === 1 ? 'actividad' : 'actividades'}`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Quedan privadas en tu biblioteca, listas para sumar a una sesión o ajustar con IA.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
