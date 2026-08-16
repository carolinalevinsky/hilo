import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { deleteMaterialAction } from '@/app/(app)/materiales/actions'
import { DocumentBody } from '@/components/documents/clinical-document'
import { PrintButton } from '@/components/print-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { materialKindLabel } from '@/lib/material-areas'
import { requireUser } from '@/server/auth'
import { getMaterial } from '@/server/materials'

export const metadata: Metadata = { title: 'Material · Hilo' }

/**
 * One material, ready to print.
 *
 * Rendered by the same `DocumentBody` as a clinical report — a heading is a
 * short line ending in a colon, everything else is a paragraph. One renderer
 * for both means a material a practitioner typed and one that shipped with Hilo
 * look identical, and neither goes near `dangerouslySetInnerHTML`.
 */
export default async function MaterialPage({ params }: PageProps<'/materiales/[id]'>) {
  const { id } = await params
  const user = await requireUser()

  // RLS decides what is visible: Hilo's materials, plus this practitioner's own.
  const material = await getMaterial(id)
  if (!material) notFound()

  const isMine = material.practitioner_id === user.id

  return (
    <>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/materiales"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a materiales
        </Link>

        {isMine ? (
          <form action={deleteMaterialAction}>
            <input type="hidden" name="materialId" value={material.id} />
            <Button type="submit" variant="ghost" size="sm">
              Borrar
            </Button>
          </form>
        ) : null}
      </div>

      <Card className="hilo-doc mx-auto max-w-[720px]">
        <CardContent className="px-6 py-7 sm:px-10">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-violet-soft px-2 py-0.5 text-[10.5px] font-bold text-violet">
              {materialKindLabel(material.kind)}
            </span>
            {material.age_range ? (
              <span className="text-[11.5px] text-muted-foreground">
                {material.age_range}
              </span>
            ) : null}
          </div>

          <h1 className="text-[20px] font-extrabold tracking-[-0.4px]">{material.title}</h1>
          <p className="mt-0.5 mb-1 text-[12.5px] text-muted-foreground">
            {material.area}
            {material.focus ? ` › ${material.focus}` : ''}
          </p>
          {material.objective ? (
            <p className="mb-4 text-[13px] text-muted-foreground">{material.objective}</p>
          ) : null}

          <div className="border-t border-border pt-4">
            <DocumentBody text={material.content} />
          </div>
        </CardContent>
      </Card>

      <div className="no-print mx-auto mt-3 max-w-[720px]">
        <PrintButton label="Imprimir el material" />
      </div>
    </>
  )
}
