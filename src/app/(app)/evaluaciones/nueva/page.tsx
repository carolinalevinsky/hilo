import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { AssessmentForm } from '@/components/documents/assessment-form'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { instrumentsFor } from '@/lib/instruments'
import { requireUser } from '@/server/auth'
import { listPatients } from '@/server/patients'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Nueva evaluación · Hilo' }

export default async function NewAssessmentPage({
  searchParams,
}: PageProps<'/evaluaciones/nueva'>) {
  const params = await searchParams
  const user = await requireUser()

  const [practitioner, patients] = await Promise.all([
    getPractitioner(user.id),
    listPatients(user.id),
  ])

  return (
    <>
      <Link
        href="/informes"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a informes
      </Link>

      <PageHeader
        title="Nueva evaluación"
        subtitle="Cargá los puntajes y Hilo escribe la interpretación para que la revises."
      />

      <Card>
        <CardContent>
          <AssessmentForm
            patients={patients.map((patient) => ({
              id: patient.id,
              full_name: patient.full_name,
            }))}
            instruments={instrumentsFor(practitioner.discipline)}
            defaultPatientId={
              typeof params.paciente === 'string' ? params.paciente : undefined
            }
          />
        </CardContent>
      </Card>
    </>
  )
}
