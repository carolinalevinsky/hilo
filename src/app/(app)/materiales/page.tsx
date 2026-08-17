import { BookOpen, Plus } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { GenerateMaterial } from '@/components/materials/generate-material'
import { PageHeader } from '@/components/page-header'
import { PlanningTabs } from '@/components/planning/planning-tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { areasFor, materialKindLabel } from '@/lib/material-areas'
import { cn } from '@/lib/utils'
import { requireUser } from '@/server/auth'
import { listMaterials, materialOrigin } from '@/server/materials'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Materiales · Hilo' }

function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

export default async function MaterialsPage({ searchParams }: PageProps<'/materiales'>) {
  const params = await searchParams
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  const area = readParam(params.area)
  const onlyMine = readParam(params.mios) === '1'
  const onlyCommunity = readParam(params.comunidad) === '1'

  const areas = Object.keys(areasFor(practitioner.discipline))

  const materials = await listMaterials(user.id, {
    discipline: practitioner.discipline,
    area,
    onlyMine,
    onlyCommunity,
  })

  return (
    <>
      {/* Same title and subtitle as /planificacion on purpose: to a practitioner
          these are one screen with two tabs, as they were in v1. The URL
          changes; the place you are does not. */}
      <PageHeader
        title="Planificación"
        subtitle="Tu biblioteca de materiales y la planificación de cada paciente, en un solo lugar."
        action={
          // v1 had both here, in this order (`legacy/index.html:615`).
          <div className="flex flex-wrap gap-2">
            <GenerateMaterial areas={areas} />
            <Button asChild size="lg">
              <Link href="/materiales/nuevo">
                <Plus className="size-[18px] max-lg:hidden" />
                Nuevo material
              </Link>
            </Button>
          </div>
        }
      />

      <PlanningTabs />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Chip href="/materiales" active={!area && !onlyMine && !onlyCommunity}>
          Todos
        </Chip>
        {areas.map((name) => (
          <Chip
            key={name}
            href={`/materiales?area=${encodeURIComponent(name)}`}
            active={area === name}
          >
            {name}
          </Chip>
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-border sm:block" />
        <Chip href="/materiales?mios=1" active={onlyMine}>
          Los míos
        </Chip>
        <Chip href="/materiales?comunidad=1" active={onlyCommunity}>
          De la comunidad
        </Chip>
      </div>

      {materials.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title={onlyMine ? 'Todavía no creaste materiales' : 'No hay materiales acá'}
            text={
              onlyMine
                ? 'Cuando armes una actividad que te sirva, guardala y la tenés siempre a mano.'
                : 'Probá con otra área, o creá el tuyo.'
            }
            action={
              <Button asChild>
                <Link href="/materiales/nuevo">Crear un material</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => (
            <li key={material.id}>
              <Link
                href={`/materiales/${material.id}`}
                className="flex h-full flex-col rounded-lg bg-card p-4 shadow-card transition-shadow hover:shadow-[0_8px_24px_rgb(30_36_54_/_9%)]"
              >
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-violet-soft px-2 py-0.5 text-[10.5px] font-bold text-violet">
                    {materialKindLabel(material.kind)}
                  </span>
                  {materialOrigin(material, user.id) === 'mine' ? (
                    <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[10.5px] font-bold text-teal">
                      {material.visibility === 'public' ? 'Tuyo · publicado' : 'Tuyo'}
                    </span>
                  ) : null}
                  {materialOrigin(material, user.id) === 'community' ? (
                    <span className="rounded-full bg-blue-soft px-2 py-0.5 text-[10.5px] font-bold text-[#2f6fd6]">
                      De la comunidad
                    </span>
                  ) : null}
                  {material.source === 'ai' ? (
                    <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[10.5px] font-bold text-[#8a5a12]">
                      IA
                    </span>
                  ) : null}
                  {material.age_range ? (
                    <span className="text-[11px] text-muted-foreground">
                      {material.age_range}
                    </span>
                  ) : null}
                </div>

                <p className="text-[14px] font-bold">{material.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {material.area}
                  {material.focus ? ` › ${material.focus}` : ''}
                </p>
                {material.objective ? (
                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    {material.objective}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Chip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
        active
          ? 'bg-violet text-white'
          : 'border border-border bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </Link>
  )
}
