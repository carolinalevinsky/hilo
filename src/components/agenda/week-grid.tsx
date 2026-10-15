import { AppointmentCard } from '@/components/agenda/appointment-card'
import { WEEK_ORDER, formatTime, weekdayName } from '@/lib/week'
import { cn } from '@/lib/utils'
import type { AppointmentWithPatient } from '@/server/appointments'
import type { BusyBlock } from '@/server/google-calendar'

/**
 * The week as one row per day — what a phone gets, where the hour grid in
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
  calendarPrivacy,
  busyBlocks = [],
}: {
  dates: string[]
  appointments: AppointmentWithPatient[]
  today: string
  /** Sólo de paso, hacia el menú de cada sesión. Ver `AppointmentMenu`. */
  calendarPrivacy?: string | null
  /** Lo que ya está ocupado en Google. Ver `listBusyBlocks`. */
  busyBlocks?: BusyBlock[]
}) {
  const byDate = new Map<string, AppointmentWithPatient[]>()
  for (const appointment of appointments) {
    const list = byDate.get(appointment.scheduled_on)
    if (list) list.push(appointment)
    else byDate.set(appointment.scheduled_on, [appointment])
  }

  const busyByDate = new Map<string, BusyBlock[]>()
  for (const block of busyBlocks) {
    const list = busyByDate.get(block.date)
    if (list) list.push(block)
    else busyByDate.set(block.date, [block])
  }

  return (
    // Una lista, no siete tarjetas. Como tarjetas, cada día vacío ocupaba 85 px
    // para decir "Libre", y una semana con dos días de trabajo eran dos
    // pantallas de scroll hasta el viernes. Así un día libre es un renglón, y
    // la fecha a la izquierda —día corto y número grande— es lo que el ojo
    // recorre para ubicarse, como en la agenda del teléfono.
    <div className="divide-y divide-border overflow-hidden rounded-lg bg-card shadow-card lg:hidden">
      {dates.map((date, index) => {
        const weekday = WEEK_ORDER[index]!
        const dayAppointments = byDate.get(date) ?? []
        const dayBusy = busyByDate.get(date) ?? []
        const isToday = date === today
        const isPast = date < today
        const dayNumber = Number(date.slice(8, 10))
        const name = weekdayName(weekday)

        return (
          <section
            key={date}
            aria-label={`${name} ${dayNumber}`}
            className={cn('flex gap-3 px-3 py-2', isToday && 'bg-violet-soft/45')}
          >
            <header
              className={cn(
                'flex w-10 shrink-0 flex-col items-center pt-0.5',
                isPast && 'opacity-55',
              )}
            >
              <span
                className={cn(
                  'text-nano font-bold tracking-[0.6px] uppercase',
                  isToday ? 'text-violet' : 'text-muted-foreground',
                )}
              >
                {name.slice(0, 3)}
              </span>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-[15px] font-extrabold',
                  isToday ? 'bg-violet text-white' : 'text-foreground',
                )}
              >
                {dayNumber}
              </span>
            </header>

            <div className="min-w-0 flex-1 self-center">
              {dayAppointments.length === 0 && dayBusy.length === 0 ? (
                <p className={cn('text-meta text-muted-foreground', isPast && 'opacity-55')}>
                  Libre
                </p>
              ) : (
                <ul className="space-y-2">
                  {dayAppointments.map((appointment) => (
                    <li key={appointment.id}>
                      <AppointmentCard
                        appointment={appointment}
                        calendarPrivacy={calendarPrivacy}
                      />
                    </li>
                  ))}

                  {/* Debajo de las sesiones: lo de Ombúa primero, que es lo que se
                      viene a hacer acá. Ver `Busy` en `week-calendar.tsx`. */}
                  {dayBusy.map((block) => (
                    <li
                      key={block.id}
                      className="rounded-[9px] border border-dashed border-border bg-muted px-2.5 py-2 text-meta leading-tight text-muted-foreground"
                    >
                      <div className="font-semibold">{block.title}</div>
                      <div className="opacity-90">
                        {block.startTime
                          ? `${formatTime(block.startTime)}${block.endTime ? ` – ${formatTime(block.endTime)}` : ''}`
                          : 'Todo el día'}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
