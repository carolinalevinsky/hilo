import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/page-header'
import { SessionForm } from '@/components/sessions/session-form'
import { Card, CardContent } from '@/components/ui/card'
import { requireUser } from '@/server/auth'
import { listGoals } from '@/server/goals'
import { getPatient } from '@/server/patients'

export const metadata: Metadata = { title: 'Registrar sesión · Hilo' }

export default async function NewSessionPage({
  params,
}: PageProps<'/pacientes/[id]/sesiones/nueva'>) {
  const { id } = await params
  const user = await requireUser()

  const patient = await getPatient(user.id, id)
  if (!patient) notFound()

  const goals = await listGoals(user.id, patient.id)

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
          <SessionForm patientId={patient.id} goals={goals} />
        </CardContent>
      </Card>
    </>
  )
}
