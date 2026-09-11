import { ArrowLeft, ChartPie, FileText, MessageCircle, Pencil, Plus } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { HiloMemory, PatientDocuments } from '@/components/documents/patient-documents'
import { GoalList } from '@/components/goals/goal-list'
import { ProgressChart } from '@/components/goals/progress-chart'
import { PatientActions } from '@/components/patients/patient-actions'
import { PatientDangerZone } from '@/components/patients/patient-danger-zone'
import { OnlineConsultation } from '@/components/patients/online-consultation'
import { NextSessionCard } from '@/components/planning/next-session-card'
import { PatientHeader } from '@/components/patients/patient-header'
import { SessionTimeline } from '@/components/sessions/session-timeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { formatDate } from '@/lib/dates'
import { disciplineLabel } from '@/lib/disciplines'
import { ageGroupLabel, billingFrequencyLabel, guardianSummary } from '@/lib/patient-labels'
import { firstName, whatsappLink } from '@/lib/whatsapp'
import { videoRoomUrl } from '@/lib/video'
import { listSchedules, nextAppointmentFor } from '@/server/appointments'
import { listAssessments } from '@/server/assessments'
import { averageProgress, listGoalProgress, listGoals } from '@/server/goals'
import { getPatient, getPhotoUrl } from '@/server/patients'
import { listReports } from '@/server/reports'
import { listPlanItems } from '@/server/session-plans'
import { listSessions } from '@/server/sessions'

import { currentPractitioner, currentUser } from '../../session'

export const metadata: Metadata = { title: 'Paciente · Hilo' }

