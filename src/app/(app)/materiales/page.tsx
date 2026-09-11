import { BookOpen, Plus } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { GenerateMaterial } from '@/components/materials/generate-material'
import { MaterialFilters } from '@/components/materials/material-filters'
import { MaterialSearch } from '@/components/materials/material-search'
import { UploadMaterial } from '@/components/materials/upload-material'
import { PageHeader } from '@/components/page-header'
import { PlanningTabs } from '@/components/planning/planning-tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { areasFor, materialKindLabel } from '@/lib/material-areas'
import { MATERIALS_PAGE, materialOrigin, pageMaterials } from '@/server/materials'
import { currentSession } from '../session'

export const metadata: Metadata = { title: 'Materiales · Hilo' }

function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

export default async function MaterialsPage({ searchParams }: PageProps<'/materiales'>) {
  const params = await searchParams
  const { user, practitioner } = await currentSession()

  const area = readParam(params.area)
  const onlyMine = readParam(params.mios) === '1'
  const onlyCommunity = readParam(params.comunidad) === '1'
  const search = readParam(params.q)?.trim() ?? ''

  const areas = Object.keys(areasFor(practitioner.discipline))

  /** Whether anything is narrowing the list right now. */
  const isFiltered = Boolean(search || area || onlyMine || onlyCommunity)

  // How many are on screen (P18): 30, and 30 more each time "Ver más" is
  // pressed. It lives in the URL so a reload keeps what you had open. Rounded to
  // whole pages and capped, so a hand-typed `?ver=` cannot ask for the whole
  // library at once — which is the thing this replaced.
  const asked = Number(readParam(params.ver))
  const shown = Math.min(
    Math.max(Math.ceil((Number.isFinite(asked) ? asked : 0) / MATERIALS_PAGE), 1) * MATERIALS_PAGE,
    MATERIALS_PAGE * 20,
  )

  const { materials, total } = await pageMaterials(
    user.id,
    { discipline: practitioner.discipline, area, onlyMine, onlyCommunity, search },
    shown,
  )

  // "Ver más" keeps the search and the filter it was pressed under.
  const more = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value) more.set(key, value)
  }
  more.set('ver', String(shown + MATERIALS_PAGE))

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
            <UploadMaterial areas={areas} />
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

      {/* La caja de buscar vivía sólo en el planificador. Acá, que es donde
          alguien mira las cincuenta de su profesión más lo que publicó la
          comunidad, había únicamente filtros por área: para encontrar algo por
          su nombre había que cambiar de pestaña. */}
      <div className="mb-3">
        <MaterialSearch initial={search} />
      </div>

      {/* Los chips y la lista van juntos porque comparten un dato: si hay una
          búsqueda en curso. El chip se pinta al tocarlo y la lista se atenúa
          hasta que llega la respuesta. La lista sigue siendo servidor: entra
          como `children` y no se vuelve cliente por pasar por ahí. */}
      <MaterialFilters areas={areas}>
      {/* Only while something is narrowing the list. The size of the whole
          library is a number nobody acts on; whether the filter you just
          touched found three things or thirty is the whole question, and
          without it a shorter grid is indistinguishable from a grid that
          happens to fit on screen. Inside `children`, so it dims along with
          the list while the next search is in flight. */}
      {isFiltered ? (
        <p className="mb-2.5 text-meta text-muted-foreground">
          {total === 1 ? '1 material' : `${total} materiales`}
        </p>
      ) : null}

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
                  <span className="rounded-full bg-violet-soft px-2 py-0.5 text-micro font-bold text-violet">
                    {materialKindLabel(material.kind)}
                  </span>
                  {materialOrigin(material, user.id) === 'mine' ? (
                    <span className="rounded-full bg-teal-soft px-2 py-0.5 text-micro font-bold text-teal">
                      {material.visibility === 'public' ? 'Tuyo · publicado' : 'Tuyo'}
                    </span>
                  ) : null}
                  {materialOrigin(material, user.id) === 'community' ? (
                    <span className="rounded-full bg-blue-soft px-2 py-0.5 text-micro font-bold text-[#2f6fd6]">
                      De la comunidad
                    </span>
                  ) : null}
                  {material.source === 'ai' ? (
                    <span className="rounded-full bg-amber-soft px-2 py-0.5 text-micro font-bold text-[#8a5a12]">
                      IA
                    </span>
                  ) : null}
                  {material.age_range ? (
                    <span className="text-micro text-muted-foreground">
                      {material.age_range}
                    </span>
                  ) : null}
                </div>

                <p className="text-item font-bold">{material.title}</p>
                <p className="mt-0.5 text-meta text-muted-foreground">
                  {material.area}
                  {material.focus ? ` › ${material.focus}` : ''}
                </p>
                {material.objective ? (
                  <p className="mt-2 line-clamp-2 text-meta leading-relaxed text-muted-foreground">
                    {material.objective}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* A link, not a button with state: the next page is a URL, so the back
          button and a reload both land where you were. `scroll={false}` keeps
          you at the bottom of the list, where the new ones appear. */}
      {materials.length < total ? (
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <Button asChild variant="outline">
            <Link href={`/materiales?${more.toString()}`} scroll={false}>
              Ver más
            </Link>
          </Button>
          <p className="text-meta text-muted-foreground">
            Estás viendo {materials.length} de {total}.
          </p>
        </div>
      ) : null}
      </MaterialFilters>
    </>
  )
}
