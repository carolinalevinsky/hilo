import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { PlanningImport } from '@/components/materials/planning-import'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { pageTitle } from '@/lib/brand'
import { areasFor } from '@/lib/material-areas'
import { currentSession } from '../../session'

export const metadata: Metadata = { title: pageTitle('Importar planificaciones') }

/**
 * The plans a practitioner already wrote, turned into materials in her library.
 * See `src/server/planning-import.ts`.
 */
export default async function ImportPlanningPage() {
  const { practitioner } = await currentSession()

  return (
    <>
      <Link
        href="/materiales"
        className="mb-3 inline-flex items-center gap-1.5 text-body font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a materiales
      </Link>

      <PageHeader
        title="Importar planificaciones"
        subtitle="Subí una planificación que ya tenés y cada actividad queda guardada como un material tuyo."
      />

      <Card className="max-w-3xl">
        <CardContent>
          <PlanningImport areas={Object.keys(areasFor(practitioner.discipline))} />
        </CardContent>
      </Card>
    </>
  )
}
