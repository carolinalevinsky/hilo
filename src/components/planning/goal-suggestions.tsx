import Link from 'next/link'

import { addGoalToPlanAction } from '@/app/(app)/planificacion/actions'
import { Sparkles, Target, TriangleAlert } from '@/components/icons'
import { InPlanChip } from '@/components/planning/in-plan-chip'
import { PlanFields, type PlanTarget } from '@/components/planning/plan-fields'
import { PlanningPanel } from '@/components/planning/planning-panel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PlanSuggestion } from '@/server/session-plans'

/**
 * The goals to work on next, worst first, each with one click that puts it in
 * the plan.
 *
 * v1 sorted every active goal by progress ascending and showed all of them, and
 * that is the part of planning that takes the time: not writing the list, but
 * deciding what goes in it. Ombúa proposes an order; the practitioner builds the
 * list.
 */
export function GoalSuggestions({
  target,
  firstName,
  suggestions,
  itemOfGoal,
  itemOfMaterial,
}: {
  target: PlanTarget
  firstName: string
  suggestions: PlanSuggestion[]
  /** Goal id → the row of the plan it produced, which is what "Agregado" undoes. */
  itemOfGoal: Map<string, string>
  /** The materials already in the plan, so a second "Agregar" cannot duplicate one. */
  itemOfMaterial: Map<string, string>
}) {
  const active = suggestions.length

  return (
    <PlanningPanel
      icon={Sparkles}
      title={`Objetivos de ${firstName}`}
      hint="Ombúa los ordena: primero los que menos se movieron."
      aside={
        active > 0 ? (
          <span className="text-meta text-muted-foreground">
            {active === 1 ? '1 objetivo activo' : `${active} objetivos activos`}
          </span>
        ) : null
      }
    >
      {active === 0 ? (
        <p className="text-body text-muted-foreground">
          {firstName} todavía no tiene objetivos activos.{' '}
          <Link
            href={`/pacientes/${target.patientId}`}
            className="font-semibold text-violet underline"
          >
            Cargá el primero
          </Link>{' '}
          y Ombúa arma las sugerencias.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {suggestions.map((goal) => {
            const [best, ...others] = goal.materials
            // The row this goal produced, when it is in the plan: what the
            // "Agregado" chip takes out again.
            const inPlanId = itemOfGoal.get(goal.goalId)

            return (
              <li
                key={goal.goalId}
                className={cn(
                  'rounded-xl border p-3 transition-colors',
                  goal.added
                    ? 'border-violet/40 bg-violet-soft/50'
                    : 'border-border hover:bg-muted/40',
                )}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-soft text-violet">
                      <Target className="size-[18px]" />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h4 className="text-item font-bold">{goal.title}</h4>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-micro font-bold text-muted-foreground">
                          {goal.progress}% de avance
                        </span>
                      </div>

                      <p className="mt-1 text-meta text-muted-foreground">
                        {goal.activity}
                        {best ? (
                          <>
                            {' · con '}
                            <Link
                              href={`/materiales/${best.id}`}
                              className="font-semibold text-foreground hover:underline"
                            >
                              {best.title}
                            </Link>
                          </>
                        ) : null}
                      </p>

                      {goal.materials.length === 0 ? (
                        <p className="mt-1.5 flex items-start gap-1.5 text-micro text-[#8a5a12]">
                          <TriangleAlert className="mt-px size-3.5 shrink-0" />
                          Sin material de la biblioteca para este objetivo. Buscá abajo o
                          sumá una actividad tuya.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* One button per goal, and it adds exactly what the line under
                      it says. There used to be an "Agregar" here and a "Con este"
                      on each of three materials — sixteen buttons for four goals,
                      two of them doing nearly the same thing.

                      Added is a state you can leave: the chip that says so is
                      also what takes it out again, so an "Agregar" pressed by
                      mistake is undone where it happened. */}
                  {goal.added && inPlanId ? (
                    <InPlanChip itemId={inPlanId} label="Agregado" name={goal.title} />
                  ) : (
                    <form action={addGoalToPlanAction} className="shrink-0">
                      <PlanFields {...target} />
                      <input type="hidden" name="goalId" value={goal.goalId} />
                      {best ? <input type="hidden" name="materialId" value={best.id} /> : null}
                      <Button type="submit" size="sm">
                        Agregar
                      </Button>
                    </form>
                  )}
                </div>

                {/* The other two stay a click away: a choice, not a wall. Each
                    opens — the title is a link — so you can read what it is
                    before deciding. */}
                {others.length > 0 && !goal.added ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-micro font-semibold text-violet">
                      Otros materiales para este objetivo ({others.length})
                    </summary>
                    <ul className="mt-1.5 space-y-1">
                      {others.map((material) => (
                        <li
                          key={material.id}
                          className="flex items-center gap-2 rounded-lg bg-muted/60 px-2 py-1.5"
                        >
                          <Link
                            href={`/materiales/${material.id}`}
                            className="min-w-0 flex-1 hover:underline"
                          >
                            <span className="block truncate text-meta font-bold">
                              {material.title}
                            </span>
                            <span className="block truncate text-micro text-muted-foreground">
                              {[material.area, material.focus].filter(Boolean).join(' · ')}
                            </span>
                          </Link>

                          <form action={addGoalToPlanAction} className="shrink-0">
                            <PlanFields {...target} />
                            <input type="hidden" name="goalId" value={goal.goalId} />
                            <input type="hidden" name="materialId" value={material.id} />
                            <Button
                              type="submit"
                              size="sm"
                              variant="outline"
                              disabled={itemOfMaterial.has(material.id)}
                            >
                              Agregar con este
                            </Button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </PlanningPanel>
  )
}
