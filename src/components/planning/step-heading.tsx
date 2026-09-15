import { cn } from '@/lib/utils'

/**
 * The numbering that turns the planner into a sequence.
 *
 * The screen holds three cards that each looked equally important and none of
 * which said what to do first — "costó mucho entender qué hace" in the QA. The
 * work is actually ordered: pick the session, fill it, then look at what came
 * out and save it. Numbering the three is the whole fix; nothing underneath
 * changed.
 *
 * The badge is its own export because step 1 is a chip inside the session card
 * while steps 2 and 3 head a column, and a product where the same number is
 * drawn two different ways is a product where the sequence is not obvious.
 */
export function StepBadge({ step, tone = 'muted' }: { step: number; tone?: 'muted' | 'violet' }) {
  return (
    <span
      aria-hidden
      className={cn(
        // Below `lg` the two columns stack and the plan comes first, so the
        // numbers would count 1, 3, 2 down the screen. The sequence is a way of
        // reading two columns; with one column there is nothing to order, and a
        // number that contradicts what is under it is worse than no number. The
        // spoken "Paso N" in `StepHeading` stays either way — the document order
        // is the same at every width.
        'max-lg:hidden flex size-6 shrink-0 items-center justify-center rounded-full text-micro font-extrabold',
        tone === 'violet' ? 'bg-violet text-white' : 'bg-muted text-muted-foreground',
      )}
    >
      {step}
    </span>
  )
}

/**
 * The head of a column: the step number, what you do there, and one line saying
 * why. `tone` marks the column that holds the result.
 */
export function StepHeading({
  step,
  title,
  hint,
  tone = 'muted',
}: {
  step: number
  title: string
  hint: string
  tone?: 'muted' | 'violet'
}) {
  return (
    <div className="mb-3 border-b border-border pb-2.5">
      <h2 className="flex items-center gap-2 text-item font-extrabold">
        <StepBadge step={step} tone={tone} />
        <span className="sr-only">Paso {step}: </span>
        {title}
      </h2>
      <p className="mt-0.5 text-meta text-muted-foreground">{hint}</p>
    </div>
  )
}
