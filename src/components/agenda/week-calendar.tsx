import Link from 'next/link'
import { Fragment } from 'react'

import { AppointmentMenu } from '@/components/agenda/appointment-menu'
import { patientHex } from '@/lib/patient-colors'
import { cn } from '@/lib/utils'
import { WEEK_ORDER, formatTime, weekdayName } from '@/lib/week'
import { firstName } from '@/lib/whatsapp'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * The week as a timetable — v1's `.cal` grid (`legacy/index.html:1440-1450`).
 *
 * A therapist's week has a *shape*: mornings full, Thursday empty, a gap at
 * eleven. A column of day cards cannot show that, because it collapses the space
 * between 9:00 and 16:00 into nothing. This is the view v2 was missing, and it is
 * the reason the Agenda existed.
 *
 * v1 rendered this grid on a desktop and a plain per-day list on a phone
 * (`.calwrap{display:none}` in its mobile media query). Same split here: eight
 * columns of forty pixels is not a week, it is wallpaper. The day cards below
 * `lg` are that mobile view, and they carry the same menu, so nothing is only
 * reachable on one size of screen.
 *
 * ─── Which hours, and which days ───────────────────────────────────────────
 *
 * 8:00 to 20:00 always, widened by anything scheduled outside it — v1's rule.
 * A fixed range hides a 7:30, and a range derived purely from the data makes
 * every week a different height, so the grid moves under you as you page
 * through it.
 *
 * Monday to Friday always; Saturday and Sunday only when something is on them.
 * Two permanently empty columns are two fifths of the width spent on nothing.
 */

const DEFAULT_FIRST_HOUR = 8
const DEFAULT_LAST_HOUR = 20

/** "09:30:00" → 9 */
const hourOf = (time: string) => Number(time.slice(0, 2))

export function WeekCalendar({
  dates,
  appointments,
  today,
  ageOf,
  calendarPrivacy,
}: {
  dates: string[]
  appointments: AppointmentWithPatient[]
  today: string
  /** Patient id → "5 años". The appointment does not carry a birthday. */
  ageOf?: Map<string, string | null>
  /** Sólo de paso, hacia el menú de cada sesión. Ver `AppointmentMenu`. */
  calendarPrivacy?: string | null
}) {
  const byDate = new Map<string, AppointmentWithPatient[]>()
  for (const appointment of appointments) {
    const list = byDate.get(appointment.scheduled_on)
    if (list) list.push(appointment)
    else byDate.set(appointment.scheduled_on, [appointment])
  }

  const days = dates
    .map((date, index) => ({ date, weekday: WEEK_ORDER[index]!, index }))
    .filter((day) => day.index < 5 || (byDate.get(day.date)?.length ?? 0) > 0)

  const scheduledHours = appointments.map((appointment) => hourOf(appointment.start_time))
  const firstHour = Math.min(DEFAULT_FIRST_HOUR, ...scheduledHours)
  const lastHour = Math.max(DEFAULT_LAST_HOUR, ...scheduledHours)
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i)

  return (
    <div className="max-lg:hidden">
      <div className="overflow-x-auto rounded-lg bg-card shadow-card">
        <div
          className="grid min-w-[640px]"
          style={{
            gridTemplateColumns: `52px repeat(${days.length}, minmax(96px, 1fr))`,
          }}
        >
          <div className="border-b border-border bg-card" />

          {days.map((day) => {
            const isToday = day.date === today
            return (
              <div
                key={day.date}
                className={cn(
                  'border-b border-l border-border px-1.5 py-3 text-center text-[13px] font-bold',
                  isToday ? 'bg-violet-soft' : 'bg-[#faf9ff]',
                )}
              >
                {weekdayName(day.weekday)}
                <div
                  className={cn(
                    'mt-0.5 text-[11px] font-semibold',
                    isToday ? 'text-violet' : 'text-muted-foreground',
                  )}
                >
                  {Number(day.date.slice(8, 10))}/{Number(day.date.slice(5, 7))}
                </div>
              </div>
            )
          })}

          {hours.map((hour) => (
            <Fragment key={hour}>
              <div className="border-b border-border px-1.5 pt-2 text-right text-[11px] text-muted-foreground">
                {String(hour).padStart(2, '0')}:00
              </div>

              {days.map((day) => (
                <div
                  key={`${day.date}-${hour}`}
                  className="min-h-14 border-b border-l border-border p-1"
                >
                  {(byDate.get(day.date) ?? [])
                    .filter((appointment) => hourOf(appointment.start_time) === hour)
                    .map((appointment) => (
                      <Event
                        key={appointment.id}
                        appointment={appointment}
                        ageOf={ageOf}
                        calendarPrivacy={calendarPrivacy}
                      />
                    ))}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function Event({
  appointment,
  ageOf,
  calendarPrivacy,
}: {
  appointment: AppointmentWithPatient
  ageOf?: Map<string, string | null>
  calendarPrivacy?: string | null
}) {
  const patient = appointment.patients
  const name = patient ? firstName(patient.full_name) : 'Paciente'
  const age = patient ? ageOf?.get(patient.id) : null

  return (
    <div
      className={cn(
        'relative mb-1 rounded-[9px] px-1.5 py-1.5 pr-6 text-[11.5px] leading-tight font-semibold text-white',
        appointment.status === 'cancelled' && 'opacity-55',
      )}
      style={{ background: patientHex(patient?.color ?? null) }}
    >
      <LinkOrText patientId={patient?.id}>
        {formatTime(appointment.start_time)} · {name}
      </LinkOrText>
      {age ? <div className="font-normal opacity-90">{age}</div> : null}

      <AppointmentMenu
        appointment={appointment}
        calendarPrivacy={calendarPrivacy}
        className="absolute top-0.5 right-0 text-white/80 hover:text-white"
      />
    </div>
  )
}

function LinkOrText({
  patientId,
  children,
}: {
  patientId?: string
  children: React.ReactNode
}) {
  if (!patientId) return <span className="block">{children}</span>
  return (
    <Link href={`/pacientes/${patientId}`} className="block hover:underline">
      {children}
    </Link>
  )
}
