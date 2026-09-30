import { ArrowLeft, MessageCircle } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { restoreVersionAction } from '@/app/(app)/document-actions'
import { saveReportAction, trashReportAction } from '@/app/(app)/informes/actions'
import { ConfirmAction } from '@/components/confirm-action'
import { ClinicalDocument } from '@/components/documents/clinical-document'
import { DocumentEditor } from '@/components/documents/document-editor'
import { Button } from '@/components/ui/button'
import { ageLabel } from '@/lib/age'
import { formatLongDate } from '@/lib/dates'
import { backLink } from '@/lib/safe-path'
import { disciplineLabel } from '@/lib/disciplines'
import { RECIPIENT_LABELS, type RecipientId } from '@/lib/recipients'
import { firstName, whatsappLink } from '@/lib/whatsapp'
import { documentSeal, documentState, wasEverSigned } from '@/server/document-lifecycle'
import { listVersions } from '@/server/document-versions'
import { getPatient } from '@/server/patients'
import { getReport } from '@/server/reports'

import { currentPractitioner, currentUser } from '../../session'

/**
 * Sin "· Ombúa", a diferencia del resto de las pantallas.
 *
 * Esta se imprime. El navegador pone el título de la página en el encabezado
 * del PDF y lo usa como nombre del archivo, así que el "· Ombúa" que en una
 * pestaña ubica, en un informe firmado que se entrega en un colegio es la marca
 * de un proveedor metida en un documento clínico ajeno.
 */
export const metadata: Metadata = { title: 'Informe' }

export default async function ReportPage({
  params,
  searchParams,
}: PageProps<'/informes/[id]'>) {
  const { id } = await params
  const query = await searchParams
  // De dónde vino, para poder devolverlo ahí. Ver `backLink`.
  const back = backLink(query.volver, '/informes', 'Volver a informes')
  const user = await currentUser()

  // The patient waits for the report, whose row names them; the rest keys on
  // the id in the URL and does not.
  const reportRow = getReport(user.id, id)

  const [report, patient, practitioner, versions, everSigned] = await Promise.all([
    reportRow,
    reportRow.then((row) => (row ? getPatient(user.id, row.patient_id) : null)),
    currentPractitioner(user.id),
    listVersions(user.id, 'report', id),
    wasEverSigned(user.id, 'report', id),
  ])
  if (!report) notFound()

  const state = documentState(report)

  const meta = [
    { label: 'Paciente', value: report.patients?.full_name ?? 'Sin datos' },
    { label: 'Edad', value: ageLabel(report.patients?.date_of_birth ?? null) ?? 'Sin datos' },
    { label: 'Escolaridad', value: report.patients?.school_level ?? 'Sin datos' },
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
          href={back.href}
          className="inline-flex items-center gap-1.5 text-body font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {back.label}
        </Link>

        <div className="flex gap-2">
          {/* Sin teléfono el link salía `wa.me/?text=…`, sin número, y
              WhatsApp abría sin destinatario. El botón dice lo que falta y
              lleva a cargarlo — la misma regla que "Recordar" en la Agenda y
              "Compartir con familia" en la ficha. */}
          {shareable && patient ? (
            patient.phone ? (
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
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={`/pacientes/${patient.id}/editar`}>
                  <MessageCircle className="size-4" />
                  Cargar teléfono
                </Link>
              </Button>
            )
          ) : null}

          {/* Sólo un borrador que nunca se entregó. Lo firmado se anula desde
              el documento: queda en la historia clínica con su motivo. */}
          {state === 'draft' && !everSigned ? (
            <ConfirmAction
              action={trashReportAction}
              fields={{ reportId: report.id }}
              trigger="Mandar a la papelera"
              title="¿Mandar este borrador a la papelera?"
              description="Deja de aparecer en los informes. Lo podés recuperar cuando quieras desde la papelera, en la ficha del paciente."
              confirmLabel="Mandar a la papelera"
            />
          ) : null}
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
        seal={documentSeal(report)}
      >
        <DocumentEditor
          kind="report"
          state={state}
          everSigned={everSigned}
          documentId={report.id}
          initialText={report.content ?? ''}
          initialVersions={versions}
          endpoint="/api/ai/informe"
          idField="reportId"
          autoStart={query.ia === '1' && state === 'draft'}
          onSave={saveReportAction.bind(null, report.id)}
          onRestore={restoreVersionAction}
        />
      </ClinicalDocument>
    </>
  )
}
