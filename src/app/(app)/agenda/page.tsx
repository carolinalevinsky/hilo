import { CalendarDays } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ScheduleDialogs } from '@/components/agenda/schedule-dialogs'
import { TomorrowReminders } from '@/components/agenda/tomorrow-reminders'
import { WeekCalendar } from '@/components/agenda/week-calendar'
import { WeekGrid } from '@/components/agenda/week-grid'
import { EmptyState } from '@/components/empty-state'
import { PendingBookingRequests } from '@/components/booking/pending-requests'
import { PageHeader } from '@/components/page-header'
import { PeriodSwitcher } from '@/components/period-switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { frequencyLabel } from '@/lib/appointment-labels'
import { toDateInput, today as todayString } from '@/lib/dates'
import { formatTime, weekDates, weekLabel, weekdayName } from '@/lib/week'
import {
  listAppointments,
  listSchedules,
  materialiseAppointments,
} from '@/server/appointments'
import { requireUser } from '@/server/auth'
import { listBookingRequests } from '@/server/booking'
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

  // Tomorrow, whichever week is on screen. The reminder is about the phone
  // calls tonight, not about the week you happen to be paging through.
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = toDateInput(tomorrowDate)

  const [appointments, schedules, patients, pendingBookings, tomorrowAppointments] =
    await Promise.all([
      listAppointments(user.id, first, last),
      listSchedules(user.id),
      listPatients(user.id),
      // The requests themselves rather than a count: they are answered here.
      listBookingRequests(user.id, 'pending'),
      listAppointments(user.id, tomorrow, tomorrow),
    ])

  // The appointment row carries the patient's name and colour but not their
  // birthday, and the list is already loaded for the "Agendar" dialog.
  const ageOf = new Map(
    patients.map((patient) => [patient.id, ageLabel(patient.date_of_birth)]),
  )
  const phoneOf = new Map(patients.map((patient) => [patient.id, patient.phone]))

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
          {/* Reservas sits at the top of the Agenda, as in v1
              (`legacy/index.html:1499`), and only when there is something to
              do about it. A family asking for a time is an interruption to the
              week you are looking at — that is why it belongs above the week
              and not behind a sidebar item you would have to remember to open.

              Answered here, too, and not behind a link. v1 put the two buttons
              on this card; a family waiting on a reply is what you deal with in
              the ten seconds you have between patients, and "go to another
              screen first" is how it becomes tomorrow's job. */}
          {pendingBookings.length > 0 ? (
            <Card className="mb-3.5 border-violet">
              <CardHeader>
                <CardTitle>Reservas nuevas</CardTitle>
                <p className="text-[12.5px] text-muted-foreground">
                  {pendingBookings.length === 1
                    ? '1 pendiente · confirmala para agregarla a tu agenda'
                    : `${pendingBookings.length} pendientes · confirmalas para agregarlas a tu agenda`}
                </p>
              </CardHeader>
              <CardContent>
                <PendingBookingRequests requests={pendingBookings} />
                <Link
                  href="/reservas"
                  className="mt-2 inline-block text-[12.5px] font-semibold text-violet hover:underline"
                >
                  Tu link para reservar y las ya resueltas →
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <TomorrowReminders
            date={tomorrow}
            appointments={tomorrowAppointments}
            phoneOf={phoneOf}
          />

          <div className="mb-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <PeriodSwitcher
              prevHref={`/agenda?semana=${offset - 1}`}
              nextHref={`/agenda?semana=${offset + 1}`}
              label={weekLabel(dates)}
              caption={offset === 0 ? 'Esta semana' : undefined}
              className="min-w-0"
            />
            {offset !== 0 ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/agenda">Hoy</Link>
              </Button>
            ) : null}
          </div>

          <WeekCalendar
            dates={dates}
            appointments={appointments}
            today={todayString()}
            ageOf={ageOf}
          />
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
