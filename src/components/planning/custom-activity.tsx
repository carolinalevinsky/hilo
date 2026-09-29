import { addActivityToPlanAction } from '@/app/(app)/planificacion/actions'
import { CircleCheck, Pencil, Plus } from '@/components/icons'
import { DurationSelect } from '@/components/planning/duration-select'
import { PlanFields, type PlanTarget } from '@/components/planning/plan-fields'
import { PlanningPanel } from '@/components/planning/planning-panel'
import { DEFAULT_PLAN_DURATION } from '@/lib/plan-durations'
import { Button } from '@/components/ui/button'

/**
 * Anything, in your own words.
 *
 * Not everything that goes into a session is a goal or a library material —
 * "el juego de la oca con sílabas", "terminar la lámina de la vez pasada" — and
 * until this existed the planner could only assemble the parts Ombúa already knew
 * about.
 *
 * It sits with the other two sources rather than inside the plan, because it is
 * one: the left column is everywhere something can come from, and the right one
 * is what came.
 */
export function CustomActivity({ target }: { target: PlanTarget }) {
  return (
    <PlanningPanel
      icon={Pencil}
      tone="teal"
      title="Sumá una actividad propia o dinámica libre"
      hint="Lo que vas a hacer y no está en la biblioteca."
      aside={
        <span className="rounded-full bg-green-soft px-2.5 py-1 text-micro font-bold text-[#1a8f57]">
          Reutilizable
        </span>
      }
    >
      <form action={addActivityToPlanAction} className="flex flex-wrap gap-2">
        <PlanFields {...target} />
        <input
          name="activity"
          required
          maxLength={200}
          placeholder="Ej: juego de la oca con sílabas"
          aria-label="Agregar una actividad tuya"
          className="h-11 min-w-[180px] flex-1 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <DurationSelect defaultValue={DEFAULT_PLAN_DURATION} />
        <Button type="submit" className="h-11 rounded-xl px-5">
          <Plus className="size-4" />
          Sumar al plan
        </Button>
      </form>

      {/* Dice lo que pasa, porque pasa: `addActivityToPlanAction` la guarda
          también como material privado tuyo. */}
      <p className="mt-2.5 flex items-start gap-2 text-meta leading-relaxed text-muted-foreground">
        <CircleCheck className="mt-0.5 size-4 shrink-0 text-green" />
        Queda guardada en tu biblioteca personal para reutilizarla con otros
        pacientes.
      </p>
    </PlanningPanel>
  )
}
