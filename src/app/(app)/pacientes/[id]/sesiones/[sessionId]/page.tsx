import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { trashSessionAction } from '@/app/(app)/pacientes/session-actions'
import { ConfirmAction } from '@/components/confirm-action'
import { PageHeader } from '@/components/page-header'
import { SessionForm } from '@/components/sessions/session-form'
import { Card, CardContent } from '@/components/ui/card'
import { listGoals } from '@/server/goals'
import { getPatient } from '@/server/patients'
import { getSession } from '@/server/sessions'
import { currentUser } from '../../../../session'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Editar registro') }

export default async function EditSessionPage({
  params,
}: PageProps<'/pacientes/[id]/sesiones/[sessionId]'>) {
  const { id, sessionId } = await params
  const user = await currentUser()

  const [patient, session, goals] = await Promise.all([
    getPatient(user.id, id),
    getSession(user.id, sessionId),
    // Inactive goals are included: a session may have worked a goal that has
    // since been closed, and unticking it silently on save would rewrite history.
    listGoals(user.id, id, { includeInactive: true }),
  ])
  if (!patient || !session) notFound()

  return (
    <>
      <Link
        href={`/pacientes/${patient.id}`}
        className="mb-3 inline-flex items-center gap-1.5 text-body font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la ficha
      </Link>

      {/* "Registro", not "sesión" (P13): the session is the hour in the agenda,
          and what is edited here is what was written about it. */}
      <PageHeader title="Editar registro" subtitle={patient.full_name} />

      <Card className="max-w-2xl">
        <CardContent className="space-y-5">
          <SessionForm
            patientId={patient.id}
            goals={goals}
            session={session}
            selectedGoalIds={session.session_goals.map((link) => link.goal_id)}
          />

          <div className="border-t border-border pt-4">
            <ConfirmAction
              action={trashSessionAction}
              fields={{ patientId: patient.id, sessionId: session.id }}
              trigger="Mandar a la papelera"
              title="¿Mandar este registro a la papelera?"
              description="Deja de contar en las estadísticas y en los informes. Lo podés recuperar cuando quieras desde la papelera, en la ficha del paciente."
              confirmLabel="Mandar a la papelera"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Usalo si lo cargaste por error: el registro de una sesión que no pasó
              desvirtúa las estadísticas y los informes.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
