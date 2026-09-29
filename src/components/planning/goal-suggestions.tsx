import Link from 'next/link'

import {
  addGoalToPlanAction,
  addSuggestedGoalAction,
} from '@/app/(app)/planificacion/actions'
import { Plus, Sparkles, Target } from '@/components/icons'
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
}: {
  target: PlanTarget
  firstName: string
  suggestions: PlanSuggestion[]
  /** Títulos de arranque, sacados de la taxonomía de la profesión. */
  quickGoals: string[]
  /** Goal id → the row of the plan it produced, which is what "Agregado" undoes. */
  itemOfGoal: Map<string, string>
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
              El plan de la sesión se arma sobre los objetivos: sin uno activo no hay
              nada que planificar todavía.
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
        <ul className="space-y-2">
          {suggestions.map((goal) => {
            // The row this goal produced, when it is in the plan: what the
            // "Agregado" chip takes out again.
            const inPlanId = itemOfGoal.get(goal.goalId)

            return (
              <li
                key={goal.goalId}
                className={cn(
                  'flex items-center justify-between gap-2.5 rounded-xl border p-3 transition-colors',
                  goal.added
                    ? 'border-violet/40 bg-violet-soft/50'
                    : 'border-border hover:bg-muted/40',
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-soft text-violet">
                    <Target className="size-[18px]" />
                  </span>
                  <h4 className="min-w-0 truncate text-item font-bold">{goal.title}</h4>
                </div>

                {/* One button, adding one thing: the goal. Added is a state you
                    can leave — the chip that says so is also what takes it out
                    again, so an "Agregar" pressed by mistake is undone where it
                    happened. */}
                {goal.added && inPlanId ? (
                  <InPlanChip itemId={inPlanId} label="Agregado" name={goal.title} />
                ) : (
                  <form action={addGoalToPlanAction} className="shrink-0">
                    <PlanFields {...target} />
                    <input type="hidden" name="goalId" value={goal.goalId} />
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
    </PlanningPanel>
  )
}
