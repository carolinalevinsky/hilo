import {
  BookOpen,
  ChartColumn,
  ChartPie,
  ClipboardList,
  Compass,
  FileText,
  Plus,
  Send,
  User,
  Users,
} from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { RequestFormat } from '@/components/reports/request-format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/dates'
import {
  RECIPIENT_FORMATS,
  RECIPIENT_LABELS,
  recipientsFor,
  type RecipientId,
} from '@/lib/recipients'
import { listAssessments } from '@/server/assessments'
import { countPatients } from '@/server/patients'
import { planLimits, quota } from '@/server/plans'
import { listReports } from '@/server/reports'
import { currentSession } from '../session'

export const metadata: Metadata = { title: 'Informes y evaluaciones · Hilo' }

export default async function DocumentsPage() {
  const { user, practitioner } = await currentSession()

  const [reports, assessments, patients, reportQuota] = await Promise.all([
    listReports(user.id),
    listAssessments(user.id),
    countPatients(user.id),
    quota(user.id, practitioner.plan, 'reports'),
  ])

  const hasPatients = patients > 0
  const recipients = recipientsFor(practitioner.discipline)

  return (
    <>
      <PageHeader
        title="Informes y evaluaciones"
        subtitle="Vinculados a cada paciente y disponibles en su ficha."
        action={
          hasPatients ? (
            <div className="flex gap-2 max-lg:w-full">
              <Button asChild size="lg" className="max-lg:flex-1">
                <Link href="/informes/nuevo">
                  <Plus className="size-[18px]" />
                  Nuevo informe
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="max-lg:flex-1">
                <Link href="/evaluaciones/nueva">
                  <ChartPie className="size-[18px]" />
                  Evaluación
                </Link>
              </Button>
            </div>
          ) : null
        }
      />

      {!hasPatients ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="Los informes salen de tus pacientes"
            text="Cargá un paciente, registrá algunas sesiones y Hilo arma el informe con lo que ya tenés escrito."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <p className="mb-3.5 rounded-lg bg-violet-soft px-4 py-3 text-[13px] leading-relaxed text-violet">
            Empezá por un formato: elegís el paciente y Hilo arma el borrador. Cada
            informe y evaluación queda vinculado al paciente y disponible en su ficha.
          </p>

          {/* "Formatos disponibles" is how v1 opened this screen
              (`legacy/index.html:1656`), and it is the right way round: nobody
              sets out to write "a report", they set out to write the one for the
              colegio. The list comes from the practitioner's own discipline
              rather than v1's fixed six, so a kinesióloga is not offered ANEP
              adecuaciones. */}
          <Card className="mb-5">
            <CardHeader>
              <CardTitle>Formatos disponibles</CardTitle>
              <p className="text-[12.5px] text-muted-foreground">
                Tocá Crear y elegí el paciente.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {recipients.map((recipient) => (
                  <FormatCard
                    key={recipient}
                    title={RECIPIENT_FORMATS[recipient].title}
                    blurb={RECIPIENT_FORMATS[recipient].blurb}
                    chip={RECIPIENT_LABELS[recipient]}
                    href={`/informes/nuevo?para=${recipient}`}
                    style={FORMAT_STYLE[recipient]}
                  />
                ))}

                <FormatCard
                  title="Evaluación con instrumento"
                  blurb="Cargás los puntajes y Hilo los interpreta y arma los objetivos"
                  chip="Evaluación"
                  href="/evaluaciones/nueva"
                  style={FORMAT_STYLE.assessment}
                />

                {/* Última de la grilla: primero lo que se puede hacer hoy, y
                    después la salida para lo que falta. */}
                <RequestFormat />
              </div>
            </CardContent>
          </Card>

          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Plan {planLimits(practitioner.plan).label} · {reportQuota.used} de{' '}
            {reportQuota.limit} informes usados este mes.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Últimos informes generados</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">
                    Todavía no generaste ninguno.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {reports.map((report) => (
                      <li key={report.id}>
                        <Link
                          href={`/informes/${report.id}`}
                          className="flex items-center gap-2.5 py-2.5 hover:opacity-80"
                        >
                          <PatientAvatar
                            fullName={report.patients?.full_name ?? '?'}
                            color={report.patients?.color ?? null}
                            size={32}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-bold">
                              {report.patients?.full_name}
                            </p>
                            <p className="truncate text-[12px] text-muted-foreground">
                              {RECIPIENT_LABELS[report.recipient as RecipientId]} ·{' '}
                              {formatDate(report.issued_on)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                {/* "Cargadas" y no "generadas": una evaluación la hacés vos con
                    el instrumento y Hilo interpreta los puntajes. Decir que la
                    generó él sería contar mal de quién es el trabajo. */}
                <CardTitle>Últimas evaluaciones cargadas</CardTitle>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">
                    Todavía no cargaste ninguna.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {assessments.map((assessment) => (
                      <li key={assessment.id}>
                        <Link
                          href={`/evaluaciones/${assessment.id}`}
                          className="flex items-center gap-2.5 py-2.5 hover:opacity-80"
                        >
                          <PatientAvatar
                            fullName={assessment.patients?.full_name ?? '?'}
                            color={assessment.patients?.color ?? null}
                            size={32}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-bold">
                              {assessment.patients?.full_name}
                            </p>
                            <p className="truncate text-[12px] text-muted-foreground">
                              {assessment.instrument} · {formatDate(assessment.assessed_on)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  )
}

/**
 * One format on the Informes screen — v1's `.tcard` (`legacy/index.html:120`).
 *
 * The whole card is the link, not just the button: the button is what says
 * "Crear →", but somebody reading "Informe para la familia" and reaching for it
 * will hit the title first.
 */
/**
 * El color y el ícono de cada formato.
 *
 * No es decoración: son seis tarjetas parecidas en una grilla, y lo que se busca
 * acá no se lee, se reconoce. Con todas iguales hay que leer los seis títulos
 * cada vez; con un color y una forma por formato, la de la familia es "la
 * violeta con la gente" desde la segunda visita.
 *
 * Vive en esta pantalla y no en `src/lib/recipients.ts` a propósito: aquello es
 * el dominio —quién lee cada informe y en qué tono se le escribe— y no tiene por
 * qué saber que existen íconos. `src/lib` no importa de `src/components`.
 */
const FORMAT_STYLE: Record<
  RecipientId | 'assessment',
  { icon: typeof BookOpen; className: string }
> = {
  school: { icon: BookOpen, className: 'bg-blue-soft text-blue' },
  family: { icon: Users, className: 'bg-violet-soft text-violet' },
  health_insurer: { icon: ClipboardList, className: 'bg-green-soft text-green' },
  anep: { icon: Compass, className: 'bg-amber-soft text-amber' },
  physician: { icon: Send, className: 'bg-coral-soft text-coral' },
  patient: { icon: User, className: 'bg-violet-soft text-violet' },
  assessment: { icon: ChartColumn, className: 'bg-blue-soft text-blue' },
}

function FormatCard({
  title,
  blurb,
  chip,
  href,
  style,
}: {
  title: string
  blurb: string
  chip: string
  href: string
  style: { icon: typeof BookOpen; className: string }
}) {
  const Icon = style.icon

  return (
    <Link
      href={href}
      className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:border-violet"
    >
      <span
        aria-hidden
        className={`mb-2.5 inline-flex size-9 items-center justify-center rounded-xl ${style.className}`}
      >
        <Icon className="size-[18px]" />
      </span>

      <span className="text-[14.5px] font-bold">{title}</span>
      <span className="mt-1 mb-2.5 text-[12.5px] text-muted-foreground">{blurb}</span>

      <span className="mt-auto flex items-center justify-between gap-2">
        <span className="rounded-full bg-violet-soft px-2.5 py-1 text-[11px] font-bold text-violet">
          {chip}
        </span>
        <span className="rounded-full bg-violet px-3 py-1.5 text-[12px] font-bold text-white">
          Crear →
        </span>
      </span>
    </Link>
  )
}
