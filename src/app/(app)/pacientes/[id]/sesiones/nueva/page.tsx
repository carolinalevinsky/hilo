import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/page-header'
import { SessionForm } from '@/components/sessions/session-form'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser } from '@/server/auth'
import { listGoals } from '@/server/goals'
import { getPatient } from '@/server/patients'
import { listPlanItems, planSummary } from '@/server/session-plans'

export const metadata: Metadata = { title: 'Registrar sesión · Hilo' }

export default async function NewSessionPage({
  params,
  searchParams,
}: PageProps<'/pacientes/[id]/sesiones/nueva'>) {
  const { id } = await params
  const { plan } = await searchParams
  const user = await requireUser()

  const patient = await getPatient(user.id, id)
  if (!patient) notFound()

  const goals = await listGoals(user.id, patient.id)

  // Arriving from the planner: the prepared session fills the form in. The
  // sentence and the ticked goals are a starting point in an editable field —
  // what gets saved is whatever the practitioner leaves there, which is why the
  // plan is read here and not written into a session anywhere.
  const fromPlan = plan === '1'
  const items = fromPlan ? await listPlanItems(user.id, patient.id) : []

  return (
    <>
      <Link
        href={`/pacientes/${patient.id}`}
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la ficha
      </Link>

      <PageHeader title="Registrar sesión" subtitle={patient.full_name} />

      <Card>
        <CardContent>
          <SessionForm
            patientId={patient.id}
            goals={goals}
            fromPlan={fromPlan}
            noteDraft={planSummary(items)}
            selectedGoalIds={items.map((item) => item.goalId).filter((id) => id !== null)}
          />
        </CardContent>
      </Card>
    </>
  )
}
