import { CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ScheduleDialogs } from '@/components/agenda/schedule-dialogs'
import { WeekGrid } from '@/components/agenda/week-grid'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { frequencyLabel } from '@/lib/appointment-labels'
import { today as todayString } from '@/lib/dates'
import { formatTime, weekDates, weekLabel, weekdayName } from '@/lib/week'
import {
  listAppointments,
  listSchedules,
  materialiseAppointments,
} from '@/server/appointments'
import { requireUser } from '@/server/auth'
import { listPatients } from '@/server/patients'

import { deactivateScheduleAction } from './actions'

export const metadata: Metadata = { title: 'Agenda · Hilo' }

export default async function AgendaPage({ searchParams }: PageProps<'/agenda'>) {
  const params = await searchParams
  const user = await requireUser()

  const offsetParam = typeof params.semana === 'string' ? Number(params.semana) : 0
  const offset = Number.isFinite(offsetParam) ? Math.trunc(offsetParam) : 0

  const dates = weekDates(new Date(), offset)
  const first = dates[0]!
  const last = dates[dates.length - 1]!

  // Fill in the occurrences the standing rules imply, three weeks out. Safe to
  // run on every load: the unique constraint on (schedule_id, scheduled_on)
  // turns a repeat into a no-op.
  //
  // The window starts on Monday of the current week, not today, so that a slot
  // earlier this week is not missing from the grid. It deliberately does not
  // reach further back: a rule that has existed for five months would otherwise
  // conjure five months of appointments marked "agendada", inventing a history
  // of sessions nobody recorded. Weeks before Hilo was in use are empty because
  // Hilo genuinely does not know what happened in them.
  const horizon = weekDates(new Date(), Math.max(offset, 0) + 3)
  await materialiseAppointments(
    user.id,
    weekDates(new Date(), 0)[0]!,
    horizon[horizon.length - 1]!,
  )

  const [appointments, schedules, patients] = await Promise.all([
    listAppointments(user.id, first, last),
    listSchedules(user.id),
    listPatients(user.id),
  ])

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle="Tu semana de sesiones."
        action={
          <ScheduleDialogs
            patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
          />
        }
      />

      {patients.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="Tu agenda te espera"
            text="Cargá tu primer paciente con su día y horario, y la sesión aparece sola en tu semana."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-3.5 flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/agenda?semana=${offset - 1}`}>← Anterior</Link>
            </Button>
            <Button asChild variant={offset === 0 ? 'secondary' : 'outline'} size="sm">
              <Link href="/agenda">Esta semana</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/agenda?semana=${offset + 1}`}>Siguiente →</Link>
            </Button>
            <span className="ml-1 text-[12.5px] text-muted-foreground max-sm:hidden">
              {weekLabel(dates)}
            </span>
          </div>

          <WeekGrid dates={dates} appointments={appointments} today={todayString()} />

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Horarios fijos</CardTitle>
              <p className="text-[12.5px] text-muted-foreground">
                Las sesiones que se repiten solas cada semana.
              </p>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  Todavía no hay ninguno. Con “Horario fijo” se agenda solo y no lo pensás
                  más.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {schedules.map((schedule) => (
                    <li
                      key={schedule.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-bold">
                          {schedule.patients?.full_name ?? 'Paciente'}
                        </p>
                        <p className="text-[12.5px] text-muted-foreground">
                          {weekdayName(schedule.weekday)} a las{' '}
                          {formatTime(schedule.start_time)} ·{' '}
                          {frequencyLabel(schedule.frequency).toLowerCase()} ·{' '}
                          {schedule.duration_minutes} min
                        </p>
                      </div>
                      <form action={deactivateScheduleAction}>
                        <input type="hidden" name="scheduleId" value={schedule.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Dar de baja
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
