import Link from 'next/link'

import { addMaterialToPlanAction } from '@/app/(app)/planificacion/actions'
import { BookOpen } from '@/components/icons'
import { MaterialSearch } from '@/components/materials/material-search'
import { InPlanChip } from '@/components/planning/in-plan-chip'
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
const SHOWN = 10

export function LibraryPicker({
  target,
  search,
  results,
  inPlan,
}: {
  target: PlanTarget
  search: string
  results: MaterialSummary[]
  /** Material id → the row of the plan it is in, so the chip can take it out. */
  inPlan: Map<string, string>
}) {
  return (
    <PlanningPanel
      icon={BookOpen}
      tone="blue"
      title="Buscar en la biblioteca"
      hint="Los materiales de tu profesión y los que publicó la comunidad."
      aside={
        <Link
          href="/materiales"
          className="text-meta font-semibold text-violet hover:underline"
        >
          Ir a la biblioteca →
        </Link>
      }
    >
      <MaterialSearch initial={search} />

      <div className="mt-3">
        {!search ? (
          <p className="text-meta text-muted-foreground">
            Escribí para buscar por área, objetivo o título.
          </p>
        ) : results.length === 0 ? (
          <p className="text-meta text-muted-foreground">
            Sin resultados. Probá otra palabra, o generá uno con IA desde Materiales.
          </p>
        ) : (
          <ul className="space-y-2">
            {results.slice(0, SHOWN).map((material) => {
              const inPlanId = inPlan.get(material.id)

              return (
                <li
                  key={material.id}
                  className="flex items-center gap-2.5 rounded-xl border border-border p-2.5"
                >
                  <span className="shrink-0 rounded-full bg-violet-soft px-2 py-0.5 text-micro font-bold text-violet">
                    {material.area}
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link href={`/materiales/${material.id}`} className="hover:underline">
                      <p className="truncate text-item font-bold">{material.title}</p>
                    </Link>
                    <p className="truncate text-micro text-muted-foreground">
                      {[material.focus, material.age_range].filter(Boolean).join(' · ')}
                    </p>
                  </div>

                  {/* Same rule as a goal that is already in: the state is shown,
                      and pressing it is how you take it out. */}
                  {inPlanId ? (
                    <InPlanChip itemId={inPlanId} label="En el plan" name={material.title} />
                  ) : (
                    <form action={addMaterialToPlanAction} className="shrink-0">
                      <PlanFields {...target} />
                      <input type="hidden" name="materialId" value={material.id} />
                      <Button type="submit" size="sm">
                        Agregar
                      </Button>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PlanningPanel>
  )
}
