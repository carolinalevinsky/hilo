import { ArrowLeft, Download } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/print-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { formatDate, formatLongDate } from '@/lib/dates'
import { disciplineLabel } from '@/lib/disciplines'
import {
  ageGroupLabel,
  billingFrequencyLabel,
  paymentMethodLabel,
} from '@/lib/patient-labels'
import { periodLabel } from '@/lib/periods'
import { RECIPIENT_LABELS, type RecipientId } from '@/lib/recipients'
import { requireUser } from '@/server/auth'
import { buildPatientExport } from '@/server/patient-export'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Datos del paciente · Hilo' }

/** Same shape as Cobros: "$ 1.500", no decimals. */
const money = (value: number) =>
  `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`

/**
 * Everything Hilo holds about one patient, on one printable page.
 *
 * The right of access under Ley N.º 18.331 asks for an *intelligible* form, and
 * this is the half that satisfies that: a document a family can read, print, or
 * save as PDF. The JSON download beside it is the complete one — see
 * `src/server/patient-export.ts` for what is in each and, more importantly, for
 * why the private note is out of both and said out loud anyway.
 */
export default async function PatientDataPage({ params }: PageProps<'/pacientes/[id]/datos'>) {
  const { id } = await params
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  const data = await buildPatientExport(user.id, id, practitioner)
  if (!data || !data.patient) notFound()

  const { patient } = data

  return (
    <>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/pacientes/${patient.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a la ficha
        </Link>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button asChild variant="outline" size="sm">
            {/* A route handler, not a Server Action: an action cannot return a
                file, and this has to arrive with a filename attached. */}
            <a href={`/api/pacientes/${patient.id}/datos`} download>
              <Download className="size-4" />
              Descargar todo (.json)
            </a>
          </Button>
          <PrintButton label="Imprimir o guardar en PDF" />
        </div>
      </div>

      <Card className="hilo-doc mx-auto max-w-[760px]">
        <CardContent className="px-6 py-7 sm:px-10">
          <h1 className="text-[20px] font-extrabold tracking-[-0.4px]">
            Datos de {patient.full_name}
          </h1>
          <p className="mt-0.5 mb-6 text-[12.5px] text-muted-foreground">
            Todo lo que Hilo guarda sobre {patient.full_name.split(' ')[0]}, al{' '}
            {formatLongDate(data.generatedAt.slice(0, 10))} · {practitioner.full_name} ·{' '}
            {disciplineLabel(practitioner.discipline)}
          </p>

          <Section title="La ficha">
            <Field label="Nombre" value={patient.full_name} />
            <Field
              label="Fecha de nacimiento"
              value={
                patient.date_of_birth
                  ? `${formatDate(patient.date_of_birth)} (${ageLabel(patient.date_of_birth)})`
                  : null
              }
            />
            <Field label="Población" value={ageGroupLabel(patient.age_group)} />
            <Field label="Escolaridad" value={patient.school_level} />
            <Field label="Institución" value={patient.school} />
            <Field label="Prestador de salud" value={patient.health_insurer} />
            <Field label="Teléfono" value={patient.phone} />
            <Field label="Motivo de consulta" value={patient.referral_reason} />
            <Field label="Inicio del tratamiento" value={formatDate(patient.start_date)} />
            <Field
              label="Consentimiento de la familia"
              value={
                patient.consent_signed_at
                  ? `Registrado el ${formatDate(patient.consent_signed_at.slice(0, 10))}`
                  : 'Sin registrar'
              }
            />
            <Field
              label="Arancel por sesión"
              value={patient.session_fee === null ? null : money(Number(patient.session_fee))}
            />
            <Field
              label="Frecuencia de cobro"
              value={billingFrequencyLabel(patient.billing_frequency)}
            />
            <Field label="Foto" value={patient.photo_path ? 'Sí, una' : 'No'} />
          </Section>

          <Section title={`Objetivos (${data.goals.length})`}>
            {data.goals.length === 0 ? (
              <Empty>Sin objetivos cargados.</Empty>
            ) : (
              <ul className="space-y-1.5">
                {data.goals.map((goal) => (
                  <li key={goal.id} className="text-[13px]">
                    <b>{goal.title}</b> — {goal.progress}%
                    {goal.is_active ? '' : ' · retirado'}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Sesiones (${data.sessions.length})`}>
            {data.sessions.length === 0 ? (
              <Empty>Sin sesiones registradas.</Empty>
            ) : (
              <ul className="space-y-3">
                {data.sessions.map((session) => (
                  <li key={session.id}>
                    <p className="text-[12px] font-bold text-muted-foreground">
                      {formatDate(session.heldOn)}
                      {session.goals.length > 0 ? ` · ${session.goals.join(', ')}` : ''}
                    </p>
                    <p className="text-[13px] leading-relaxed">
                      {session.progressNote ?? '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Evaluaciones (${data.assessments.length})`}>
            {data.assessments.length === 0 ? (
              <Empty>Sin evaluaciones.</Empty>
            ) : (
              <ul className="space-y-3">
                {data.assessments.map((assessment) => (
                  <li key={assessment.id}>
                    <p className="text-[12px] font-bold text-muted-foreground">
                      {formatDate(assessment.assessed_on)} · {assessment.instrument}
                    </p>
                    <p className="text-[13px] leading-relaxed whitespace-pre-line">
                      {assessment.analysis}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Informes (${data.reports.length})`}>
            {data.reports.length === 0 ? (
              <Empty>Sin informes.</Empty>
            ) : (
              <ul className="space-y-3">
                {data.reports.map((report) => (
                  <li key={report.id}>
                    <p className="text-[12px] font-bold text-muted-foreground">
                      {formatDate(report.created_at.slice(0, 10))} ·{' '}
                      {RECIPIENT_LABELS[report.recipient as RecipientId] ?? report.recipient}
                    </p>
                    <p className="text-[13px] font-bold">{report.title}</p>
                    <p className="text-[13px] leading-relaxed whitespace-pre-line">
                      {report.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Pagos (${data.payments.length})`}>
            {data.payments.length === 0 ? (
              <Empty>Sin pagos registrados.</Empty>
            ) : (
              <ul className="space-y-1.5">
                {data.payments.map((payment) => (
                  <li key={payment.id} className="text-[13px]">
                    <b>{periodLabel(payment.period)}</b> — {money(Number(payment.amount))}
                    {payment.paidOn ? ` · pagado el ${formatDate(payment.paidOn)}` : ''}
                    {payment.method ? ` · ${paymentMethodLabel(payment.method)}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Said out loud rather than left out silently. See
              `src/server/patient-export.ts` for the reasoning. */}
          {data.privateNoteCount > 0 ? (
            <p className="mt-6 rounded-xl bg-muted/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Además de lo anterior, {data.privateNoteCount === 1 ? 'una' : data.privateNoteCount}{' '}
              {data.privateNoteCount === 1 ? 'sesión tiene' : 'sesiones tienen'} notas de
              trabajo de {practitioner.full_name}, que no forman parte de la historia clínica
              ni de ningún informe y no se incluyen acá. Se pueden pedir.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 border-t border-border pt-4">
      <h2 className="mb-2.5 text-[12.5px] font-extrabold tracking-[0.6px] text-violet uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <p className="text-[13px]">
      <span className="text-muted-foreground">{label}:</span> {value}
    </p>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-muted-foreground">{children}</p>
}
