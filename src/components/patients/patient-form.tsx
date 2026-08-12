'use client'

import { useActionState } from 'react'

import { createPatientAction, updatePatientAction } from '@/app/(app)/pacientes/actions'
import { FormMessage } from '@/components/auth/form-message'
import { PhotoPicker } from '@/components/patients/photo-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { AGE_GROUP_LABELS, BILLING_FREQUENCY_LABELS } from '@/lib/patient-labels'
import type { Patient } from '@/server/patients'

/**
 * One form for creating and for editing. The fields, their order, and their
 * wording come from v1's "Nuevo paciente" modal (`legacy/index.html:693`) —
 * which is worth keeping verbatim, because the order matches how a practitioner
 * actually receives the information.
 *
 * A page rather than a modal: this is long enough that on a phone a modal means
 * scrolling inside a scroll, and a page can be linked to.
 */
export function PatientForm({
  patient,
  photoUrl,
}: {
  patient?: Patient
  photoUrl?: string | null
}) {
  const editing = Boolean(patient)
  const [state, formAction, pending] = useActionState(
    editing ? updatePatientAction : createPatientAction,
    EMPTY_FORM_STATE,
  )

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {patient ? <input type="hidden" name="patientId" value={patient.id} /> : null}

      <FormMessage message={state.message} />

      <PhotoPicker currentUrl={photoUrl} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre y apellido" htmlFor="fullName" className="sm:col-span-2">
          <Input
            id="fullName"
            name="fullName"
            defaultValue={patient?.full_name}
            required
            autoFocus={!editing}
          />
        </Field>

        <Field label="Fecha de nacimiento" htmlFor="dateOfBirth" hint="opcional">
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={patient?.date_of_birth ?? ''}
          />
          <p className="text-xs text-muted-foreground">
            Guardamos la fecha, no la edad, así nunca queda vieja.
          </p>
        </Field>

        <Field label="Población" htmlFor="ageGroup">
          <Select id="ageGroup" name="ageGroup" defaultValue={patient?.age_group ?? 'children'}>
            {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Colegio / escuela" htmlFor="school" hint="opcional">
          <Input id="school" name="school" defaultValue={patient?.school ?? ''} />
        </Field>

        <Field label="Grado o nivel" htmlFor="schoolLevel" hint="opcional">
          <Input
            id="schoolLevel"
            name="schoolLevel"
            placeholder="Ej: 2º escolar"
            defaultValue={patient?.school_level ?? ''}
          />
        </Field>

        <Field label="Mutualista" htmlFor="healthInsurer" hint="opcional">
          <Input
            id="healthInsurer"
            name="healthInsurer"
            defaultValue={patient?.health_insurer ?? ''}
          />
        </Field>

        <Field label="Teléfono de la familia" htmlFor="phone" hint="opcional">
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Ej: 099 123 456"
            defaultValue={patient?.phone ?? ''}
          />
          <p className="text-xs text-muted-foreground">Para recordatorios y cobros.</p>
        </Field>

        <Field label="Motivo de consulta" htmlFor="referralReason" className="sm:col-span-2">
          <Textarea
            id="referralReason"
            name="referralReason"
            rows={3}
            placeholder="¿Por qué llega a la consulta?"
            defaultValue={patient?.referral_reason ?? ''}
          />
        </Field>

        <Field label="Inicio del tratamiento" htmlFor="startDate" hint="opcional">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={patient?.start_date ?? ''}
          />
        </Field>
      </div>

      <fieldset className="space-y-4 border-t border-border pt-5">
        <legend className="text-[13px] font-bold text-muted-foreground uppercase">
          Cobro
        </legend>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Honorario ($)" htmlFor="sessionFee" hint="opcional">
            <Input
              id="sessionFee"
              name="sessionFee"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="Monto"
              defaultValue={patient?.session_fee ?? ''}
            />
          </Field>

          <Field label="Frecuencia de pago" htmlFor="billingFrequency">
            <Select
              id="billingFrequency"
              name="billingFrequency"
              defaultValue={patient?.billing_frequency ?? 'monthly'}
            >
              {Object.entries(BILLING_FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Sesiones por mes"
            htmlFor="expectedSessionsPerMonth"
            hint="esperadas"
          >
            <Input
              id="expectedSessionsPerMonth"
              name="expectedSessionsPerMonth"
              type="number"
              min="0"
              max="62"
              inputMode="numeric"
              placeholder="Ej: 4"
              defaultValue={patient?.expected_sessions_per_month ?? ''}
            />
          </Field>
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear paciente'}
      </Button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>
        {label}
        {hint ? <span className="font-normal text-muted-foreground"> · {hint}</span> : null}
      </Label>
      {children}
    </div>
  )
}

/**
 * A native select. Radix's does not submit with a form and would need client
 * state plus a hidden input to match what this already does — and on a phone the
 * native picker is the better control.
 */
function Select(props: React.ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}
