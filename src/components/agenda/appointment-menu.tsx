import {
  Ban,
  CalendarPlus,
  Check,
  CircleX,
  ClipboardList,
  Eye,
  MoreHorizontal,
  RotateCw,
  Trash2,
} from '@/components/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'

import {
  deleteAppointmentAction,
  setAppointmentStatusAction,
} from '@/app/(app)/agenda/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { appointmentStatusLabel } from '@/lib/appointment-labels'
import { cn } from '@/lib/utils'
import { calendarEventTitle } from '@/lib/calendar-privacy'
import { googleCalendarLink } from '@/lib/week'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * Where "Registrar sesión" goes from an appointment, shared with `SessionPanel`.
 *
 * The link carries the slot (`?agenda=`) so the record is tied to it and saving
 * marks it attended. A slot that already has its record offers that record
 * instead: the database allows one per slot, and a button that leads to a form
 * which fails on save is worse than no button.
 */
export function recordLink(appointment: AppointmentWithPatient) {
  const recorded = appointment.sessions[0]
  const base = `/pacientes/${appointment.patient_id}/sesiones`

  return recorded
    ? { href: `${base}/${recorded.id}`, label: 'Ver registro' }
    : { href: `${base}/nueva?agenda=${appointment.id}`, label: 'Registrar sesión' }
}

/**
 * One way of removing an appointment, as its own form — for the same reason every
 * other item in this menu is one (see below). `scope` is what the server acts on:
 * "sólo esta vez" or "todas las de este horario".
 */
function RemoveItem({
  appointmentId,
  scope,
  children,
}: {
  appointmentId: string
  scope: 'once' | 'series'
  children: ReactNode
}) {
  return (
    <form action={deleteAppointmentAction}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="scope" value={scope} />
      <DropdownMenuItem asChild variant="destructive">
        <button type="submit" className="w-full justify-start whitespace-nowrap">
          {children}
        </button>
      </DropdownMenuItem>
    </form>
  )
}

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
 *
 * ─── Lo que el menú no ofrece ──────────────────────────────────────────────
 *
 * Nada que no se pueda hacer desde el estado en el que la sesión está. El
 * estado de ahora no se ofrece como acción —se muestra arriba, como título—,
 * "Volver a agendada" sólo aparece si hay de dónde volver, y "Agregar a Google
 * Calendar" desaparece cuando la sesión ya está en Google: ahí ese link no
 * agrega nada, duplica el evento.
 */
export function AppointmentMenu({
  appointment,
  calendarPrivacy,
  hideAttendanceActions = false,
  hideRecordAction = false,
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
  /**
   * Sin "Vino" ni "No vino". Es para el panel de la Agenda, que tiene los dos
   * botones de asistencia en el cuerpo (ver `AttendanceToggle`) y no necesita
   * repetirlos acá adentro.
   *
   * No apaga "Cancelada" ni "Volver a agendada": ésas no están arriba, y sin
   * ellas una sesión cancelada se quedaría sin forma de volver.
   *
   * En la grilla y en las tarjetas del teléfono queda en `false`, que es donde
   * este menú es el único lugar para marcar asistencia.
   */
  hideAttendanceActions?: boolean
  /** Sin "Registrar sesión": en el panel ya es el botón principal. */
  hideRecordAction?: boolean
  className?: string
}) {
  const patient = appointment.patients
  const name = patient?.full_name ?? 'Paciente'
  const status = appointment.status ?? 'scheduled'
  const record = recordLink(appointment)

  // Qué estados tiene sentido ofrecer. El de ahora nunca: apretarlo no cambia
  // nada y ocupa el lugar de algo que sí.
  const canMarkAttended = !hideAttendanceActions && status !== 'attended'
  const canMarkNoShow = !hideAttendanceActions && status !== 'no_show'
  const canCancel = status !== 'cancelled'
  const canReschedule = status !== 'scheduled'
  const hasStatusItems = canMarkAttended || canMarkNoShow || canCancel || canReschedule

  const showRecord = Boolean(patient) && !hideRecordAction
  // Ya está en Google: el link de "agregar" crearía un segundo evento a la
  // misma hora. Ver `pushAppointment` en `src/server/google-calendar.ts`, que es
  // quien escribe `gcal_event_id`.
  const showGoogle = !appointment.gcal_event_id
  const hasActionItems = showRecord || showGoogle

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Opciones de la sesión de ${name}`}
        className={cn('rounded-md p-1', className)}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      {/* El ancho lo ponía el disparador, que es un botón de 24 px: el menú
          salía de 128 px y "Agregar a Google Calendar" se partía en tres
          renglones. Acá manda el contenido, con un piso que alcanza para la
          línea más larga. */}
      <DropdownMenuContent align="end" className="w-auto min-w-56">
        {hasStatusItems ? (
          <>
            {hideAttendanceActions ? null : (
              <DropdownMenuLabel>Ahora: {appointmentStatusLabel(status)}</DropdownMenuLabel>
            )}

            {canMarkAttended ? (
              <StatusItem appointmentId={appointment.id} status="attended">
                <Check className="size-4" />
                Vino
              </StatusItem>
            ) : null}
            {canMarkNoShow ? (
              <StatusItem appointmentId={appointment.id} status="no_show">
                <CircleX className="size-4" />
                No vino
              </StatusItem>
            ) : null}
            {canCancel ? (
              <StatusItem appointmentId={appointment.id} status="cancelled">
                {/* Distinto de "No vino" a propósito: una es que la familia
                    avisó y la otra que no. Con la misma ✕ en las dos, el menú
                    decía que eran lo mismo. */}
                <Ban className="size-4" />
                Cancelada
              </StatusItem>
            ) : null}
            {canReschedule ? (
              <StatusItem appointmentId={appointment.id} status="scheduled">
                <RotateCw className="size-4" />
                Volver a agendada
              </StatusItem>
            ) : null}
          </>
        ) : null}

        {hasStatusItems && hasActionItems ? <DropdownMenuSeparator /> : null}

        {showRecord ? (
          <DropdownMenuItem asChild>
            <Link href={record.href} className="whitespace-nowrap">
              {appointment.sessions[0] ? (
                <Eye className="size-4" />
              ) : (
                <ClipboardList className="size-4" />
              )}
              {record.label}
            </Link>
          </DropdownMenuItem>
        ) : null}

        {showGoogle ? (
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
              className="whitespace-nowrap"
            >
              <CalendarPlus className="size-4" />
              Agregar a Google Calendar
            </a>
          </DropdownMenuItem>
        ) : null}

        {hasStatusItems || hasActionItems ? <DropdownMenuSeparator /> : null}

        {/* A session from a standing schedule asks, as any calendar does with
            repeating events (P5). It used to be deleted and come back on the
            next load, because the rule recreated it. A one-off session has
            nothing to ask. */}
        {appointment.schedule_id ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="whitespace-nowrap text-destructive">
              <Trash2 className="size-4" />
              Quitar de la agenda
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-48">
              <RemoveItem appointmentId={appointment.id} scope="once">
                Sólo esta vez
              </RemoveItem>
              <RemoveItem appointmentId={appointment.id} scope="series">
                Todas las de este horario
              </RemoveItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <RemoveItem appointmentId={appointment.id} scope="once">
            <Trash2 className="size-4" />
            Quitar de la agenda
          </RemoveItem>
        )}
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
        <button type="submit" className="w-full justify-start whitespace-nowrap">
          {children}
        </button>
      </DropdownMenuItem>
    </form>
  )
}
