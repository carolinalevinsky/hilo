'use client'

import { useActionState } from 'react'

import { createReportAction } from '@/app/(app)/informes/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { RECIPIENT_LABELS, type RecipientId } from '@/lib/recipients'

export function ReportForm({
  patients,
  recipients,
  defaultPatientId,
}: {
  patients: { id: string; full_name: string }[]
  recipients: RecipientId[]
  defaultPatientId?: string
}) {
  const [state, formAction, pending] = useActionState(createReportAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <FormMessage message={state.message} />

      <div className="space-y-1.5">
        <Label htmlFor="patientId">Paciente</Label>
        <select
          id="patientId"
          name="patientId"
          required
          defaultValue={defaultPatientId ?? ''}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Elegí un paciente
          </option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium">¿Para quién es?</legend>
        <p className="text-xs text-muted-foreground">
          Cambia el tono, la estructura y hasta el título del informe.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {recipients.map((recipient, index) => (
            <label
              key={recipient}
              className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground has-checked:border-violet has-checked:bg-violet has-checked:text-white"
            >
              <input
                type="radio"
                name="recipient"
                value={recipient}
                defaultChecked={index === 0}
                className="sr-only"
                required
              />
              {RECIPIENT_LABELS[recipient]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="inputNotes">
          ¿Algo que quieras que diga?
          <span className="font-normal text-muted-foreground"> · opcional</span>
        </Label>
        <Textarea
          id="inputNotes"
          name="inputNotes"
          rows={3}
          placeholder="Ej: destacá el trabajo de la familia en casa y pedí más tiempo en las pruebas escritas."
        />
        <p className="text-xs text-muted-foreground">
          Hilo ya tiene los objetivos, el avance y las notas de las sesiones. Esto es lo que
          sólo vos sabés.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending ? 'Preparando…' : 'Generar informe'}
      </Button>
    </form>
  )
}
