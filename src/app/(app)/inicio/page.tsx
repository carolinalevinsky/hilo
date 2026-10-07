import { ArrowRight, CalendarDays, Sun, UserPlus, Users } from '@/components/icons'
import { agreementFor } from '@/lib/grammatical-gender'
import type { Metadata } from 'next'
import Link from 'next/link'

import { TodaySessionCard } from '@/components/agenda/today-session-card'
import { Ask } from '@/components/assistant/ask'
import { AppTour } from '@/components/onboarding/app-tour'
import { FirstSteps } from '@/components/onboarding/first-steps'
import { PageHeader } from '@/components/page-header'
import { StatCard, StatCardGrid } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { formatDayMonthShort, today, todayDate } from '@/lib/dates'
import { weekdayName } from '@/lib/week'
import { firstName } from '@/lib/whatsapp'
import { firstSteps } from '@/server/first-steps'
import { listPatients } from '@/server/patients'
import { todayBriefing } from '@/server/planning'
import { currentSession } from '../session'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Inicio') }

export default async function HomePage() {
  const { user, practitioner } = await currentSession()
  const [patients, todaySessions, steps] = await Promise.all([
    listPatients(user.id, { sort: 'recent' }),
    todayBriefing(user.id, practitioner.discipline),
    // Just the numbers, for "Primeros pasos". They read an index and return no
    // rows.
    firstSteps(user.id),
  ])

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
      {/* Una vez por cuenta, no por navegador: la marca vive en
          `practitioners.onboarded_at`. */}
      <AppTour
        seen={practitioner.onboarded_at !== null}
        agreement={agreementFor(practitioner.grammatical_gender, practitioner.full_name)}
      />

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
          sense (`legacy/index.html:1033`). It removes itself once the steps are
          done, so it never becomes furniture.

          It also *is* the empty state now. There used to be a card underneath
          repeating "Empecemos por tu primer paciente / Nombre, edad y motivo",
          which is what step 1 already says, with a second button going to the
          same form — the same instruction twice, on the first screen anyone
          sees. */}
      <FirstSteps
        hasPatient={steps.hasPatient}
        hasPlan={steps.hasPlan}
        hasSeenPayments={steps.hasSeenPayments}
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
            {/* No line counting the sessions any more: the "Sesiones hoy" card
                is an inch above and states the same number, and the list itself
                is right below. The same fact three times on one screen does not
                inform better, it just makes the screen harder to read. */}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Hoy
                <span className="rounded-md bg-muted px-2 py-0.5 text-meta font-medium text-muted-foreground">
                  {weekdayName(todayDate().getDay())}, {formatDayMonthShort(today())}
                </span>
              </CardTitle>
              {/* El estado del día, sólo cuando hay algo que decir. Con sesiones
                  por delante la lista de abajo ya lo cuenta, y un renglón que
                  repita cuántas son sería la misma cifra por tercera vez en la
                  pantalla. */}
              {todaySessions.length === 0 ? (
                <CardAction className="flex items-center gap-1.5 text-meta text-muted-foreground">
                  <span className="size-2 rounded-full bg-green" />
                  Jornada despejada
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <div className="flex flex-col items-center rounded-[16px] bg-gradient-to-b from-muted/60 to-transparent px-4 py-10 text-center">
                  <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-violet-soft text-violet">
                    <Sun className="size-9" />
                  </span>
                  <p className="text-lead font-bold">Hoy tenés el día libre.</p>
                  <p className="mt-1.5 max-w-sm text-body leading-relaxed text-muted-foreground">
                    No tenés sesiones programadas para el resto de la jornada. Podés
                    revisar el cronograma general o preparar evaluaciones.
                  </p>
                  <Link
                    href="/agenda"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-violet-soft px-5 py-2.5 text-item font-bold text-violet transition-colors hover:bg-violet/15"
                  >
                    Ver la semana
                    <ArrowRight className="size-[18px]" />
                  </Link>
                </div>
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
          <Ask />

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
