import { addActivityToPlanAction } from '@/app/(app)/planificacion/actions'
import { Pencil, Plus } from '@/components/icons'
import { PlanFields, type PlanTarget } from '@/components/planning/plan-fields'
import { PlanningPanel } from '@/components/planning/planning-panel'
import { Button } from '@/components/ui/button'

/**
 * Anything, in your own words.
 *
 * Not everything that goes into a session is a goal or a library material —
 * "el juego de la oca con sílabas", "terminar la lámina de la vez pasada" — and
 * until this existed the planner could only assemble the parts Hilo already knew
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
      title="Sumá una actividad tuya"
      hint="Lo que vas a hacer y no está en la biblioteca."
    >
      <form action={addActivityToPlanAction} className="flex flex-wrap gap-2">
        <PlanFields {...target} />
        <input
          name="activity"
          required
          maxLength={200}
          placeholder="Ej: juego de la oca con sílabas"
          aria-label="Agregar una actividad tuya"
          className="h-9 min-w-[180px] flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit">
          <Plus className="size-4" />
          Sumar
        </Button>
      </form>
    </PlanningPanel>
  )
}
