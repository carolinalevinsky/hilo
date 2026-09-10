import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/page-header'
import { SessionAside } from '@/components/sessions/session-aside'
import { SessionForm } from '@/components/sessions/session-form'
import { Card, CardContent } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { listGoals } from '@/server/goals'
import { getPatient } from '@/server/patients'
import { listPlanItems, planSummary } from '@/server/session-plans'
import { listSessions } from '@/server/sessions'
import { currentUser } from '../../../../session'

export const metadata: Metadata = { title: 'Registrar sesión · Hilo' }

export default async function NewSessionPage({
  params,
  searchParams,
}: PageProps<'/pacientes/[id]/sesiones/nueva'>) {
  const { id } = await params
  const { plan } = await searchParams
  const user = await currentUser()

  const patient = await getPatient(user.id, id)
  if (!patient) notFound()

  const goals = await listGoals(user.id, patient.id)

  // Just the previous one, for the column beside the form. `listSessions`
  // already returns newest first, so the limit is the whole query.
  const [previous] = await listSessions(user.id, patient.id, 1)

  // Arriving from the planner: the prepared session fills the form in. The
  // sentence and the ticked goals are a starting point in an editable field —
  // what gets saved is whatever the practitioner leaves there, which is why the
  // plan is read here and not written into a session anywhere.
  const fromPlan = plan === '1'
  const items = fromPlan ? await listPlanItems(user.id, patient.id) : []

  const age = ageLabel(patient.date_of_birth)

  return (
    <>
      <Link
        href={`/pacientes/${patient.id}`}
        className="mb-3 inline-flex items-center gap-1.5 text-body font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la ficha
      </Link>

      <PageHeader
        title="Registrar sesión"
        subtitle={age ? `${patient.full_name} · ${age}` : patient.full_name}
      />

      {/* Two columns, capped so the form keeps a readable line length instead of
          stretching to whatever the monitor is. The cap is the sum of its parts:
          the form's old `max-w-2xl` plus the column and the gap. */}
      <div className="grid max-w-[1000px] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_296px]">
        <Card>
          <CardContent>
            <SessionForm
              patientId={patient.id}
              goals={goals}
              fromPlan={fromPlan}
              noteDraft={planSummary(items)}
              selectedGoalIds={items
                .map((item) => item.goalId)
                .filter((id) => id !== null)}
            />
          </CardContent>
        </Card>

        <SessionAside patient={patient} lastSession={previous ?? null} />
      </div>
    </>
  )
}
