import { ArrowLeft, MessageCircle } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { deleteReportAction, saveReportAction } from '@/app/(app)/informes/actions'
import { ClinicalDocument } from '@/components/documents/clinical-document'
import { DocumentEditor } from '@/components/documents/document-editor'
import { Button } from '@/components/ui/button'
import { ageLabel } from '@/lib/age'
import { formatLongDate } from '@/lib/dates'
import { disciplineLabel } from '@/lib/disciplines'
import { RECIPIENT_LABELS, type RecipientId } from '@/lib/recipients'
import { firstName, whatsappLink } from '@/lib/whatsapp'
import { requireUser } from '@/server/auth'
import { getPatient } from '@/server/patients'
import { getPractitioner } from '@/server/practitioners'
import { getReport } from '@/server/reports'

export const metadata: Metadata = { title: 'Informe · Hilo' }

export default async function ReportPage({
  params,
  searchParams,
}: PageProps<'/informes/[id]'>) {
  const { id } = await params
  const query = await searchParams
  const user = await requireUser()

  const [report, practitioner] = await Promise.all([
    getReport(user.id, id),
    getPractitioner(user.id),
  ])
  if (!report) notFound()

  const patient = await getPatient(user.id, report.patient_id)

  const meta = [
    { label: 'Paciente', value: report.patients?.full_name ?? '—' },
    { label: 'Edad', value: ageLabel(report.patients?.date_of_birth ?? null) ?? '—' },
    { label: 'Escolaridad', value: report.patients?.school_level ?? '—' },
    { label: 'Destinatario', value: RECIPIENT_LABELS[report.recipient as RecipientId] },
  ]

  // Only for the two recipients the practitioner messages directly. And the
  // message carries no clinical content — an email or a WhatsApp is an
  // uncontrolled copy, so the report itself stays behind the login.
  const shareable = report.recipient === 'family' || report.recipient === 'patient'
  const shareText = `Hola! Ya está listo el informe de ${firstName(report.patients?.full_name ?? '')}. Te lo alcanzo por acá o lo vemos juntos cuando prefieras. Saludos, ${firstName(practitioner.full_name)}.`

  return (
    <>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/informes"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a informes
        </Link>

        <div className="flex gap-2">
          {shareable && patient ? (
            <Button asChild variant="outline" size="sm">
              <a
                href={whatsappLink(patient.phone, shareText)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                Avisar por WhatsApp
              </a>
            </Button>
          ) : null}

          <form action={deleteReportAction}>
            <input type="hidden" name="reportId" value={report.id} />
            <Button type="submit" variant="ghost" size="sm">
              Borrar
            </Button>
          </form>
        </div>
      </div>

      <ClinicalDocument
        title={report.title}
        subtitle={`${disciplineLabel(practitioner.discipline)} · Montevideo, ${formatLongDate(report.issued_on)}`}
        meta={meta}
        footer={{
          name: practitioner.full_name,
          discipline: disciplineLabel(practitioner.discipline),
        }}
      >
        <DocumentEditor
          documentId={report.id}
          initialText={report.content ?? ''}
          endpoint="/api/ai/informe"
          idField="reportId"
          autoStart={query.ia === '1'}
          onSave={saveReportAction.bind(null, report.id)}
        />
      </ClinicalDocument>
    </>
  )
}
