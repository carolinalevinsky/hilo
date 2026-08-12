import { CalendarPlus, Check, MoreHorizontal, Trash2, X } from 'lucide-react'
import Link from 'next/link'

import {
  deleteAppointmentAction,
  setAppointmentStatusAction,
} from '@/app/(app)/agenda/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { appointmentStatusClasses, appointmentStatusLabel } from '@/lib/appointment-labels'
import { patientHex } from '@/lib/patient-colors'
import { cn } from '@/lib/utils'
import { formatTime, googleCalendarLink } from '@/lib/week'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * One appointment in the weekly grid.
 *
 * Marking attendance is the action that has to be one tap: it happens with a
 * patient in the room or on the way out, not sitting down afterwards. So the
 * status lives in a menu on the card rather than behind a detail page.
 *
 * Each action is a `<form action={...}>` around the menu item rather than an
 * `onSelect` handler that calls the Server Action. That is not a stylistic
 * preference — the handler version silently did nothing, no request left the
 * browser, and a menu that looks like it worked and did not is the worst
 * possible outcome for "mark that she came". Forms post whether or not the
 * JavaScript is behaving, which also makes this a Server Component.
 */
export function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentWithPatient
}) {
  const patient = appointment.patients
  const name = patient?.full_name ?? 'Paciente'

  return (
    <div
      className={cn(
        // Stacked, not a row. A day column in the week grid is about 200px wide,
        // and time + avatar + name + menu on one line truncates the name to two
        // characters — which is the one thing on the card that has to be
        // readable.
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

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Opciones de la sesión de ${name}`}
          className="absolute top-1.5 right-1 rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <StatusItem appointmentId={appointment.id} status="attended">
            <Check className="size-4" />
            Vino
          </StatusItem>
          <StatusItem appointmentId={appointment.id} status="no_show">
            <X className="size-4" />
            No vino
          </StatusItem>
          <StatusItem appointmentId={appointment.id} status="cancelled">
            <X className="size-4" />
            Cancelada
          </StatusItem>
          <StatusItem appointmentId={appointment.id} status="scheduled">
            Volver a agendada
          </StatusItem>

          <DropdownMenuSeparator />

          {patient ? (
            <DropdownMenuItem asChild>
              <Link href={`/pacientes/${patient.id}/sesiones/nueva`}>Registrar sesión</Link>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem asChild>
            <a
              href={googleCalendarLink({
                date: appointment.scheduled_on,
                time: appointment.start_time,
                durationMinutes: appointment.duration_minutes,
                title: `Sesión con ${name}`,
                details: 'Agendado desde Hilo',
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarPlus className="size-4" />
              Agregar a Google Calendar
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <form action={deleteAppointmentAction}>
            <input type="hidden" name="appointmentId" value={appointment.id} />
            <DropdownMenuItem asChild variant="destructive">
              <button type="submit" className="w-full">
                <Trash2 className="size-4" />
                Quitar de la agenda
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function StatusItem({
  appointmentId,
  status,
  children,
}: {
  appointmentId: string
  status: string
  children: React.ReactNode
}) {
  return (
    <form action={setAppointmentStatusAction}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="status" value={status} />
      <DropdownMenuItem asChild>
        <button type="submit" className="w-full">
          {children}
        </button>
      </DropdownMenuItem>
    </form>
  )
}
