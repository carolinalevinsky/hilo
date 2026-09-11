import { TriangleAlert } from '@/components/icons'

import {
  createScaleLinkAction,
  markScaleReviewedAction,
} from '@/app/(app)/pacientes/scale-actions'
import { SendLinkButton } from '@/components/patient-forms/send-link-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CRISIS_LINE, SCALE_IDS, SCALES, severityBand, type ScaleId } from '@/lib/scales'
import type { ScaleResponse } from '@/server/scales'

/**
 * PHQ-9 and GAD-7 on the ficha: the item-9 flag first, then each scale's total
 * over time, then the buttons that send them.
 *
 * Next to the goals and not inside the Evolución chart. That chart plots
 * progress from 0 to 100 %, where up is good; these are scores from 0 to 27
 * and 0 to 21, where up is worse. On one axis they would read as the same kind
 * of line, and a practitioner glancing at it would be misled by exactly the
 * thing that makes a chart quick to read.
 *
 * Only a total and a band, never a diagnosis — see `@/lib/scales`.
 */

type Row = Pick<
  ScaleResponse,
  'id' | 'total' | 'difficulty' | 'self_harm_flag' | 'submitted_at' | 'reviewed_at'
> & { scale: ScaleId }

function day(instant: string) {
  return new Intl.DateTimeFormat('es-UY', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Montevideo',
  }).format(new Date(instant))
}

export function ScalesCard({
  patientId,
  phone,
  patientFirstName,
  practitionerFirstName,
  history,
  ready,
  className,
}: {
  patientId: string
  phone: string | null
  patientFirstName: string
  practitionerFirstName: string
  history: { responses: Row[]; openLinks: { scale: ScaleId; since: string }[] }
  ready: Record<ScaleId, boolean>
  className?: string
}) {
  const flagged = history.responses.filter((row) => row.self_harm_flag && !row.reviewed_at)
  const available = SCALE_IDS.filter((id) => ready[id])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Escalas</CardTitle>
        <p className="text-meta text-muted-foreground">
          Las contesta {patientFirstName} desde el celular y Hilo las puntúa.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {flagged.map((row) => (
          <div
            key={row.id}
            role="alert"
            className="space-y-2 rounded-xl border border-[#e7b3ab] bg-coral-soft px-3.5 py-3 text-[#9b2c20]"
          >
            <p className="flex items-start gap-2 text-body">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                <b>En el PHQ-9 del {day(row.submitted_at)}, {patientFirstName} no respondió «nunca» a
                la pregunta sobre hacerse daño.</b> Conviene hablarlo antes de la próxima sesión.
              </span>
            </p>
            <p className="text-meta">
              {CRISIS_LINE.name}: {CRISIS_LINE.landline} · {CRISIS_LINE.mobile}, gratis, 24 horas.
            </p>
            <form action={markScaleReviewedAction}>
              <input type="hidden" name="patientId" value={patientId} />
              <input type="hidden" name="responseId" value={row.id} />
              <Button type="submit" size="sm" variant="outline" className="border-[#e7b3ab] bg-card">
                Lo vi
              </Button>
            </form>
          </div>
        ))}

        {SCALE_IDS.map((id) => {
          const rows = history.responses.filter((row) => row.scale === id)
          const open = history.openLinks.find((link) => link.scale === id)
          if (rows.length === 0 && !open && !ready[id]) return null
          const last = rows.at(-1)

          return (
            <div key={id} className="space-y-2 border-t border-border pt-3.5 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-body">
                  <b>{SCALES[id].name}</b>{' '}
                  <span className="text-meta text-muted-foreground">{SCALES[id].about}</span>
                </p>
                {last ? (
                  <p className="text-meta tabular-nums">
                    <b className="text-body">{last.total}</b>/{SCALES[id].maxScore} ·{' '}
                    {severityBand(id, last.total)} · {day(last.submitted_at)}
                  </p>
                ) : null}
              </div>

              {rows.length > 1 ? <Trend rows={rows} max={SCALES[id].maxScore} /> : null}

              {open ? (
                <p className="text-meta text-muted-foreground">
                  Mandaste un link el {day(open.since)} y todavía no lo contestó.
                </p>
              ) : null}

              {ready[id] ? (
                <SendLinkButton
                  create={createScaleLinkAction.bind(null, patientId, id)}
                  phone={phone}
                  message={`¡Hola, ${patientFirstName}! Te dejo un cuestionario breve para antes de la próxima sesión. Son unos minutos: {url} Gracias, ${practitionerFirstName}.`}
                  label={`Mandar el ${SCALES[id].name}`}
                  againLabel={`Mandar el ${SCALES[id].name} otra vez`}
                  again={rows.length > 0 || Boolean(open)}
                  lifetime="7 días"
                />
              ) : null}
            </div>
          )
        })}

        {available.length === 0 && history.responses.length === 0 ? (
          <p className="text-meta text-muted-foreground">Las escalas todavía no están disponibles.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * The totals over time, on the scale's own range. A line and a dot per answer;
 * the last one labelled. Higher is worse, and the axis says so by leaving the
 * top of the box as the worst score, not the best one seen.
 */
function Trend({ rows, max }: { rows: Row[]; max: number }) {
  const width = 280
  const height = 56
  const pad = 6
  const x = (index: number) => pad + (index * (width - pad * 2)) / Math.max(rows.length - 1, 1)
  const y = (total: number) => pad + (1 - total / max) * (height - pad * 2)
  const points = rows.map((row, index) => `${x(index)},${y(row.total)}`).join(' ')
  const last = rows.at(-1)!

  return (
    <svg
      viewBox={`0 0 ${width + 26} ${height}`}
      className="h-14 w-full max-w-[320px]"
      role="img"
      aria-label={`Puntajes: ${rows.map((row) => row.total).join(', ')}, sobre ${max}`}
    >
      <line x1={pad} x2={width - pad} y1={y(0)} y2={y(0)} className="stroke-border" strokeWidth={1} />
      <line x1={pad} x2={width - pad} y1={y(max)} y2={y(max)} className="stroke-border" strokeWidth={1} strokeDasharray="3 3" />
      <polyline points={points} fill="none" className="stroke-violet" strokeWidth={2} strokeLinejoin="round" />
      {rows.map((row, index) => (
        <circle key={row.id} cx={x(index)} cy={y(row.total)} r={3} className="fill-violet" />
      ))}
      <text x={x(rows.length - 1) + 7} y={y(last.total) + 4} className="fill-foreground text-[11px] font-bold">
        {last.total}
      </text>
    </svg>
  )
}
