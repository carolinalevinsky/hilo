import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { PatientImport } from '@/components/patients/patient-import'
import { Card, CardContent } from '@/components/ui/card'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Importar pacientes') }

/**
 * Bringing in the patients a practitioner already keeps in a spreadsheet, so
 * starting with Ombúa does not mean typing them all again. See
 * `src/server/patient-import.ts`.
 */
export default function ImportPatientsPage() {
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
        title="Importar pacientes"
        subtitle="Si ya tenés tus pacientes en una planilla, los cargás todos de una vez."
      />

      <Card className="max-w-[1100px]">
        <CardContent>
          <PatientImport />
        </CardContent>
      </Card>
    </>
  )
}
