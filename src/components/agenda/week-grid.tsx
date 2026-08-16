import { AppointmentCard } from '@/components/agenda/appointment-card'
import { WEEK_ORDER, weekdayName } from '@/lib/week'
import { cn } from '@/lib/utils'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * The week as one card per day — what a phone gets, where the hour grid in
 * `week-calendar.tsx` would be eight columns of forty pixels. v1 made the same
 * split (`.agmob`, `legacy/index.html:1459`).
 *
 * Real dates on every column is the change from v1, and it is not cosmetic. v1's
 * agenda was `{"Lunes": [...]}` — weekday names and nothing else — so there was
 * exactly one week, forever, and looking at what happened last Tuesday was not a
 * feature that could be added without redoing the data.
 *
 * Sunday is rendered even when empty. A week with a hole where Sunday should be
 * reads as a bug, and some practitioners do work Saturdays.
 */
export function WeekGrid({
  dates,
  appointments,
  today,
}: {
  dates: string[]
  appointments: AppointmentWithPatient[]
  today: string
}) {
  const byDate = new Map<string, AppointmentWithPatient[]>()
  for (const appointment of appointments) {
    const list = byDate.get(appointment.scheduled_on)
    if (list) list.push(appointment)
    else byDate.set(appointment.scheduled_on, [appointment])
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:hidden">
      {dates.map((date, index) => {
        const weekday = WEEK_ORDER[index]!
        const dayAppointments = byDate.get(date) ?? []
        const isToday = date === today
        const dayNumber = Number(date.slice(8, 10))

        return (
          <section
            key={date}
            className={cn(
              'rounded-lg bg-card p-3 shadow-card',
              isToday && 'ring-2 ring-violet',
            )}
          >
            <header className="mb-2.5 flex items-baseline justify-between gap-1">
              <h3
                className={cn(
                  'text-[13px] font-extrabold',
                  isToday ? 'text-violet' : 'text-foreground',
                )}
              >
                {weekdayName(weekday)}
              </h3>
              <span className="text-[12px] text-muted-foreground">{dayNumber}</span>
            </header>

            {dayAppointments.length === 0 ? (
              <p className="py-2 text-[12px] text-muted-foreground">Libre</p>
            ) : (
              <ul className="space-y-2">
                {dayAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentCard appointment={appointment} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
