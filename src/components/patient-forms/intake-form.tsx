'use client'

import { useActionState, useState } from 'react'

import { submitIntakeAction } from '@/app/(public)/antes/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { GUARDIAN_RELATIONSHIP_LABELS } from '@/lib/patient-labels'

/**
 * What a family fills in from the "Antes de empezar" link: the details, then the
 * consent.
 *
 * Two steps inside **one** form. The details are hidden, not unmounted, when
 * the consent shows, so everything goes in a single submission and a family
 * that goes back to fix a date does not lose the signature they were about to
 * write. None of the details is required: a parent who does not know the name
 * of the mutualista's plan should still be able to sign.
 *
 * A child's form asks about the child and about the adult filling it in; an
 * adult's asks about themselves and has nobody else to name.
 */
export function IntakeForm({
  token,
  practitionerName,
  patientFirstName,
  ageGroup,
  consentText,
}: {
  token: string
  practitionerName: string
  patientFirstName: string
  ageGroup: string
  consentText: string
}) {
  const [state, formAction, pending] = useActionState(
    submitIntakeAction.bind(null, token),
    EMPTY_FORM_STATE,
  )
  const [step, setStep] = useState<'details' | 'consent'>('details')
  const minor = ageGroup !== 'adults'
  const v = state.values ?? {}

  if (state.ok) {
    return (
      <div role="status" className="rounded-xl bg-green-soft px-4 py-5 text-center">
        <p className="text-lead font-bold text-[#1a8f57]">¡Listo, gracias!</p>
        <p className="mt-1.5 text-body leading-relaxed text-[#1a8f57]">
          {practitionerName} ya tiene los datos y el consentimiento firmado. Podés cerrar esta
          página.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      <div hidden={step !== 'details'} className="space-y-4">
        <p className="text-body text-muted-foreground">
          {minor
            ? `Son unos minutos. Nada es obligatorio: completá lo que sepas sobre ${patientFirstName}.`
            : 'Son unos minutos. Nada es obligatorio: completá lo que quieras contar.'}
        </p>

        <Field label={minor ? `Fecha de nacimiento de ${patientFirstName}` : 'Tu fecha de nacimiento'} htmlFor="dateOfBirth">
          <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={v.dateOfBirth} />
        </Field>

        {minor ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Escuela o colegio" htmlFor="school">
              <Input id="school" name="school" defaultValue={v.school} />
            </Field>
            <Field label="Grado o año" htmlFor="schoolLevel">
              <Input id="schoolLevel" name="schoolLevel" placeholder="Ej: 4.º" defaultValue={v.schoolLevel} />
            </Field>
          </div>
        ) : null}

        <Field label="Mutualista o seguro" htmlFor="healthInsurer">
          <Input id="healthInsurer" name="healthInsurer" defaultValue={v.healthInsurer} />
        </Field>

        {minor ? (
          <>
            <p className="border-t border-border pt-4 text-body font-bold">Tus datos</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tu nombre y apellido" htmlFor="guardianName">
                <Input id="guardianName" name="guardianName" autoComplete="name" defaultValue={v.guardianName} />
              </Field>
              <Field label={`Sos su…`} htmlFor="guardianRelationship">
                <Select id="guardianRelationship" name="guardianRelationship" defaultValue={v.guardianRelationship ?? ''}>
                  <option value="">Elegí</option>
                  {Object.entries(GUARDIAN_RELATIONSHIP_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Teléfono" htmlFor="phone">
                <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Ej: 099 123 456" defaultValue={v.phone} />
              </Field>
              <Field label="Correo" htmlFor="guardianEmail">
                <Input id="guardianEmail" name="guardianEmail" type="email" autoComplete="email" defaultValue={v.guardianEmail} />
              </Field>
            </div>
          </>
        ) : (
          <Field label="Teléfono" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Ej: 099 123 456" defaultValue={v.phone} />
          </Field>
        )}

        <p className="border-t border-border pt-4 text-body font-bold">
          {minor ? `Sobre ${patientFirstName}` : 'Sobre la consulta'}
        </p>

        <Field label={minor ? '¿Por qué consultan?' : '¿Qué te trae a la consulta?'} htmlFor="reason">
          <Textarea id="reason" name="reason" rows={3} maxLength={3000} defaultValue={v.reason} />
        </Field>

        <Field
          label={minor ? 'Algo de su historia que quieras contar' : 'Algo de tu historia que quieras contar'}
          htmlFor="history"
          hint={minor ? 'Embarazo y parto, desarrollo, salud, cambios en la familia…' : '¿Consultaste antes? ¿Algo de tu salud?'}
        >
          <Textarea id="history" name="history" rows={3} maxLength={3000} defaultValue={v.history} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={minor ? '¿Toma alguna medicación?' : '¿Tomás alguna medicación?'} htmlFor="medication">
            <Input id="medication" name="medication" maxLength={1000} defaultValue={v.medication} />
          </Field>
          <Field label={minor ? '¿Lo ve otro profesional?' : '¿Te ve otro profesional?'} htmlFor="otherProfessionals">
            <Input id="otherProfessionals" name="otherProfessionals" maxLength={1000} placeholder="Ej: fonoaudióloga, pediatra" defaultValue={v.otherProfessionals} />
          </Field>
        </div>

        <Button type="button" size="lg" className="w-full" onClick={() => setStep('consent')}>
          Seguir al consentimiento
        </Button>
      </div>

      <div hidden={step !== 'consent'} className="space-y-4">
        <div>
          <p className="text-body font-bold">Consentimiento informado</p>
          <p className="text-meta text-muted-foreground">Leelo con calma. Si tenés dudas, preguntale a {practitionerName} antes de firmar.</p>
        </div>

        {/* The exact text that gets stored with the signature. `pre-line`
            keeps the paragraphs the practitioner wrote. */}
        <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-body leading-relaxed whitespace-pre-line">
          {consentText}
        </div>

        <Field label="Tu nombre y apellido, como firma" htmlFor="signerName">
          <Input id="signerName" name="signerName" autoComplete="name" required minLength={3} maxLength={200} defaultValue={v.signerName} />
        </Field>

        {minor ? (
          <Field label={`Firmás como… de ${patientFirstName}`} htmlFor="signerRelationship">
            <Select id="signerRelationship" name="signerRelationship" required defaultValue={v.signerRelationship ?? ''}>
              <option value="" disabled>
                Elegí
              </option>
              {Object.entries(GUARDIAN_RELATIONSHIP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <input type="hidden" name="signerRelationship" value="self" />
        )}

        <label className="flex cursor-pointer items-start gap-2.5 text-body">
          <input type="checkbox" name="accepted" required className="mt-0.5 size-4 shrink-0 accent-violet" />
          <span>Leí el consentimiento y estoy de acuerdo.</span>
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" size="lg" onClick={() => setStep('details')}>
            Volver a los datos
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={pending}>
            {pending ? 'Enviando…' : 'Firmar y enviar'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
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
