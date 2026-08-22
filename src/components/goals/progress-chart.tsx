import { formatDayMonth } from '@/lib/dates'
import { PATIENT_COLOR_HEX } from '@/lib/patient-colors'
import type { Goal, GoalPoint } from '@/server/goals'

/**
 * Progress over time, one line per goal.
 *
 * Inline SVG, no charting library. It is forty lines of arithmetic, it renders
 * on the server with no JavaScript shipped to the browser, and it prints — which
 * matters, because practitioners print these.
 *
 * The real change from v1 is the x-axis. v1 stored `h:[20,30,40,52,65]` — five
 * numbers with no dates — so the axis was "the order things happened in" and two
 * goals recorded weeks apart appeared side by side. Here the axis is time, so
 * the distance between two points means something: a flat stretch is a month
 * without movement, and that is exactly what a practitioner is looking for.
 */

const CHART_COLORS = ['violet', 'teal', 'coral', 'blue', 'amber', 'green'] as const

const WIDTH = 560
const HEIGHT = 170
const PAD_X = 10
const PAD_TOP = 10
const PAD_BOTTOM = 22

export function ProgressChart({
  goals,
  points,
}: {
  goals: Goal[]
  points: GoalPoint[]
}) {
  if (goals.length === 0) {
    return (
      <p className="py-3 text-[13px] text-muted-foreground">
        Cargá objetivos para ver la evolución en el tiempo.
      </p>
    )
  }

  const byGoal = new Map<string, GoalPoint[]>()
  for (const point of points) {
    const list = byGoal.get(point.goal_id)
    if (list) list.push(point)
    else byGoal.set(point.goal_id, [point])
  }

  const days = points.map((point) => new Date(`${point.recorded_on}T00:00:00`).getTime())
  const first = Math.min(...days)
  const last = Math.max(...days)
  const span = last - first

  if (!Number.isFinite(first)) {
    return (
      <p className="py-3 text-[13px] text-muted-foreground">
        Todavía no hay movimiento para graficar. Ajustá el avance de un objetivo y aparece acá.
      </p>
    )
  }

  // With a single day of data there is no span to scale against, so everything
  // sits at the left edge. Nudging it to the middle reads as "one measurement"
  // rather than as a rendering fault.
  const x = (recordedOn: string) => {
    if (span === 0) return WIDTH / 2
    const time = new Date(`${recordedOn}T00:00:00`).getTime()
    return PAD_X + ((time - first) / span) * (WIDTH - 2 * PAD_X)
  }

  const y = (value: number) =>
    HEIGHT - PAD_BOTTOM - (value / 100) * (HEIGHT - PAD_TOP - PAD_BOTTOM)

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Evolución del avance de cada objetivo en el tiempo"
      >
        {[0, 25, 50, 75, 100].map((line) => (
          <g key={line}>
            <line
              x1={PAD_X}
              y1={y(line)}
              x2={WIDTH - PAD_X}
              y2={y(line)}
              stroke="#eef0f6"
              strokeWidth="1"
            />
            <text x={PAD_X} y={y(line) - 3} fontSize="8" fill="#a6adbf">
              {line}
            </text>
          </g>
        ))}

        {goals.map((goal, index) => {
          const series = byGoal.get(goal.id) ?? []
          if (series.length === 0) return null
          const color = PATIENT_COLOR_HEX[CHART_COLORS[index % CHART_COLORS.length]!]

          return (
            <g key={goal.id}>
              {series.length > 1 ? (
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={series
                    .map((point) => `${x(point.recorded_on)},${y(point.value)}`)
                    .join(' ')}
                />
              ) : null}
              {series.map((point) => (
                <circle
                  key={point.id}
                  cx={x(point.recorded_on)}
                  cy={y(point.value)}
                  r="3.2"
                  fill={color}
                />
              ))}
            </g>
          )
        })}

        <text x={PAD_X} y={HEIGHT - 6} fontSize="9" fill="#7a839a">
          {formatDayMonth(new Date(first).toISOString().slice(0, 10))}
        </text>
        {span > 0 ? (
          <text x={WIDTH - PAD_X} y={HEIGHT - 6} fontSize="9" fill="#7a839a" textAnchor="end">
            {formatDayMonth(new Date(last).toISOString().slice(0, 10))}
          </text>
        ) : null}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {goals.map((goal, index) => (
          <li key={goal.id} className="flex items-center gap-1.5 text-[12px]">
            <span
              className="size-2.5 rounded-full"
              style={{
                background: PATIENT_COLOR_HEX[CHART_COLORS[index % CHART_COLORS.length]!],
              }}
            />
            {goal.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
