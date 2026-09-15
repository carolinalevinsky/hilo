import { removePlanItemAction } from '@/app/(app)/planificacion/actions'
import { Check, X } from '@/components/icons'

/**
 * "Agregado" — and the way out of it.
 *
 * It used to be a chip that only reported a state, so the only way to undo an
 * "Agregar" pressed by mistake was to find the row in the plan and use its bin.
 * The button that put it there is the button you go back to, so that is where
 * taking it out belongs.
 *
 * It says what it is until you point at it, and then it says what it does — in
 * the colour of an undo, not of a destruction. Both words sit in the same grid
 * cell so the chip does not change width under the cursor, which would make it
 * move away as you go to press it.
 */
export function InPlanChip({
  itemId,
  label,
  name,
}: {
  /** The row of the plan this state comes from — what pressing it removes. */
  itemId: string
  /** What the chip says at rest: "Agregado", "En el plan". */
  label: string
  /** What it would remove, for the button's accessible name. */
  name: string
}) {
  return (
    <form action={removePlanItemAction} className="shrink-0">
      <input type="hidden" name="itemId" value={itemId} />
      <button
        type="submit"
        aria-label={`Quitar del plan: ${name}`}
        title="Quitar del plan"
        className="group/chip flex items-center gap-1 rounded-lg bg-green-soft px-2.5 py-1.5 text-micro font-bold text-[#1a8f57] transition-colors outline-none hover:bg-coral-soft hover:text-[#c0392b] focus-visible:bg-coral-soft focus-visible:text-[#c0392b] focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Check className="size-3.5 group-hover/chip:hidden group-focus-visible/chip:hidden" />
        <X className="hidden size-3.5 group-hover/chip:block group-focus-visible/chip:block" />
        <span className="grid">
          <span className="col-start-1 row-start-1 group-hover/chip:invisible group-focus-visible/chip:invisible">
            {label}
          </span>
          <span className="invisible col-start-1 row-start-1 group-hover/chip:visible group-focus-visible/chip:visible">
            Quitar
          </span>
        </span>
      </button>
    </form>
  )
}
