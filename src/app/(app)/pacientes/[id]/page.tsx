import { ArrowLeft, ChartPie, FileText, MessageCircle, Plus } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { GoalList } from '@/components/goals/goal-list'
import { ProgressChart } from '@/components/goals/progress-chart'
import { PatientDangerZone } from '@/components/patients/patient-danger-zone'
import { OnlineConsultation } from '@/components/patients/online-consultation'
import { PatientHeader } from '@/components/patients/patient-header'
import { SessionTimeline } from '@/components/sessions/session-timeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { formatDate } from '@/lib/dates'
import { disciplineLabel } from '@/lib/disciplines'
import { ageGroupLabel, billingFrequencyLabel } from '@/lib/patient-labels'
import { firstName, whatsappLink } from '@/lib/whatsapp'
import { videoRoomUrl } from '@/lib/video'
import { requireUser } from '@/server/auth'
import { averageProgress, listGoalProgress, listGoals } from '@/server/goals'
import { getPatient, getPhotoUrl } from '@/server/patients'
import { getPractitioner } from '@/server/practitioners'
import { listSessions } from '@/server/sessions'

export const metadata: Metadata = { title: 'Paciente · Hilo' }

export default async function PatientPage({ params }: PageProps<'/pacientes/[id]'>) {
  const { id } = await params
  const user = await requireUser()

  const patient = await getPatient(user.id, id)
  if (!patient) notFound()

  const [photoUrl, practitioner, goals, progress, sessions] = await Promise.all([
    getPhotoUrl(patient.photo_path),
    getPractitioner(user.id),
    listGoals(user.id, patient.id),
    listGoalProgress(user.id, patient.id),
    listSessions(user.id, patient.id),
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
          <>
            {/* v1's row, in v1's order (`legacy/index.html:1188`): what you do
                during the session, what you do to measure, what you send out.
                "Generar informe" is the white one because it is the errand
                somebody comes to this screen specifically to run. */}
            <Button
              asChild
              variant="outline"
              className="border-transparent bg-white/16 text-white hover:bg-white/26 hover:text-white max-sm:flex-1"
            >
              <Link href={`/pacientes/${patient.id}/sesiones/nueva`}>
                <Plus className="size-4" />
                Sesión
              </Link>
            </Button>

            {/* Second, as in v1 (`legacy/index.html:1188`), right after
                "Sesión": both are ways of starting one. */}
            <OnlineConsultation
              patientId={patient.id}
              patientName={patient.full_name}
              patientPhone={patient.phone}
              roomUrl={patient.room_id ? videoRoomUrl(patient.room_id) : null}
              videoUrl={patient.video_url}
            />

            <Button
              asChild
              variant="outline"
              className="border-transparent bg-white/16 text-white hover:bg-white/26 hover:text-white max-sm:flex-1"
            >
              <Link href={`/evaluaciones/nueva?paciente=${patient.id}`}>
                <ChartPie className="size-4" />
                Evaluar
              </Link>
            </Button>

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
                Compartir con familia
              </a>
            </Button>

            <Button asChild className="bg-white text-violet hover:bg-white/90 max-sm:flex-1">
              <Link href={`/informes/nuevo?paciente=${patient.id}`}>
                <FileText className="size-4" />
                Generar informe
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución</CardTitle>
              <p className="text-[12.5px] text-muted-foreground">
                {goals.length > 0
                  ? `Avance promedio: ${averageProgress(goals)}%`
                  : 'Avance por objetivo en el tiempo'}
              </p>
            </CardHeader>
            <CardContent>
              <ProgressChart goals={goals} points={progress} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objetivos</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalList patientId={patient.id} goals={goals} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de sesiones</CardTitle>
              <p className="text-[12.5px] text-muted-foreground">
                {sessions.length === 1 ? '1 sesión' : `${sessions.length} sesiones`}
              </p>
            </CardHeader>
            <CardContent>
              <SessionTimeline patientId={patient.id} sessions={sessions} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Motivo de consulta</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.referral_reason ? (
                <p className="text-[13.5px] leading-relaxed">{patient.referral_reason}</p>
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
                {/* v1 stored the abordaje on the patient; here it is the
                    practitioner's own discipline, because a practitioner has
                    exactly one and every patient of theirs is being seen under
                    it. It stays on the ficha because it is what the report says
                    and what the mutualista reads. */}
                <Row label="Abordaje">{disciplineLabel(practitioner.discipline)}</Row>
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
