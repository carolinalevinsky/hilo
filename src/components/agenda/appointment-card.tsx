import Link from 'next/link'

import { AppointmentMenu } from '@/components/agenda/appointment-menu'
import { appointmentStatusClasses, appointmentStatusLabel } from '@/lib/appointment-labels'
import { patientHex } from '@/lib/patient-colors'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/week'
import type { AppointmentWithPatient } from '@/server/appointments'

/** "09:00:00" + 45 → "09:45". */
function endTime(start: string, minutes: number) {
  const [h, m] = start.split(':').map(Number)
  const total = (h! * 60 + m! + minutes) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/**
 * One appointment as a row, for the day-by-day list a phone gets.
 *
 * The time leads, start over end, the way a calendar app reads; then a thin bar
 * in the patient's colour and the name. It used to be a bordered card with a
 * thick coloured left border, which on a rounded corner drew a crescent — it
 * read as a rendering bug, and the border around each card made a day with
 * four sessions a stack of boxes. A tinted row needs neither.
 *
 * Marking attendance is the action that has to be one tap: it happens with a
 * patient in the room or on the way out, not sitting down afterwards. So the
 * status lives in a menu on the row rather than behind a detail page.
 */
export function AppointmentCard({
  appointment,
  calendarPrivacy,
}: {
  appointment: AppointmentWithPatient
  /** Sólo de paso, hacia el menú. Ver `AppointmentMenu`. */
  calendarPrivacy?: string | null
}) {
  const patient = appointment.patients
  const name = patient?.full_name ?? 'Paciente'

  return (
    <div
      className={cn(
        'flex items-stretch gap-2.5 rounded-xl bg-muted/60 py-2 pr-1 pl-2.5',
        appointment.status === 'cancelled' && 'opacity-60',
      )}
    >
      <div className="flex w-10 shrink-0 flex-col justify-center tabular-nums">
        <span className="text-body leading-tight font-bold">
          {formatTime(appointment.start_time)}
        </span>
        <span className="text-micro leading-tight text-muted-foreground">
          {endTime(appointment.start_time, appointment.duration_minutes)}
        </span>
      </div>

      {/* The patient's own colour, the same one on their card and in their
          chart. It is what makes a week of eight names scannable. */}
      <span
        aria-hidden
        className="w-[3px] shrink-0 rounded-full"
        style={{ backgroundColor: patientHex(patient?.color ?? null) }}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="truncate text-body font-semibold">
          {patient ? (
            <Link href={`/pacientes/${patient.id}`} className="hover:underline">
              {name}
            </Link>
          ) : (
            name
          )}
        </p>

        {/* "Agendada" is the default and says nothing; the other three are news. */}
        {appointment.status !== 'scheduled' ? (
          <span
            className={cn(
              'mt-0.5 w-fit rounded-full px-1.5 py-px text-nano font-bold',
              appointmentStatusClasses(appointment.status),
            )}
          >
            {appointmentStatusLabel(appointment.status)}
          </span>
        ) : null}
      </div>

      <AppointmentMenu
        appointment={appointment}
        calendarPrivacy={calendarPrivacy}
        className="shrink-0 self-center text-muted-foreground hover:bg-card"
      />
    </div>
  )
}
