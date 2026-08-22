import { CalendarPlus, Check, MoreHorizontal, Trash2, X } from '@/components/icons'
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
import { cn } from '@/lib/utils'
import { calendarEventTitle } from '@/lib/calendar-privacy'
import { googleCalendarLink } from '@/lib/week'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * Everything you can do to one appointment, in a menu.
 *
 * Shared by the day cards and the weekly hour grid so that marking attendance
 * does not depend on which of the two you happen to be looking at. That is the
 * whole reason it is its own file.
 *
 * Each action is a `<form action={...}>` around the menu item rather than an
 * `onSelect` handler that calls the Server Action. That is not a stylistic
 * preference — the handler version silently did nothing, no request left the
 * browser, and a menu that looks like it worked and did not is the worst
 * possible outcome for "mark that she came". Forms post whether or not the
 * JavaScript is behaving, which also keeps this a Server Component.
 */
export function AppointmentMenu({
  appointment,
  calendarPrivacy,
  className,
}: {
  appointment: AppointmentWithPatient
  /**
   * Cuánto del paciente puede salir hacia Google. Viaja como prop desde la
   * página y no se lee acá porque esto es un componente de presentación — pero
   * sobre todo porque con un dato así conviene poder seguir a ojo por dónde
   * pasa. Sin valor, `calendarEventTitle` cae en "Ocupado".
   */
  calendarPrivacy?: string | null
  className?: string
}) {
  const patient = appointment.patients
  const name = patient?.full_name ?? 'Paciente'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Opciones de la sesión de ${name}`}
        className={cn('rounded-md p-1', className)}
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
            /* El título salía como `Sesión con Tomás Pérez`, sin preguntar. Eso
               deja escrito en un servidor de Google, fuera del país, que esa
               persona es paciente de esta profesional — y era la única opción,
               en silencio. Ahora lo decide ella en su perfil, y sin haberlo
               decidido dice "Ocupado".

               `details` no lleva nada del paciente a propósito: el motivo de
               consulta, los objetivos y la nota clínica no salen de Hilo por
               este camino bajo ninguna configuración. */
            href={googleCalendarLink({
              date: appointment.scheduled_on,
              time: appointment.start_time,
              durationMinutes: appointment.duration_minutes,
              title: calendarEventTitle(name, calendarPrivacy),
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
