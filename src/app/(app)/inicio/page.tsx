import { CalendarDays, UserPlus, Users } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { TodaySessionCard } from '@/components/agenda/today-session-card'
import { AskHilo } from '@/components/assistant/ask-hilo'
import { AppTour } from '@/components/onboarding/app-tour'
import { FirstSteps } from '@/components/onboarding/first-steps'
import { PageHeader } from '@/components/page-header'
import { StatCard, StatCardGrid } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { disciplineLabel } from '@/lib/disciplines'
import { firstName } from '@/lib/whatsapp'
import { requireUser } from '@/server/auth'
import { hasAnyGoal } from '@/server/goals'
import { countMaterials } from '@/server/materials'
import { listPatients } from '@/server/patients'
import { todayBriefing } from '@/server/planning'
import { countSessions } from '@/server/sessions'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Inicio · Hilo' }

export default async function HomePage() {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)
  const [patients, todaySessions, sessionCount, goalExists] = await Promise.all([
    listPatients(user.id, { sort: 'recent' }),
    todayBriefing(user.id, practitioner.discipline),
    // Just the numbers, for "Primeros pasos". Both read an index and return no
    // rows.
    countSessions(user.id),
    hasAnyGoal(user.id),
  ])

  // Only while "Primeros pasos" is still on screen, which is a few days out of
  // the life of an account. Once the three steps are done this query stops
  // running.
  const stillOnboarding = patients.length === 0 || sessionCount === 0 || !goalExists
  const materialCount = stillOnboarding
    ? await countMaterials(user.id, practitioner.discipline)
    : 0

  // The briefing carries the patient's name and colour but not their birthday,
  // and the list is already here — no reason to ask the database twice.
  const ageOf = new Map(
    patients.map((patient) => [patient.id, ageLabel(patient.date_of_birth)]),
  )

  return (
    <>
      {/* Runs itself the first time somebody lands here and never again, unless
          they ask for it from "Primeros pasos". It renders nothing until it
          decides, so it costs nothing on every other visit. */}
      <AppTour />

      <PageHeader
        title={`¡Hola, ${firstName(practitioner.full_name)}! 👋`}
        subtitle="Esto es lo que tenés hoy."
        action={
          patients.length > 0 ? (
            <Button asChild size="lg">
              <Link href="/pacientes/nuevo">
                <UserPlus className="size-[18px] max-lg:hidden" />
                Nuevo paciente
              </Link>
            </Button>
          ) : null
        }
      />

      {/* v1's onboarding, and the thing that made the first ten minutes make
          sense (`legacy/index.html:1033`). It removes itself once both steps are
          done, so it never becomes furniture.

          It also *is* the empty state now. There used to be a card underneath
          repeating "Empecemos por tu primer paciente / Nombre, edad y motivo",
          which is what step 1 already says, with a second button going to the
          same form — the same instruction twice, on the first screen anyone
          sees. */}
      <FirstSteps
        hasPatient={patients.length > 0}
        hasSession={sessionCount > 0}
        hasGoal={goalExists}
        firstPatientId={patients[0]?.id ?? null}
        materialCount={materialCount}
        disciplineLabel={disciplineLabel(practitioner.discipline)}
      />

      {patients.length === 0 ? null : (
        <>
          <StatCardGrid className="lg:grid-cols-2">
            <StatCard
              icon={Users}
              tone="violet"
              value={patients.length}
              label="Pacientes activos"
            />
            <StatCard
              icon={CalendarDays}
              tone="amber"
              value={todaySessions.length}
              label="Sesiones hoy"
            />
          </StatCardGrid>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Hoy</CardTitle>
              <p className="text-[12.5px] text-muted-foreground">
                {todaySessions.length === 0
                  ? 'Sin sesiones agendadas'
                  : todaySessions.length === 1
                    ? '1 sesión'
                    : `${todaySessions.length} sesiones`}
              </p>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  Hoy tenés el día libre.{' '}
                  <Link href="/agenda" className="font-semibold text-violet underline">
                    Ver la semana
                  </Link>
                  .
                </p>
              ) : (
                todaySessions.map((session) => (
                  <TodaySessionCard
                    key={session.appointmentId}
                    session={session}
                    ageLabel={ageOf.get(session.patientId)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Last, not first. v1 put the box above the patient list and it
              competed with the work; the question someone has here is about a
              session they have just seen listed above it. */}
          <AskHilo />

          {/* Estadísticas hangs off the foot of Inicio, exactly as in v1
              (`legacy/index.html:568`). It is a place you go once in a while
              after seeing the day, not a destination that deserves a permanent
              seat in the sidebar — and this link is now its only way in. */}
          <div className="mt-4 text-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/estadisticas">Ver estadísticas completas →</Link>
            </Button>
          </div>
        </>
      )}
    </>
  )
}
