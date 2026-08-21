'use client'

import { useActionState, useState } from 'react'

import { createAssessmentAction } from '@/app/(app)/evaluaciones/actions'
import { FormMessage } from '@/components/auth/form-message'
import { DictateButton } from '@/components/dictate-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { today } from '@/lib/dates'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { SCORE_SCALES, type Instrument } from '@/lib/instruments'

/**
 * Loading an assessment.
 *
 * The form changes shape with the instrument, because instruments do: a WISC-V
 * wants six numbers, a Bender wants a paragraph. v1 did this
 * (`legacy/index.html:1744`) and it is what stops the screen from being a
 * generic "paste your results here".
 *
 * The scale selector is the field that does the most work. 85 is a descended
 * standard score and a perfectly good percentile — without knowing which, the
 * interpretation is a guess, and a guess inside a signed report is a liability.
 */
export function AssessmentForm({
  patients,
  instruments,
  defaultPatientId,
}: {
  patients: { id: string; full_name: string }[]
  instruments: Instrument[]
  defaultPatientId?: string
}) {
  const [state, formAction, pending] = useActionState(
    createAssessmentAction,
    EMPTY_FORM_STATE,
  )
  const [instrumentId, setInstrumentId] = useState(instruments[0]?.id ?? '')

  const selected = instruments.find((entry) => entry.id === instrumentId)

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormMessage message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="patientId">Paciente</Label>
          <Select id="patientId" name="patientId" required defaultValue={defaultPatientId ?? ''}>
            <option value="" disabled>
              Elegí un paciente
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assessedOn">Fecha de administración</Label>
          <Input id="assessedOn" name="assessedOn" type="date" defaultValue={today()} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instrumentId">Instrumento</Label>
        <Select
          id="instrumentId"
          name="instrumentId"
          value={instrumentId}
          onChange={(event) => setInstrumentId(event.target.value)}
          required
        >
          {instruments.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted-foreground">
          La lista se arma según tu profesión. Si usás otro, elegí “Otra”.
        </p>
      </div>

      {selected?.fields ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="scale">Tipo de puntaje</Label>
            <Select id="scale" name="scale" defaultValue="standard">
              {Object.entries(SCORE_SCALES).map(([value, scale]) => (
                <option key={value} value={value}>
                  {scale.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Hilo interpreta según la escala que elijas: un 85 no significa lo mismo como
              puntaje estándar que como percentil.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Puntajes
              <span className="font-normal text-muted-foreground">
                {' '}
                · dejá vacío lo que no administraste
              </span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {selected.fields.map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <span className="flex-1 text-[12.5px]">{field}</span>
                  <Input
                    name={`score:${field}`}
                    inputMode="decimal"
                    placeholder="Sin dato"
                    aria-label={field}
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="prose">Resultados</Label>
          <Textarea
            id="prose"
            name="prose"
            rows={4}
            placeholder={selected?.prose ?? 'Cargá los resultados que tengas.'}
          />
        </div>
      )}

      <div className="space-y-1.5">
        {/* Dictation, as in v1 (`legacy/index.html:1744`). This gets written
            with the test materials still on the table and the family waiting,
            which is exactly when typing does not happen. */}
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="observations">
            Observaciones de conducta
            <span className="font-normal text-muted-foreground"> · opcional</span>
          </Label>
          <DictateButton targetId="observations" />
        </div>
        <Textarea
          id="observations"
          name="observations"
          rows={2}
          placeholder="Cómo se mostró durante la administración: atención, fatiga, colaboración."
        />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending ? 'Preparando…' : 'Interpretar evaluación'}
      </Button>
    </form>
  )
}

function Select(props: React.ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}
