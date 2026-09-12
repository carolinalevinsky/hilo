'use client'

import { Trash2 } from '@/components/icons'
import { useState } from 'react'

import { deleteTemplateAction } from '@/app/(app)/prompt-template-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const CUSTOM_INSTRUCTIONS_MAX = 4000

/**
 * "Tus instrucciones" — the practitioner's own prompt, inside the report and
 * assessment forms (P20).
 *
 * Collapsed by default: most documents do not need it, and a first-time form
 * with one more big box in it is a worse form. Opened, it offers the saved ones
 * by name, a box to paste or edit, and "Guardarlas para la próxima". Picking a
 * saved one fills the box and the name, so editing and saving again updates it.
 *
 * The hint says plainly what it cannot do. Hilo's clinical rules stay on top of
 * whatever is written here (see `customInstructionsBlock`), and a practitioner
 * should know that before she pastes a prompt that asks for a diagnosis.
 *
 * "Borrar" is a button inside the document's form with its own `formAction`, so
 * there is no form nested in a form; `formNoValidate` keeps the document's
 * required fields from blocking it.
 */
export function CustomInstructionsField({
  templates,
}: {
  templates: { id: string; name: string; body: string }[]
}) {
  const [text, setText] = useState('')
  const [chosenId, setChosenId] = useState('')
  const [save, setSave] = useState(false)
  const [name, setName] = useState('')

  const chosen = templates.find((template) => template.id === chosenId)

  return (
    <details className="rounded-xl border border-border px-3.5 py-2.5">
      <summary className="cursor-pointer text-sm font-medium">
        Tus instrucciones
        <span className="font-normal text-muted-foreground"> · opcional</span>
      </summary>

      <div className="mt-3 space-y-3">
        {templates.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="templateId" className="sr-only">
              Tus instrucciones guardadas
            </Label>
            <select
              id="templateId"
              name="templateId"
              value={chosenId}
              onChange={(event) => {
                const next = templates.find((template) => template.id === event.target.value)
                setChosenId(event.target.value)
                setText(next?.body ?? '')
                setName(next?.name ?? '')
              }}
              className="h-9 min-w-[200px] flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Usar unas guardadas…</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>

            {chosen ? (
              <button
                type="submit"
                formAction={deleteTemplateAction}
                formNoValidate
                onClick={(event) => {
                  if (!window.confirm(`¿Borrar "${chosen.name}"? Los documentos que ya escribiste con ellas no cambian.`)) {
                    event.preventDefault()
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-meta font-semibold text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Borrar estas
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="customInstructions" className="sr-only">
            Tus instrucciones
          </Label>
          <Textarea
            id="customInstructions"
            name="customInstructions"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={CUSTOM_INSTRUCTIONS_MAX}
            rows={5}
            placeholder="Pegá el prompt que ya usás. Ej: armalo en tres párrafos, empezá por las fortalezas y usá un lenguaje que entienda la maestra."
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Hilo las suma a los datos del paciente. Sus reglas clínicas siguen mandando: no
            inventa datos ni da diagnósticos cerrados, aunque se lo pidas acá.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="saveTemplate"
              value="1"
              checked={save}
              onChange={(event) => setSave(event.target.checked)}
              className="size-4 accent-violet"
            />
            Guardarlas para la próxima
          </label>
          {save ? (
            <Input
              name="templateName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder="Nombre, por ejemplo: Informe para el colegio"
              aria-label="Nombre para guardar tus instrucciones"
              required
            />
          ) : null}
        </div>
      </div>
    </details>
  )
}
