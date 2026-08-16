import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ReportForm } from '@/components/documents/report-form'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { recipientsFor, type RecipientId } from '@/lib/recipients'
import { requireUser } from '@/server/auth'
import { listPatients } from '@/server/patients'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Nuevo informe · Hilo' }

export default async function NewReportPage({ searchParams }: PageProps<'/informes/nuevo'>) {
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
        title="Nuevo informe"
        subtitle="Hilo lo escribe con los objetivos, el avance y las notas que ya cargaste."
      />

      <Card>
        <CardContent>
          <ReportForm
            patients={patients.map((patient) => ({
              id: patient.id,
              full_name: patient.full_name,
            }))}
            recipients={recipientsFor(practitioner.discipline)}
            defaultPatientId={
              typeof params.paciente === 'string' ? params.paciente : undefined
            }
            defaultRecipient={
              typeof params.para === 'string' ? (params.para as RecipientId) : undefined
            }
          />
        </CardContent>
      </Card>
    </>
  )
}
