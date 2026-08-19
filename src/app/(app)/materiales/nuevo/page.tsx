import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { MaterialForm } from '@/components/materials/material-form'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { areasFor } from '@/lib/material-areas'
import { requireUser } from '@/server/auth'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Nuevo material · Hilo' }

export default async function NewMaterialPage() {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  return (
    <>
      <Link
        href="/materiales"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a materiales
      </Link>

      <PageHeader
        title="Nuevo material"
        subtitle="Guardá una actividad tuya y la tenés siempre a mano."
      />

      <Card className="max-w-2xl">
        <CardContent>
          <MaterialForm areas={areasFor(practitioner.discipline)} />
        </CardContent>
      </Card>
    </>
  )
}
