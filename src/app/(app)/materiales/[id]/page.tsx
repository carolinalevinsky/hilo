import { ArrowLeft, Copy, Pencil } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { copyMaterialAction, deleteMaterialAction } from '@/app/(app)/materiales/actions'
import { DocumentBody } from '@/components/documents/clinical-document'
import { AddMaterialToSession } from '@/components/materials/add-to-session'
import { PrintButton } from '@/components/print-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { materialKindLabel } from '@/lib/material-areas'
import { requireUser } from '@/server/auth'
import { getMaterial, materialOrigin } from '@/server/materials'
import { listPatients } from '@/server/patients'

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
  const [material, patients] = await Promise.all([getMaterial(id), listPatients(user.id)])
  if (!material) notFound()

  const origin = materialOrigin(material, user.id)
  const isMine = origin === 'mine'

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

        <div className="flex items-center gap-1.5">
          {isMine ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/materiales/${material.id}/editar`}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              </Button>
              <form action={deleteMaterialAction}>
                <input type="hidden" name="materialId" value={material.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Borrar
                </Button>
              </form>
            </>
          ) : (
            // Hilo's own materials and other people's published ones: copying is
            // how you get one you can change. See `copyMaterial` for why it is a
            // copy and not a reference.
            <form action={copyMaterialAction}>
              <input type="hidden" name="materialId" value={material.id} />
              <Button type="submit" variant="outline" size="sm">
                <Copy className="size-4" />
                Copiar a mi biblioteca
              </Button>
            </form>
          )}
        </div>
      </div>

      <Card className="hilo-doc mx-auto max-w-[720px]">
        <CardContent className="px-6 py-7 sm:px-10">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-violet-soft px-2 py-0.5 text-[10.5px] font-bold text-violet">
              {materialKindLabel(material.kind)}
            </span>
            {origin === 'community' ? (
              <span className="rounded-full bg-blue-soft px-2 py-0.5 text-[10.5px] font-bold text-[#2f6fd6]">
                De la comunidad
              </span>
            ) : null}
            {material.source === 'ai' ? (
              <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[10.5px] font-bold text-[#8a5a12]">
                Generado con IA
              </span>
            ) : null}
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

          {/* The byline is frozen on the row at publishing time — a practitioner
              cannot read another practitioner's profile, and should not be able
              to. See the migration for why it is denormalised. */}
          {origin === 'community' && material.author_name ? (
            <p className="mb-4 text-[12.5px] text-muted-foreground">
              Publicado por <b>{material.author_name}</b> · comunidad Hilo
            </p>
          ) : null}

          <div className="border-t border-border pt-4">
            <DocumentBody text={material.content} />
          </div>
        </CardContent>
      </Card>

      {/* v1 put this under the open material (`legacy/index.html:812`), and it
          is what closes the loop: you open a material because you are looking
          for something to do with somebody. */}
      <div className="no-print mx-auto mt-3 flex max-w-[720px] flex-wrap items-center justify-between gap-3">
        <AddMaterialToSession
          materialId={material.id}
          patients={patients.map((row) => ({ id: row.id, full_name: row.full_name }))}
        />
        <PrintButton label="Imprimir el material" />
      </div>
      <p className="no-print mx-auto mt-2 max-w-[720px] text-xs text-muted-foreground">
        Elegís a qué paciente se lo sumás y queda en su próxima sesión.
      </p>
    </>
  )
}
