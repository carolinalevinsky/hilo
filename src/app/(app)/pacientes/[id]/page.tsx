import { ArrowLeft, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PatientDangerZone } from '@/components/patients/patient-danger-zone'
import { PatientHeader } from '@/components/patients/patient-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { formatDate } from '@/lib/dates'
import { ageGroupLabel, billingFrequencyLabel } from '@/lib/patient-labels'
import { firstName, whatsappLink } from '@/lib/whatsapp'
import { requireUser } from '@/server/auth'
import { getPatient, getPhotoUrl } from '@/server/patients'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Paciente · Hilo' }

export default async function PatientPage({ params }: PageProps<'/pacientes/[id]'>) {
  const { id } = await params
  const user = await requireUser()

  const patient = await getPatient(user.id, id)
  if (!patient) notFound()

  const [photoUrl, practitioner] = await Promise.all([
    getPhotoUrl(patient.photo_path),
    getPractitioner(user.id),
  ])

  // Nothing clinical travels in a WhatsApp message — it says who it is about and
  // that the practitioner is there. The content stays behind the login.
  const shareText = `Hola! Te escribo por ${firstName(patient.full_name)}. Cualquier cosa quedo a las órdenes. Saludos, ${firstName(practitioner.full_name)}.`

  return (
    <>
      <Link
        href="/pacientes"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a pacientes
      </Link>

      <PatientHeader
        patient={patient}
        photoUrl={photoUrl}
        actions={
          <Button
            asChild
            variant="outline"
            className="border-transparent bg-white/16 text-white hover:bg-white/26 hover:text-white max-sm:flex-1"
          >
            <a
              href={whatsappLink(patient.phone, shareText)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" />
              Escribir a la familia
            </a>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Motivo de consulta</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.referral_reason ? (
              <p className="text-[14px] leading-relaxed">{patient.referral_reason}</p>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                Todavía no cargaste el motivo.{' '}
                <Link
                  href={`/pacientes/${patient.id}/editar`}
                  className="font-semibold text-violet underline"
                >
                  Agregalo acá
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ficha</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[105px_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-[13px]">
              <Row label="Edad">{ageLabel(patient.date_of_birth)}</Row>
              <Row label="Población">{ageGroupLabel(patient.age_group)}</Row>
              <Row label="Escolaridad">{patient.school_level}</Row>
              <Row label="Colegio">{patient.school}</Row>
              <Row label="Mutualista">{patient.health_insurer}</Row>
              <Row label="Teléfono">{patient.phone}</Row>
              <Row label="Inicio">{formatDate(patient.start_date)}</Row>
              <Row label="Honorario">
                {patient.session_fee
                  ? `$ ${patient.session_fee} · ${billingFrequencyLabel(patient.billing_frequency).toLowerCase()}`
                  : null}
              </Row>
            </dl>

            <PatientDangerZone
              patientId={patient.id}
              fullName={patient.full_name}
              archived={Boolean(patient.archived_at)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

/**
 * An em dash rather than a blank when a field is empty. A blank reads as a
 * rendering bug; a dash reads as "nobody has filled this in".
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">
        {children || <span className="text-muted-foreground">—</span>}
      </dd>
    </>
  )
}
