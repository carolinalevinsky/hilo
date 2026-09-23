'use client'

import { Check, CircleX } from '@/components/icons'
import { useFormStatus } from 'react-dom'

import { setAppointmentStatusAction } from '@/app/(app)/agenda/actions'
import { APPOINTMENT_STATUS_CLASSES } from '@/lib/appointment-labels'
import { cn } from '@/lib/utils'

/**
 * "¿Vino o no vino?", answered in one tap from the session panel.
 *
 * It used to live only inside the `···` menu, two taps and a read of six
 * options away. Attendance is not a setting — it is the one thing that gets
 * marked with the patient still in the room or already walking out, which is
 * exactly the moment nobody opens a menu. So it is here, in the body of the
 * panel, next to the badge that says what the session is right now.
 *
 * ─── Por qué un `<form>` y no un `onClick` ────────────────────────────────
 *
 * The same reason the menu uses one (see `appointment-menu.tsx`): a form posts
 * whether or not the JavaScript is behaving, and a control that looks like it
 * marked attendance and did not is the worst outcome available here. The client
 * boundary buys one thing only — `useFormStatus`, which disables both buttons
 * while the action is in flight so an impatient second tap cannot race the
 * first.
 *
 * Pressing the state the session is already in sends it back to "agendada":
 * marking the wrong one has to be undoable from the same two buttons, without
 * hunting for a third.
 */
export function AttendanceToggle({
  appointmentId,
  status,
  className,
}: {
  appointmentId: string
  status: string
  className?: string
}) {
  return (
    <form action={setAppointmentStatusAction} className={className}>
      <input type="hidden" name="appointmentId" value={appointmentId} />

      {/* Un control segmentado, no dos botones sueltos.
          Dibujados como botones comunes quedaban idénticos a "Ver paciente", que
          está tres centímetros más abajo y lleva a otra pantalla: la misma forma
          para "elegí una de estas dos" y para "andá a otro lado". La pista gris
          con la mitad elegida levantada es la misma que usan las solapas de
          `schedule-dialogs.tsx`, así que la forma ya significa eso en Ombúa. */}
      <div
        role="group"
        aria-label="Asistencia"
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
      >
        <AttendanceButton
          current={status}
          value="attended"
          label="Vino"
          icon={<Check className="size-3.5" />}
        />
        <AttendanceButton
          current={status}
          value="no_show"
          label="No vino"
          icon={<CircleX className="size-3.5" />}
        />
      </div>

      {status === 'attended' || status === 'no_show' ? (
        <p className="mt-1.5 text-micro text-muted-foreground">
          Tocá de nuevo para volver a agendada.
        </p>
      ) : null}
    </form>
  )
}

/**
 * One half of the pair. It is a submit button carrying its own `status`, so the
 * two share a single form and a single hidden appointment id.
 *
 * `aria-pressed` and not a radio group: these are two toggles that can both be
 * off —a session nobody marked yet— and pressing the pressed one turns it off.
 * A radio group cannot express either.
 */
function AttendanceButton({
  current,
  value,
  label,
  icon,
}: {
  current: string
  value: 'attended' | 'no_show'
  label: string
  icon: React.ReactNode
}) {
  const { pending } = useFormStatus()
  const active = current === value

  return (
    <button
      type="submit"
      name="status"
      // Volver a apretar lo que ya está puesto deshace la marca.
      value={active ? 'scheduled' : value}
      aria-pressed={active}
      disabled={pending}
      className={cn(
        'flex h-8 items-center justify-center gap-1.5 rounded-lg text-meta font-bold whitespace-nowrap transition-all outline-none',
        'focus-visible:ring-3 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-60',
        // La mitad elegida se levanta de la pista y se pinta del color de su
        // estado; la otra es texto apagado sobre el gris. Sin el `shadow-card`
        // el color solo no alcanza: "Vino" en verde suave y "No vino" en gris
        // son dos casillas de color, no una elegida y otra no.
        active
          ? cn('shadow-card', APPOINTMENT_STATUS_CLASSES[value])
          : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
