import { ArrowLeft } from '@/components/icons'
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
        className="mb-3 inline-flex items-center gap-1.5 text-body font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a pacientes
      </Link>

      <PageHeader
        title="Nuevo paciente"
        subtitle="Con el nombre alcanza para empezar. El resto lo completás cuando quieras."
      />

      {/* `max-w-2xl` put the whole alta in a 672px column and left half of a
          desktop empty, which made creating a patient look like far more work
          than it is. The cap stays — a field stretched across a 27" monitor is
          unreadable — but it is now wide enough for the three-column grid the
          form lays out at `xl`. */}
      <Card className="max-w-[1400px]">
        <CardContent>
          <PatientForm />
        </CardContent>
      </Card>
    </>
  )
}
