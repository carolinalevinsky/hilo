import { CalendarDays, Clock, Target, User, X } from '@/components/icons'
import Link from 'next/link'

import { AppointmentMenu } from '@/components/agenda/appointment-menu'
import { Button } from '@/components/ui/button'
import { patientHex } from '@/lib/patient-colors'
import { formatTime } from '@/lib/week'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * Una sesión abierta al costado de la semana.
 *
 * Reemplaza al recorrido de antes —click en el nombre y te ibas a la ficha del
 * paciente, perdiendo la semana de vista— por algo que no te saca de la Agenda.
 * Es el movimiento de cualquier calendario y es el que pidió el diseño.
 *
 * ─── Sólo lo que existe ────────────────────────────────────────────────────
 *
 * No hay "confirmada", ni sesión online, ni archivos adjuntos, ni reprogramar.
 * Los estados reales de una sesión son cuatro —agendada, vino, no vino,
 * cancelada— y las acciones reales son las que ya vivían en el menú `···`, que
 * se reusa entero acá abajo en vez de reescribirse.
 *
 * Reprogramar no está porque Hilo no sabe hacerlo: hoy se cancela y se agenda de
 * nuevo. Un botón que diga otra cosa sería mentira.
 */

/** Cómo se lee cada estado, en la voz del producto. */
const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Agendada',
  attended: 'Vino',
  no_show: 'No vino',
  cancelled: 'Cancelada',
}

const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-violet-soft text-violet',
  attended: 'bg-green-soft text-[#1a8f57]',
  no_show: 'bg-coral-soft text-[#c0392b]',
  cancelled: 'bg-muted text-muted-foreground',
}

export function SessionPanel({
  appointment,
  age,
  goal,
  calendarPrivacy,
  closeHref,
}: {
  appointment: AppointmentWithPatient
  /** "5 años". La fila de la cita no trae la fecha de nacimiento. */
  age?: string | null
  /** El objetivo más atrasado del paciente, si lo hay. Ver `planForRange`. */
  goal?: string | null
  calendarPrivacy?: string | null
  /** La misma semana, sin sesión elegida. */
  closeHref: string
}) {
  const patient = appointment.patients
  const name = patient?.full_name ?? 'Paciente'
  const status = appointment.status ?? 'scheduled'

  const start = formatTime(appointment.start_time)
  const endMinutes =
    Number(appointment.start_time.slice(0, 2)) * 60 +
    Number(appointment.start_time.slice(3, 5)) +
    appointment.duration_minutes
  const end = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(
    endMinutes % 60,
  ).padStart(2, '0')}`

  return (
    <aside
      aria-label={`Sesión de ${name}`}
      className="shrink-0 rounded-lg bg-card p-4 shadow-card lg:w-[300px]"
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-body font-bold text-white"
          style={{ background: patientHex(patient?.color ?? null) }}
        >
          {monogram(name)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lead font-extrabold tracking-[-0.3px]">{name}</p>
          {age ? <p className="text-meta text-muted-foreground">{age}</p> : null}
        </div>

        <Button asChild variant="ghost" size="sm" className="-mt-1 -mr-1 shrink-0">
          <Link href={closeHref} aria-label="Cerrar" scroll={false}>
            <X className="size-4" />
          </Link>
        </Button>
      </div>

      <dl className="space-y-2.5 text-body">
        <Row icon={<CalendarDays className="size-4" />} label="Cuándo">
          {longDate(appointment.scheduled_on)}
        </Row>
        <Row icon={<Clock className="size-4" />} label="Horario">
          {start} – {end} ({appointment.duration_minutes} min)
        </Row>
      </dl>

      <span
        className={`mt-3.5 inline-block rounded-full px-2.5 py-1 text-micro font-bold ${
          STATUS_STYLE[status] ?? STATUS_STYLE.scheduled
        }`}
      >
        {STATUS_LABEL[status] ?? 'Agendada'}
      </span>

      {goal ? (
        <div className="mt-3.5 rounded-xl bg-muted p-3">
          <p className="flex items-center gap-1.5 text-micro font-bold text-muted-foreground">
            <Target className="size-3.5" />
            Objetivo más atrasado
          </p>
          <p className="mt-1 text-meta leading-relaxed">{goal}</p>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {patient ? (
          <>
            <Button asChild className="w-full">
              <Link href={`/pacientes/${patient.id}/sesiones/nueva`}>Registrar sesión</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/pacientes/${patient.id}`}>
                <User className="size-4" />
                Ver paciente
              </Link>
            </Button>
          </>
        ) : null}
      </div>

      {/* Marcar que vino, cancelar, mandarla a Google o sacarla de la agenda.
          Es el mismo menú que en la grilla, no una copia: si mañana se agrega
          una acción, aparece en los dos lados sola. */}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-meta text-muted-foreground">Más acciones</span>
        <AppointmentMenu
          appointment={appointment}
          calendarPrivacy={calendarPrivacy}
          className="text-muted-foreground hover:text-foreground"
        />
      </div>
    </aside>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <dt className="sr-only">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/**
 * "Tomás Pérez" → "TP", para el círculo de arriba.
 *
 * Distinto de `initials` en `calendar-privacy.ts`, que devuelve "T. P.": aquello
 * es lo que se manda a Google cuando la profesional eligió no dar el nombre, y
 * los puntos ahí son parte del mensaje. Acá es un monograma dentro de un círculo
 * de cuarenta píxeles, donde los puntos sólo ocupan lugar.
 */
function monogram(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** "2026-08-31" → "lunes 31 de agosto de 2026" */
function longDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    // Se arma la fecha en UTC y se lee en UTC: es una fecha de calendario, sin
    // hora, y pasarla por una zona horaria la correría un día.
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, day!)))
}
