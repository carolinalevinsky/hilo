import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MaterialForm } from '@/components/materials/material-form'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { areasFor } from '@/lib/material-areas'
import { requireUser } from '@/server/auth'
import { getMaterial } from '@/server/materials'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Editar material · Hilo' }

/**
 * Editing a material you wrote.
 *
 * v1 made the material `contenteditable` — you typed into the document and
 * nothing was saved, so every change was gone on reload. Same affordance, in a
 * form that persists.
 *
 * Only your own: Hilo's shipped materials and other practitioners' published
 * ones are read-only here, and the way to change one of those is to copy it.
 */
export default async function EditMaterialPage({
  params,
  searchParams,
}: PageProps<'/materiales/[id]/editar'>) {
  const { id } = await params
  const { generar } = await searchParams
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  const material = await getMaterial(id)
  // 404 rather than a message, and the same 404 whether the material belongs to
  // somebody else or does not exist: "this id is not yours" is itself a fact
  // about another practitioner's library.
  if (!material || material.practitioner_id !== user.id) notFound()

  return (
    <>
      <Link
        href={`/materiales/${material.id}`}
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al material
      </Link>

      <PageHeader title="Editar material" subtitle={material.title} />

      <Card>
        <CardContent>
          <MaterialForm
            areas={areasFor(practitioner.discipline)}
            material={material}
            generateFor={typeof generar === 'string' ? generar : undefined}
          />
        </CardContent>
      </Card>
    </>
  )
}
