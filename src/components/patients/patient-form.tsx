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
import { FREQUENCY_LABELS } from '@/lib/appointment-labels'
import {
  AGE_GROUP_LABELS,
  BILLING_FREQUENCY_LABELS,
  GUARDIAN_RELATIONSHIP_LABELS,
} from '@/lib/patient-labels'
import { WEEK_ORDER, weekdayName } from '@/lib/week'
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
    <form action={formAction} className="space-y-5">
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

        {/* El adulto a cargo, en su propio bloque. Hasta ahora el alta sólo tenía
            "Teléfono de la familia", sin nombre: el consentimiento que pide la
            Ley 19.529 para un menor lo firma una persona, el link para
            completar la ficha le llega a una persona, y el informe "para la
            familia" lo lee alguien con nombre. Un solo responsable, a
            propósito — ver la migración `patient_guardian`. */}
        <div className="border-t border-border pt-4 sm:col-span-2">
          <p className="text-body font-bold">Responsable</p>
          <p className="text-meta text-muted-foreground">
            Si es menor, el adulto a cargo: quien firma el consentimiento, paga y recibe los
            informes. Si es adulto, alcanza con su teléfono.
          </p>
        </div>

        <Field label="Nombre del responsable" htmlFor="guardianName" hint="opcional">
          <Input
            id="guardianName"
            name="guardianName"
            placeholder="Nombre y apellido"
            defaultValue={patient?.guardian_name ?? ''}
          />
        </Field>

        <Field label="Es su…" htmlFor="guardianRelationship" hint="opcional">
          <Select
            id="guardianRelationship"
            name="guardianRelationship"
            defaultValue={patient?.guardian_relationship ?? ''}
          >
            <option value="">Elegí</option>
            {Object.entries(GUARDIAN_RELATIONSHIP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Teléfono" htmlFor="phone" hint="opcional">
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Ej: 099 123 456"
            defaultValue={patient?.phone ?? ''}
          />
          <p className="text-xs text-muted-foreground">Para recordatorios, cobros y el link de la ficha.</p>
        </Field>

        <Field label="Correo del responsable" htmlFor="guardianEmail" hint="opcional">
          <Input
            id="guardianEmail"
            name="guardianEmail"
            type="email"
            placeholder="nombre@correo.com"
            defaultValue={patient?.guardian_email ?? ''}
          />
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

        {/* Only when creating. The motivo above says why they arrived — "derivado
            por la maestra" — which is not a goal, and a practitioner who typed
            what they meant to work on into that box had to type it again on the
            ficha afterwards. Asking here is asking once. Editing does not offer
            it: by then the patient has a goal list, and a second way in would
            quietly create duplicates. */}
        {editing ? null : (
          <Field
            label="Primer objetivo"
            htmlFor="firstGoal"
            hint="opcional"
            className="sm:col-span-2"
          >
            <Input
              id="firstGoal"
              name="firstGoal"
              maxLength={200}
              placeholder="Ej: Producir /r/ en posición inicial"
            />
            <p className="text-xs text-muted-foreground">
              Lo que vas a trabajar. Con esto Hilo sigue el avance y arma los informes.
              Después agregás los que quieras desde la ficha.
            </p>
          </Field>
        )}

        <Field label="Inicio del tratamiento" htmlFor="startDate" hint="opcional">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={patient?.start_date ?? ''}
          />
        </Field>
      </div>

      {/* Also only when creating. The form was already asking "sesiones por mes"
          two fieldsets down — it wanted to know how often you see them — but had
          nowhere to say *when*, so the day and time had to be repeated in the
          Agenda dialog. This writes the same standing rule that dialog writes,
          and the Agenda materialises the occurrences from it.

          The hour is empty on purpose and is the switch: no hour, no schedule.
          A pre-filled 09:00 would agendar every patient at nine for somebody
          who has not decided yet. */}
      {editing ? null : (
        <fieldset className="space-y-4 border-t border-border pt-5">
          <legend className="text-body font-bold text-muted-foreground uppercase">
            Cuándo la ves
          </legend>

          <p className="text-meta leading-relaxed text-muted-foreground">
            Si ya sabés el día y la hora, la sesión queda agendada sola en tu Agenda.
            Si todavía no, dejá la hora en blanco y la agendás cuando la tengas.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Día de la semana" htmlFor="weekday">
              <Select id="weekday" name="weekday" defaultValue="1">
                {WEEK_ORDER.map((weekday) => (
                  <option key={weekday} value={weekday}>
                    {weekdayName(weekday)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Hora" htmlFor="startTime">
              <Input id="startTime" name="startTime" type="time" />
            </Field>

            <Field label="Frecuencia" htmlFor="frequency">
              <Select id="frequency" name="frequency" defaultValue="weekly">
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-4 border-t border-border pt-5">
        <legend className="text-body font-bold text-muted-foreground uppercase">
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
