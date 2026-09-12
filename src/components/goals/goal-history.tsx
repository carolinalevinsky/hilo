'use client'

import { X } from '@/components/icons'

import { deleteGoalPointAction } from '@/app/(app)/pacientes/goal-actions'
import { formatDayMonth } from '@/lib/dates'
import type { Goal, GoalPoint } from '@/server/goals'

/**
 * When each goal moved, under the chart (P17).
 *
 * Thomas's QA: the Evolución card showed where each goal is now and a curve, but
 * not *when* it improved — and a point entered by mistake could not be taken
 * back. So each goal gets one line that answers "when" at a glance ("20 % el
 * 12/8 → 40 % el 11/9"), and opening it lists every measurement with its date,
 * each one removable.
 *
 * Removing asks first, and says what will happen: the latest measurement takes
 * the goal back to the one before it (see `deleteGoalPoint`). A client component
 * only for that question — `window.confirm` needs the browser.
 *
 * "Medición", not "registro": since P13 a registro is the note written after a
 * session.
 */
export function GoalHistory({
  patientId,
  goals,
  points,
}: {
  patientId: string
  goals: Goal[]
  points: GoalPoint[]
}) {
  const byGoal = new Map<string, GoalPoint[]>()
  for (const point of points) {
    const list = byGoal.get(point.goal_id)
    if (list) list.push(point)
    else byGoal.set(point.goal_id, [point])
  }

  const withHistory = goals.filter((goal) => (byGoal.get(goal.id) ?? []).length > 0)
  if (withHistory.length === 0) return null

  return (
    <ul className="mt-4 space-y-2 border-t border-border pt-3">
      {withHistory.map((goal) => {
        // `listGoalProgress` returns oldest first.
        const series = byGoal.get(goal.id)!
        const first = series[0]!
        const last = series[series.length - 1]!

        return (
          <li key={goal.id}>
            <details>
              <summary className="cursor-pointer text-meta">
                <b className="font-semibold">{goal.title}</b>
                {' · '}
                {series.length === 1
                  ? `${last.value}% desde el ${formatDayMonth(last.recorded_on)}`
                  : `${first.value}% el ${formatDayMonth(first.recorded_on)} → ${last.value}% el ${formatDayMonth(last.recorded_on)}`}
                <span className="text-muted-foreground">
                  {' · '}
                  {series.length === 1 ? '1 medición' : `${series.length} mediciones`}
                </span>
              </summary>

              <ol className="mt-2 flex flex-wrap gap-1.5 pl-3">
                {series.map((point, index) => {
                  const isLast = index === series.length - 1
                  const before = index > 0 ? series[index - 1]!.value : 0
                  const when = formatDayMonth(point.recorded_on)

                  return (
                    <li key={point.id}>
                      <form
                        action={deleteGoalPointAction}
                        onSubmit={(event) => {
                          const consequence = isLast
                            ? `El objetivo vuelve a ${before}%.`
                            : 'El avance de hoy no cambia.'
                          if (
                            !window.confirm(
                              `¿Borrar la medición del ${when} (${point.value}%)? ${consequence}`,
                            )
                          ) {
                            event.preventDefault()
                          }
                        }}
                        className="flex items-center gap-1 rounded-full bg-muted py-1 pr-1.5 pl-2.5 text-micro tabular-nums"
                      >
                        <input type="hidden" name="patientId" value={patientId} />
                        <input type="hidden" name="pointId" value={point.id} />
                        <span>
                          {when} · <b>{point.value}%</b>
                        </span>
                        <button
                          type="submit"
                          aria-label={`Borrar la medición del ${when} (${point.value}%)`}
                          className="rounded-full p-0.5 text-muted-foreground hover:bg-card hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </form>
                    </li>
                  )
                })}
              </ol>
            </details>
          </li>
        )
      })}
    </ul>
  )
}
