import Link from 'next/link'

import {
  addGoalToPlanAction,
  addSuggestedGoalAction,
} from '@/app/(app)/planificacion/actions'
import { Plus, Sparkles, Target, TriangleAlert } from '@/components/icons'
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
  quickGoals,
  itemOfGoal,
  itemOfMaterial,
}: {
  target: PlanTarget
  firstName: string
  suggestions: PlanSuggestion[]
  /** Títulos de arranque, sacados de la taxonomía de la profesión. */
  quickGoals: string[]
  /** Goal id → the row of the plan it produced, which is what "Agregado" undoes. */
  itemOfGoal: Map<string, string>
  /** The materials already in the plan, so a second "Agregar" cannot duplicate one. */
  itemOfMaterial: Map<string, string>
}) {
  const active = suggestions.length

  return (
    <PlanningPanel
      icon={Sparkles}
      title={`Objetivos terapéuticos de ${firstName}`}
      hint="Ombúa los ordena: primero los que menos se movieron."
      aside={
        (
          <span className="text-meta text-muted-foreground">
            {active === 1 ? '1 activo' : `${active} activos`}
          </span>
        )
      }
    >
      {active === 0 ? (
        /* El vacío explicado adentro de su propia caja, y abajo la única cosa
           que hay que hacer. Antes era una línea gris con un enlace en el
           medio: se leía como una nota al pie y no como el paso que falta. */
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-muted/60 p-3.5">
            <p className="text-item font-semibold">
              {firstName} todavía no tiene objetivos activos
            </p>
            <p className="mt-1 text-body leading-relaxed text-muted-foreground">
              Ombúa necesita al menos un objetivo para recomendarte materiales de la
              biblioteca.
            </p>
          </div>

          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href={`/pacientes/${target.patientId}`}>
              <Plus className="size-4" />
              Crear primer objetivo terapéutico
            </Link>
          </Button>

          {/* Los tres de arranque. Tocar uno crea el objetivo y la lista de
              arriba lo muestra al instante; después se edita desde la ficha
              como cualquier otro.

              El diseño los anunciaba "según edad clínica". No es así y no
              conviene decirlo: salen de las áreas de la profesión, que es la
              misma taxonomía con la que está ordenada la biblioteca. La edad no
              entra en la cuenta. */}
          {quickGoals.length > 0 ? (
            <div className="space-y-2">
              <p className="text-micro font-bold tracking-wider text-muted-foreground uppercase">
                O sumá uno de los de tu profesión:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickGoals.map((title) => (
                  <form key={title} action={addSuggestedGoalAction}>
                    <input type="hidden" name="patientId" value={target.patientId} />
                    <input type="hidden" name="title" value={title} />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-violet"
                    >
                      <Plus className="size-3 text-violet" />
                      {title}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ) : null}
        </div>
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
