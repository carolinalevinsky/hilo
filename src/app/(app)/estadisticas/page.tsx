import { ChartColumn, CircleCheck, Target, TrendingUp, Users } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { StatCard, StatCardGrid } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { patientHex } from '@/lib/patient-colors'
import { requireUser } from '@/server/auth'
import {
  mostWorkedGoals,
  practitionerStats,
  progressByPatient,
} from '@/server/statistics'

export const metadata: Metadata = { title: 'Estadísticas · Hilo' }

export default async function StatisticsPage() {
  const user = await requireUser()

  const [stats, byPatient, worked] = await Promise.all([
    practitionerStats(user.id),
    progressByPatient(user.id),
    mostWorkedGoals(user.id),
  ])

  if (stats.activePatients === 0) {
    return (
      <>
        <PageHeader title="Estadísticas" subtitle="Cómo viene tu práctica." />
        <Card>
          <EmptyState
            icon={ChartColumn}
            title="Todavía no hay datos para mostrar"
            text="Cuando cargues pacientes y registres sesiones, acá vas a ver el avance general, los objetivos consolidados y la evolución de cada uno."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      </>
    )
  }

  const delta = stats.sessionsThisMonth - stats.sessionsLastMonth

  return (
    <>
      <PageHeader title="Estadísticas" subtitle="Cómo viene tu práctica." />

      {/* v1's four, with v1's icons and colours (`legacy/index.html:2599-2610`).
          Two across even on the narrowest phone: one per row pushed the actual
          content — the per-patient progress, which is the reason to open this
          screen — below four scrolls of headline numbers. */}
      <StatCardGrid>
        <StatCard
          icon={Users}
          tone="violet"
          value={String(stats.activePatients)}
          label="Pacientes activos"
        />
        <StatCard
          icon={CircleCheck}
          tone="teal"
          value={String(stats.sessionsThisMonth)}
          label="Sesiones este mes"
          hint={
            stats.sessionsLastMonth === 0
              ? undefined
              : `${delta >= 0 ? '+' : ''}${delta} vs. el mes pasado`
          }
        />
        {/* v1's third card read "consolidados/total", counting a goal as
            consolidated at 70% (`legacy/index.html:2604`). v2 defines a goal as
            achieved at 100% and does not store a total, so the fraction cannot
            be rebuilt without either inventing a threshold or double-counting —
            an achieved goal is usually still an active one. The card keeps its
            place, its icon and its colour, and states the number v2 actually
            means. */}
        <StatCard
          icon={Target}
          tone="amber"
          value={String(stats.goalsAchieved)}
          label="Objetivos logrados"
        />
        <StatCard
          icon={TrendingUp}
          tone="green"
          value={`${stats.averageProgress}%`}
          label="Avance promedio"
        />
      </StatCardGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Avance por paciente</CardTitle>
            <p className="text-[12.5px] text-muted-foreground">
              De menor a mayor: los primeros son los que conviene mirar.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {byPatient.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="flex items-center gap-2.5 hover:opacity-80"
                  >
                    <PatientAvatar
                      fullName={patient.fullName}
                      color={patient.color}
                      size={30}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13.5px] font-bold">
                          {patient.fullName}
                        </span>
                        <span className="shrink-0 text-[12.5px] tabular-nums">
                          {patient.goalCount === 0 ? 'sin objetivos' : `${patient.averageProgress}%`}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${patient.averageProgress}%`,
                            background: patientHex(patient.color),
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En qué trabajaste más</CardTitle>
              <p className="text-[12.5px] text-muted-foreground">
                Objetivos por cantidad de sesiones.
              </p>
            </CardHeader>
            <CardContent>
              {worked.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  Todavía no marcaste objetivos en tus sesiones. Marcarlos es lo que hace
                  posible esta lista.
                </p>
              ) : (
                <ul className="space-y-2">
                  {worked.map((goal) => (
                    <li
                      key={goal.title}
                      className="flex items-center justify-between gap-2 text-[13px]"
                    >
                      <span className="truncate">{goal.title}</span>
                      <span className="shrink-0 rounded-full bg-violet-soft px-2 py-0.5 text-[11px] font-bold text-violet">
                        {goal.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Del período</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-y-2 text-[13px]">
                <dt className="text-muted-foreground">Objetivos activos</dt>
                <dd className="font-bold">{stats.activeGoals}</dd>
                {/* Asistencia lives here rather than in the row above, because
                    the row above is v1's four and because this number is often
                    "—": a headline card that usually says nothing teaches you to
                    stop reading the row. */}
                <dt className="text-muted-foreground">Asistencia</dt>
                <dd className="font-bold">
                  {stats.attendanceRate === null ? '—' : `${stats.attendanceRate}%`}
                </dd>
                <dt className="text-muted-foreground">Informes este mes</dt>
                <dd className="font-bold">{stats.reportsThisMonth}</dd>
                <dt className="text-muted-foreground">Sesiones el mes pasado</dt>
                <dd className="font-bold">{stats.sessionsLastMonth}</dd>
              </dl>

              {stats.attendanceRate === null ? (
                <p className="mt-2.5 text-[11.5px] text-muted-foreground">
                  La asistencia aparece cuando marcás las sesiones como “vino” o “no
                  vino”.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

