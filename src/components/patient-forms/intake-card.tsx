import { applyIntakeAction, createIntakeLinkAction } from '@/app/(app)/pacientes/intake-actions'
import { SendLinkButton } from '@/components/patient-forms/send-link-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GUARDIAN_RELATIONSHIP_LABELS } from '@/lib/patient-labels'
import { cn } from '@/lib/utils'
import type { Consent, IntakeResponse } from '@/server/patient-forms'

/**
 * "Antes de empezar" on the ficha: the signed consent, the family's answers
 * waiting to be reviewed, and the button that sends the link.
 *
 * The answers are shown field by field before anything touches the ficha, and
 * "Pasar a la ficha" fills only what is empty — see `applyIntakeResponse`. What
 * the family wrote in their own words stays here, as they wrote it.
 */

/**
 * An instant shown as a Montevideo date. `signed_at` is a timestamp, and slicing
 * its UTC date would put a consent signed at ten at night on the next day.
 */
function day(instant: string) {
  return new Intl.DateTimeFormat('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Montevideo',
  }).format(new Date(instant))
}

function relationship(value: string | null) {
  if (!value) return null
  if (value === 'self') return 'el propio paciente'
  const label = GUARDIAN_RELATIONSHIP_LABELS[value as keyof typeof GUARDIAN_RELATIONSHIP_LABELS]
  return label ? label.toLowerCase() : null
}

export function IntakeCard({
  patientId,
  phone,
  patientFirstName,
  practitionerFirstName,
  status,
  className,
}: {
  patientId: string
  phone: string | null
  patientFirstName: string
  practitionerFirstName: string
  status: {
    openLinkSince: string | null
    response: IntakeResponse | null
    consent: Consent | null
  }
  className?: string
}) {
  const { openLinkSince, response, consent } = status

  const answers = response
    ? [
        { label: 'Fecha de nacimiento', value: response.date_of_birth ? day(`${response.date_of_birth}T12:00:00Z`) : null },
        { label: 'Escuela', value: response.school },
        { label: 'Grado', value: response.school_level },
        { label: 'Mutualista', value: response.health_insurer },
        { label: 'Responsable', value: response.guardian_name },
        { label: 'Es su', value: relationship(response.guardian_relationship) },
        { label: 'Teléfono', value: response.phone },
        { label: 'Correo', value: response.guardian_email },
      ].filter((row) => row.value)
    : []

  const told = response
    ? [
        { label: 'Por qué consultan', value: response.reason },
        { label: 'Su historia', value: response.history },
        { label: 'Medicación', value: response.medication },
        { label: 'Otros profesionales', value: response.other_professionals },
      ].filter((row) => row.value)
    : []

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Antes de empezar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* The consent first: it is the one thing here the law asks for. */}
        {consent ? (
          <div className="space-y-1.5">
            <p className="text-body">
              <span className="font-bold text-[#1a8f57]">Consentimiento firmado</span> por{' '}
              {consent.signer_name}
              {relationship(consent.signer_relationship)
                ? ` (${relationship(consent.signer_relationship)})`
                : ''}{' '}
              el {day(consent.signed_at)}.
            </p>
            <details className="text-meta">
              <summary className="cursor-pointer font-semibold text-violet">
                Ver el texto que firmó
              </summary>
              <div className="mt-2 max-h-72 overflow-y-auto rounded-lg bg-muted/50 px-3 py-2.5 leading-relaxed whitespace-pre-line text-muted-foreground">
                {consent.consent_text}
              </div>
            </details>
          </div>
        ) : (
          <p className="text-body text-muted-foreground">
            Todavía no hay consentimiento firmado.
          </p>
        )}

        {response && !response.applied_at ? (
          <div className="space-y-2.5 rounded-xl border border-violet/30 bg-violet-soft/60 px-3.5 py-3">
            <p className="text-body">
              <b>Llegaron los datos</b> el {day(response.submitted_at)}. Revisalos: al pasarlos
              a la ficha sólo se completa lo que está vacío.
            </p>
            {answers.length > 0 ? (
              <dl className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-x-3 gap-y-1 text-meta">
                {answers.map((row) => (
                  <div key={row.label} className="contents">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="min-w-0 break-words">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-meta text-muted-foreground">No completaron datos de la ficha.</p>
            )}
            <form action={applyIntakeAction}>
              <input type="hidden" name="patientId" value={patientId} />
              <input type="hidden" name="responseId" value={response.id} />
              <Button type="submit" size="sm">
                Pasar a la ficha
              </Button>
            </form>
          </div>
        ) : null}

        {told.length > 0 ? (
          <div className="space-y-2">
            <p className="text-meta font-bold tracking-[0.04em] text-muted-foreground uppercase">
              Lo que contó la familia
            </p>
            {told.map((row) => (
              <div key={row.label}>
                <p className="text-meta text-muted-foreground">{row.label}</p>
                <p className="text-body leading-relaxed whitespace-pre-line">{row.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className={cn('space-y-1.5', (consent || response) && 'border-t border-border pt-3.5')}>
          {openLinkSince ? (
            <p className="text-meta text-muted-foreground">
              Mandaste un link el {day(openLinkSince)} y todavía no lo completaron.
            </p>
          ) : !consent && !response ? (
            <p className="text-meta text-muted-foreground">
              Un link para que la familia complete los datos y firme el consentimiento antes de la
              primera sesión.
            </p>
          ) : null}
          <SendLinkButton
            create={createIntakeLinkAction.bind(null, patientId)}
            phone={phone}
            message={`¡Hola! Antes de la primera sesión de ${patientFirstName}, te pido que completes estos datos y firmes el consentimiento. Lleva unos minutos: {url} Gracias, ${practitionerFirstName}.`}
            label="Mandar “Antes de empezar”"
            again={Boolean(openLinkSince || consent || response)}
            lifetime="14 días"
          />
        </div>
      </CardContent>
    </Card>
  )
}
