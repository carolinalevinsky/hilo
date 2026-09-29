import Link from 'next/link'

import { addMaterialToPlanAction } from '@/app/(app)/planificacion/actions'
import { BookOpen, Plus } from '@/components/icons'
import { MaterialSearch } from '@/components/materials/material-search'
import { InPlanChip } from '@/components/planning/in-plan-chip'
import { LibraryAreas } from '@/components/planning/library-areas'
import { PlanFields, type PlanTarget } from '@/components/planning/plan-fields'
import { PlanningPanel } from '@/components/planning/planning-panel'
import { Button } from '@/components/ui/button'
import type { MaterialSummary } from '@/server/materials'

/**
 * The library, as a picker inside the planner.
 *
 * Ten results, as in v1: this is a column, not the library — the library itself
 * is one click away and shows thirty at a time with its own filters. What is
 * wanted here is the material you already have in mind.
 */
/**
 * Cuántos entran en la tira. Se ven cuatro y el resto se llega deslizando: es
 * una tira para elegir rápido, no la biblioteca — ésa está a un click.
 */
const SHOWN = 16

export function LibraryPicker({
  target,
  search,
  areas,
  results,
  inPlan,
}: {
  target: PlanTarget
  search: string
  /** Las áreas de la profesión, para los chips. */
  areas: string[]
  results: MaterialSummary[]
  /** Material id → the row of the plan it is in, so the chip can take it out. */
  inPlan: Map<string, string>
}) {
  return (
    <PlanningPanel
      icon={BookOpen}
      tone="blue"
      title="Buscar materiales en la biblioteca"
      hint="Los materiales de tu profesión y los que publicó la comunidad."
      aside={
        <Link
          href="/materiales"
          className="text-meta font-semibold text-violet hover:underline"
        >
          Explorar →
        </Link>
      }
    >
      <MaterialSearch initial={search} />

      <div className="mt-3">
        <LibraryAreas areas={areas} />
      </div>

      <div className="mt-3">
        {results.length === 0 ? (
          <p className="text-meta text-muted-foreground">
            Sin resultados. Probá otra palabra o sacá el filtro de área.
          </p>
        ) : (
          /* Una tira que se desliza: cuatro fichas a la vista y el resto al
             costado. Apiladas, diez materiales empujaban el panel de abajo
             fuera de la pantalla; en tira, la biblioteca ocupa lo mismo tenga
             tres o dieciséis. `snap` para que no queden fichas cortadas al
             soltar. */
          <ul className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-1">
            {results.slice(0, SHOWN).map((material) => {
              const inPlanId = inPlan.get(material.id)

              return (
                <li
                  key={material.id}
                  className="flex w-[min(13rem,70vw)] shrink-0 snap-start flex-col rounded-xl border border-border p-3.5 transition-colors hover:border-violet/40"
                >
                  <Link href={`/materiales/${material.id}`} className="hover:underline">
                    <p className="text-item leading-snug font-bold">{material.title}</p>
                  </Link>
                  {material.focus ? (
                    <p className="mt-1 line-clamp-2 text-meta leading-relaxed text-muted-foreground">
                      {material.focus}
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <span className="min-w-0 text-micro font-bold text-muted-foreground uppercase">
                      {[material.area, material.age_range].filter(Boolean).join(' / ')}
                    </span>

                    {/* Same rule as a goal that is already in: the state is
                        shown, and pressing it is how you take it out. */}
                    {inPlanId ? (
                      <InPlanChip itemId={inPlanId} label="En el plan" name={material.title} />
                    ) : (
                      <form action={addMaterialToPlanAction} className="shrink-0">
                        <PlanFields {...target} />
                        <input type="hidden" name="materialId" value={material.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          <Plus className="size-3.5" />
                          Sumar
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PlanningPanel>
  )
}
