'use client'

import { useState } from 'react'

import { FormMessage } from '@/components/auth/form-message'
import { FileText, Sparkles } from '@/components/icons'
import { PatientForm } from '@/components/patients/patient-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FILE_INPUT =
  'w-full rounded-lg border border-input bg-background p-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-violet-soft file:px-3 file:py-1.5 file:text-body file:font-bold file:text-violet focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * "Nuevo paciente", with the option of starting from a document.
 *
 * The practitioner writes the name herself and picks the file; Ombúa reads the
 * rest — birth date, school, guardian, reason for consultation — and the form
 * below arrives filled in for her to check and save. The name is asked for here
 * and not read from the document because it is the one thing Ombúa does not
 * send to the AI. See `src/server/patient-document.ts`.
 *
 * The form is remounted with a new `key` when the draft arrives: its fields are
 * uncontrolled, and a `defaultValue` only counts on the first render.
 */
export function PatientFromDocument() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filled, setFilled] = useState<number | null>(null)
  const [prefill, setPrefill] = useState<Record<string, string> | undefined>()
  const [version, setVersion] = useState(0)

  async function read() {
    if (!file || name.trim().length < 2) return
    setReading(true)
    setError(null)

    try {
      const body = new FormData()
      body.set('fullName', name.trim())
      body.set('file', file)
      const response = await fetch('/api/ai/paciente-documento', { method: 'POST', body })
      const result = (await response.json().catch(() => ({}))) as {
        draft?: Record<string, string>
        error?: string
      }
      if (!response.ok || !result.draft) {
        throw new Error(result.error ?? 'No pudimos leer el documento. Completá los datos a mano.')
      }

      setPrefill({ fullName: name.trim(), ...result.draft })
      setFilled(Object.keys(result.draft).length)
      setVersion((count) => count + 1)
      setOpen(false)
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setReading(false)
    }
  }

  return (
    <div className="space-y-5">
      {open ? (
        <section
          aria-labelledby="from-document"
          className="space-y-4 rounded-2xl border border-violet/25 bg-violet-soft/40 p-4"
        >
          <div>
            <h2 id="from-document" className="text-body font-bold">
              Completar con IA desde un documento
            </h2>
            <p className="mt-0.5 text-meta leading-relaxed text-muted-foreground">
              Una ficha de ingreso, una derivación, un informe anterior o una foto de tu
              cuaderno. Escribí el nombre del paciente y Ombúa completa el resto; vos lo
              revisás antes de guardar.
            </p>
          </div>

          <FormMessage message={error} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="document-name">Nombre y apellido del paciente</Label>
              <Input
                id="document-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="document-file">El documento</Label>
              <input
                id="document-file"
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className={FILE_INPUT}
              />
              <p className="text-xs text-muted-foreground">Word, PDF, JPG o PNG. Hasta 4 MB.</p>
            </div>
          </div>

          <p className="rounded-xl bg-amber-soft px-3 py-2.5 text-meta leading-relaxed text-amber-ink">
            Para leerlo, Ombúa le manda el documento al modelo de IA. El nombre que escribís
            acá no se manda, y en un Word lo tapamos antes de enviarlo. En un PDF o una foto
            no se puede tapar: si el nombre está escrito, viaja con el archivo.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void read()}
              disabled={reading || !file || name.trim().length < 2}
            >
              <Sparkles className="size-4" />
              {reading ? 'Leyendo el documento…' : 'Completar la ficha'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={reading}>
              Cancelar
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-muted/60 px-4 py-3">
          <p className="min-w-0 flex-1 basis-60 text-meta leading-relaxed">
            {filled !== null ? (
              <>
                <b>Ombúa completó {filled} {filled === 1 ? 'dato' : 'datos'}</b> leyendo el
                documento. Revisalos antes de guardar.
              </>
            ) : (
              '¿Ya tenés su ficha en un documento? Ombúa la lee y completa los datos por vos.'
            )}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            <FileText className="size-4" />
            {filled !== null ? 'Leer otro documento' : 'Completar con IA'}
          </Button>
        </div>
      )}

      <PatientForm key={version} prefill={prefill} />
    </div>
  )
}
