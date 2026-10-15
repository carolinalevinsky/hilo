'use client'

import { useState, useTransition } from 'react'

import { importPatientsAction, previewPatientImportAction } from '@/app/(app)/pacientes/import-actions'
import { FormMessage } from '@/components/auth/form-message'
import { Upload } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/dates'
import {
  AGE_GROUP_LABELS,
  IMPORT_FIELD_LABELS,
  IMPORT_FIELDS,
  type ImportField,
} from '@/lib/patient-labels'
import { cn } from '@/lib/utils'
import type { ImportPreview, ImportRow } from '@/server/patient-import'

const DATE_FIELDS: ImportField[] = ['dateOfBirth', 'startDate']

/**
 * Bringing a spreadsheet of patients in: choose the file, look at what Ombúa
 * understood, untick what is wrong, confirm.
 *
 * The table shows only the columns that were recognised, so a sheet with a name
 * and a phone is a two-column table and not ten columns of dashes. Somebody
 * already in Ombúa arrives unticked: importing the same list twice is the most
 * likely mistake on this screen, and a duplicated patient is a ficha split in
 * two.
 */
export function PatientImport() {
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [chosen, setChosen] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [reading, startReading] = useTransition()
  const [saving, startSaving] = useTransition()

  function read(form: HTMLFormElement) {
    const data = new FormData(form)
    setError(null)
    startReading(async () => {
      const result = await previewPatientImportAction(data)
      if ('error' in result) {
        setError(result.error)
        setPreview(null)
        return
      }
      setPreview(result.preview)
      setChosen(
        new Set(result.preview.rows.flatMap((row, index) => (row.duplicate ? [] : [index]))),
      )
    })
  }

  function save() {
    if (!preview) return
    const rows = preview.rows.filter((_, index) => chosen.has(index)).map(toPatientInput)
    setError(null)
    startSaving(async () => {
      // Returns only when something went wrong; on success it redirects.
      const result = await importPatientsAction(rows)
      if (result?.error) setError(result.error)
    })
  }

  function toggle(index: number) {
    setChosen((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const fields = preview
    ? IMPORT_FIELDS.filter((field) => preview.rows.some((row) => row.values[field]))
    : []

  return (
    <div className="space-y-5">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          read(event.currentTarget)
        }}
        className="space-y-3"
      >
        <div className="space-y-1.5">
          <Label htmlFor="patients-file">Tu planilla</Label>
          <input
            id="patients-file"
            name="file"
            type="file"
            required
            accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="w-full rounded-lg border border-input bg-background p-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-violet-soft file:px-3 file:py-1.5 file:text-body file:font-bold file:text-violet focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Excel (.xlsx) o CSV, con los títulos en la primera fila. Desde Google Sheets:
            Archivo → Descargar → Microsoft Excel. La planilla no sale de Ombúa: la leemos
            acá, sin IA.
          </p>
        </div>
        {/* Elegir el archivo ya la lee; el botón queda para volver a leerla
            después de corregirla, sin tener que elegirla de nuevo. */}
        <Button type="submit" variant="outline" disabled={reading}>
          {reading ? 'Leyendo la planilla…' : 'Leer la planilla'}
        </Button>
      </form>

      <FormMessage message={error} />

      {preview ? (
        <div className="space-y-4">
          <div className="space-y-1 text-meta leading-relaxed">
            <p>
              Encontramos <b>{preview.rows.length}</b>{' '}
              {preview.rows.length === 1 ? 'paciente' : 'pacientes'}. Revisá la tabla y
              destildá a quien no quieras cargar.
            </p>
            <p className="text-muted-foreground">
              Columnas que usamos:{' '}
              {preview.recognised
                .map(({ title, field }) =>
                  title.trim().toLowerCase() === IMPORT_FIELD_LABELS[field].toLowerCase()
                    ? title
                    : `${title} → ${IMPORT_FIELD_LABELS[field]}`,
                )
                .join(' · ')}
            </p>
            {preview.ignored.length > 0 ? (
              <p className="text-muted-foreground">
                No se cargan: {preview.ignored.join(' · ')}. Si las necesitás, las agregás
                después en cada ficha.
              </p>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-meta">
              <thead className="bg-muted/60 text-micro font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <span className="sr-only">Cargar</span>
                  </th>
                  {fields.map((field) => (
                    <th key={field} className="px-3 py-2 whitespace-nowrap">
                      {IMPORT_FIELD_LABELS[field]}
                    </th>
                  ))}
                  <th className="px-3 py-2">Población</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, index) => (
                  <PreviewRow
                    key={row.line}
                    row={row}
                    fields={fields}
                    checked={chosen.has(index)}
                    onToggle={() => toggle(index)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={save} disabled={saving || chosen.size === 0}>
              <Upload className="size-4" />
              {saving
                ? 'Cargando…'
                : `Cargar ${chosen.size} ${chosen.size === 1 ? 'paciente' : 'pacientes'}`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Después podés completar cada ficha cuando quieras.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PreviewRow({
  row,
  fields,
  checked,
  onToggle,
}: {
  row: ImportRow
  fields: ImportField[]
  checked: boolean
  onToggle: () => void
}) {
  const id = `import-row-${row.line}`
  return (
    <>
      <tr className={cn('border-t border-border align-top', !checked && 'text-muted-foreground')}>
        <td className="px-3 py-2">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            aria-label={`Cargar a ${row.values.fullName}`}
            className="size-4 accent-violet"
          />
        </td>
        {fields.map((field) => (
          <td key={field} className="max-w-[260px] px-3 py-2">
            {field === 'fullName' ? (
              <label htmlFor={id} className="font-semibold">
                {row.values.fullName}
                {row.duplicate ? (
                  <span className="ml-1.5 rounded-full bg-amber-soft px-2 py-0.5 text-micro font-bold text-amber-ink">
                    Ya está en Ombúa
                  </span>
                ) : null}
              </label>
            ) : DATE_FIELDS.includes(field) ? (
              (formatDate(row.values[field]) ?? '—')
            ) : (
              <span className="line-clamp-2">{row.values[field] ?? '—'}</span>
            )}
          </td>
        ))}
        <td className="px-3 py-2 whitespace-nowrap">{AGE_GROUP_LABELS[row.ageGroup]}</td>
      </tr>
      {row.notes.length > 0 ? (
        <tr>
          <td />
          <td colSpan={fields.length + 1} className="px-3 pb-2 text-xs text-amber-ink">
            Fila {row.line}: {row.notes.join(' ')}
          </td>
        </tr>
      ) : null}
    </>
  )
}

/** A preview row in the shape `PatientInput` takes — the same one the form sends. */
function toPatientInput(row: ImportRow) {
  return {
    ...row.values,
    ageGroup: row.ageGroup,
    guardianRelationship: row.guardianRelationship,
  }
}
