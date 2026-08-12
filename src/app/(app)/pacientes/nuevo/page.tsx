import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { PatientForm } from '@/components/patients/patient-form'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Nuevo paciente · Hilo' }

export default function NewPatientPage() {
  return (
    <>
      <Link
        href="/pacientes"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a pacientes
      </Link>

      <PageHeader
        title="Nuevo paciente"
        subtitle="Con el nombre alcanza para empezar. El resto lo completás cuando quieras."
      />

      <Card>
        <CardContent>
          <PatientForm />
        </CardContent>
      </Card>
    </>
  )
}