export default async function PatientPage({ params }: PageProps<'/pacientes/[id]'>) {
  const { id } = await params
  const user = await currentUser()

  const patient = await getPatient(user.id, id)
  if (!patient) notFound()

  const [
    photoUrl,
    practitioner,
    goals,
    progress,
    sessions,
    planItems,
    assessments,
    reports,
    schedules,
    nextAppointment,
  ] = await Promise.all([
    getPhotoUrl(patient.photo_path),
    currentPractitioner(user.id),
    listGoals(user.id, patient.id),
    listGoalProgress(user.id, patient.id),
    listSessions(user.id, patient.id),
    listPlanItems(user.id, patient.id),
    listAssessments(user.id, patient.id),
    listReports(user.id, patient.id),
    // Para saber si al archivar hay que preguntar algo. Sin horario fijo no hay
    // nada que decidir y la pregunta sería ruido.
    listSchedules(user.id, patient.id),
    nextAppointmentFor(user.id, patient.id),
  ])

  // Nothing clinical travels in a WhatsApp message — it says who it is about and
  // that the practitioner is there. The content stays behind the login.
  const shareText = `Hola! Te escribo por ${firstName(patient.full_name)}. Cualquier cosa quedo a las órdenes. Saludos, ${firstName(practitioner.full_name)}.`

  const fichaRows = [
    { label: 'Edad', value: ageLabel(patient.date_of_birth) },
    { label: 'Población', value: ageGroupLabel(patient.age_group) },
    { label: 'Escolaridad', value: patient.school_level },
    { label: 'Colegio', value: patient.school },
    { label: 'Mutualista', value: patient.health_insurer },
    // v1 stored the abordaje on the patient; here it is the practitioner's own
    // discipline, because a practitioner has exactly one and every patient of
    // theirs is being seen under it. It stays on the ficha because it is what
    // the report says and what the mutualista reads.
    { label: 'Abordaje', value: disciplineLabel(practitioner.discipline) },
    // Only for a minor. An adult is their own responsable, and a "Responsable"
    // row would then sit in the "Sin cargar" line forever, naming something
    // that does not apply.
    ...(patient.age_group === 'adults'
      ? []
      : [
          {
            label: 'Responsable',
            value: guardianSummary(patient.guardian_name, patient.guardian_relationship),
          },
        ]),
    { label: 'Teléfono', value: patient.phone },
    { label: 'Inicio', value: formatDate(patient.start_date) },
    {
      label: 'Honorario',
      value: patient.session_fee
        ? `$ ${patient.session_fee} · ${billingFrequencyLabel(patient.billing_frequency).toLowerCase()}`
        : null,
    },
  ]

  const missingFicha = fichaRows
    .filter((row) => !row.value)
    .map((row) => row.label.toLowerCase())

  return (
    <>
      <Link
        href="/pacientes"
        className="mb-3 inline-flex items-center gap-1.5 text-body font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a pacientes
      </Link>

      <PatientHeader
        patient={patient}
        photoUrl={photoUrl}
        actions={
          // v1's row, in v1's order (`legacy/index.html:1188`): what you do
          // during the session, what you do to measure, what you send out.
          // "Generar informe" is the white one because it is the errand
          // somebody comes to this screen specifically to run.
          //
          // On a phone only the first and the last stay out; the other four are
          // behind "Más". Six of these filled 490 px of an 812 px screen before
          // the child's age. See `PatientActions`.
          <PatientActions
            primary={
              <>
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

                <Button
                  asChild
                  className="bg-white text-violet hover:bg-white/90 max-sm:flex-1"
                >
                  <Link href={`/informes/nuevo?paciente=${patient.id}`}>
                    <FileText className="size-4" />
                    Generar informe
                  </Link>
                </Button>
              </>
            }
            secondary={
              <>
                {/* Second in v1 (`legacy/index.html:1188`), right after
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

                {/* Sin teléfono no hay a quién escribirle: el link saldría
                    `wa.me/?text=…`, sin número, y WhatsApp abre sin
                    destinatario. Entonces el botón dice lo que falta y lleva a
                    cargarlo. Misma regla que "Recordar" en la Agenda. */}
                {patient.phone ? (
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
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="border-transparent bg-white/16 text-white hover:bg-white/26 hover:text-white max-sm:flex-1"
                  >
                    <Link href={`/pacientes/${patient.id}/editar`}>
                      <MessageCircle className="size-4" />
                      Cargar teléfono
                    </Link>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  className="border-transparent bg-white/16 text-white hover:bg-white/26 hover:text-white max-sm:flex-1"
                >
                  <Link href={`/pacientes/${patient.id}/editar`}>
                    <Pencil className="size-4" />
                    Editar ficha
                  </Link>
                </Button>
              </>
            }
          />
        }
      />

      {/* En escritorio son dos columnas y la angosta va a la derecha. En
          teléfono se apilan, y apilada la angosta caía al final: el motivo de
          consulta arrancaba en y 1788 y la ficha en y 1916, o sea 2,4 pantallas
          de scroll para llegar a quién es el chico. Es lo que no cambia nunca y
          lo que más se mira, así que en teléfono sube primero. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4 max-lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Evolución</CardTitle>
              <p className="text-meta text-muted-foreground">
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

          {/* v1 put what you prepared right here, above the history
              (`legacy/index.html:1674`). A plan is only worth making if it is on
              the screen you open with the child already in the room. */}
          <NextSessionCard
            next={nextAppointment}
            patientId={patient.id}
            patientFirstName={firstName(patient.full_name)}
            items={planItems}
          />

          {/* v1's card, right after "Próxima sesión" (`legacy/index.html:1219`).
              `/informes` lists everybody's, which is the right screen for "what
              did I write this month" and the wrong one for "what do I already
              have on this child" — the question you ask while looking at them. */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones e informes</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientDocuments assessments={assessments} reports={reports} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de sesiones</CardTitle>
              <p className="text-meta text-muted-foreground">
                {sessions.length === 1 ? '1 sesión' : `${sessions.length} sesiones`}
              </p>
            </CardHeader>
            <CardContent>
              <SessionTimeline patientId={patient.id} sessions={sessions} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 max-lg:order-1">
          {/* v1 put this at the top of the right column. It looks like
              decoration and is not: it answers the doubt a practitioner has in
              month one, which is whether they are writing all this into a
              hole.

              En teléfono se va al final de las tres: la columna entera sube
              para que el motivo y la ficha queden arriba, y esto es lo único de
              acá que no hace falta a los dos segundos de abrir la pantalla. */}
          <Card className="max-lg:order-3">
            <CardHeader>
              <CardTitle>Memoria de Hilo</CardTitle>
            </CardHeader>
            <CardContent>
              <HiloMemory
                firstName={firstName(patient.full_name)}
                sessions={sessions.length}
                goals={goals.length}
              />
            </CardContent>
          </Card>

          <Card className="max-lg:order-1">
            <CardHeader>
              <CardTitle>Motivo de consulta</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.referral_reason ? (
                <p className="text-body leading-relaxed">{patient.referral_reason}</p>
              ) : (
                <p className="text-body text-muted-foreground">
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

          <Card className="max-lg:order-2">
            <CardHeader>
              <CardTitle>Ficha</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Only the rows that have something in them. A ficha filled in
                  during a first appointment is mostly empty, and nine labels
                  each answered "Sin datos" is a wall that hides the two answers
                  that exist. What is missing is still said — once, at the end,
                  naming the fields and linking to where they are filled in. */}
              <dl className="grid grid-cols-[105px_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-body">
                {fichaRows
                  .filter((row) => row.value)
                  .map((row) => (
                    <Row key={row.label} label={row.label} value={row.value!} />
                  ))}
              </dl>

              {missingFicha.length > 0 ? (
                <p className="mt-3 border-t border-border pt-3 text-meta leading-relaxed text-muted-foreground">
                  Sin cargar: {listEs(missingFicha)}.{' '}
                  <Link
                    href={`/pacientes/${patient.id}/editar`}
                    className="font-semibold text-violet underline"
                  >
                    Completar
                  </Link>
                </p>
              ) : null}

              <PatientDangerZone
                patientId={patient.id}
                fullName={patient.full_name}
                archived={Boolean(patient.archived_at)}
                scheduleCount={schedules.length}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

/** One filled-in ficha field. Empty ones are not rendered at all — see the
 *  "Sin cargar" line that replaces them. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </>
  )
}

/** "escolaridad, colegio y mutualista" — the Spanish list, with the "y" that a
 *  join(', ') does not give you. */
function listEs(items: string[]) {
  return new Intl.ListFormat('es-UY', { style: 'long', type: 'conjunction' }).format(items)
}
