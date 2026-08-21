import Link from 'next/link'

import { AppointmentMenu } from '@/components/agenda/appointment-menu'
import { appointmentStatusClasses, appointmentStatusLabel } from '@/lib/appointment-labels'
import { patientHex } from '@/lib/patient-colors'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/week'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * One appointment as a card, for the day-by-day view a phone gets.
 *
 * Marking attendance is the action that has to be one tap: it happens with a
 * patient in the room or on the way out, not sitting down afterwards. So the
 * status lives in a menu on the card rather than behind a detail page.
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
        // Stacked, not a row. A day column is about 200px wide, and time +
        // avatar + name + menu on one line truncates the name to two characters
        // — which is the one thing on the card that has to be readable.
        'relative rounded-xl border border-border border-l-4 bg-card p-2 pr-7',
        appointment.status === 'cancelled' && 'opacity-60',
      )}
      // The patient's own colour, the same one on their card and in their chart.
      // It is what makes a week of eight names scannable.
      style={{ borderLeftColor: patientHex(patient?.color ?? null) }}
    >
      <p className="text-[12.5px] font-extrabold tabular-nums">
        {formatTime(appointment.start_time)}
      </p>

      <p className="truncate text-[12.5px]">
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
            'mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold',
            appointmentStatusClasses(appointment.status),
          )}
        >
          {appointmentStatusLabel(appointment.status)}
        </span>
      ) : null}

      <AppointmentMenu
        appointment={appointment}
        calendarPrivacy={calendarPrivacy}
        className="absolute top-1.5 right-1 text-muted-foreground hover:bg-muted"
      />
    </div>
  )
}
