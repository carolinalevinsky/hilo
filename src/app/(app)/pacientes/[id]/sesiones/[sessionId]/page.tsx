import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { deleteSessionAction } from '@/app/(app)/pacientes/session-actions'
import { PageHeader } from '@/components/page-header'
import { SessionForm } from '@/components/sessions/session-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listGoals } from '@/server/goals'
import { getPatient } from '@/server/patients'
import { getSession } from '@/server/sessions'
import { currentUser } from '../../../../session'

export const metadata: Metadata = { title: 'Editar registro · Hilo' }

export default async function EditSessionPage({
  params,
}: PageProps<'/pacientes/[id]/sesiones/[sessionId]'>) {
  const { id, sessionId } = await params
  const user = await currentUser()

  const [patient, session] = await Promise.all([
    getPatient(user.id, id),
    getSession(user.id, sessionId),
  ])
  if (!patient || !session) notFound()

  // Inactive goals are included: a session may have worked a goal that has since
  // been closed, and unticking it silently on save would rewrite history.
  const goals = await listGoals(user.id, patient.id, { includeInactive: true })

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

          <form action={deleteSessionAction} className="border-t border-border pt-4">
            <input type="hidden" name="patientId" value={patient.id} />
            <input type="hidden" name="sessionId" value={session.id} />
            <Button type="submit" variant="ghost" size="sm">
              Borrar este registro
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Usalo solo si lo cargaste por error: el registro de una sesión que no pasó
              desvirtúa las estadísticas y los informes.
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
