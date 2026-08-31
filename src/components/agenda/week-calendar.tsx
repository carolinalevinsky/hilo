import Link from 'next/link'

import { AppointmentMenu } from '@/components/agenda/appointment-menu'
import { HOUR_HEIGHT, placeSpans, type Span } from '@/lib/agenda-layout'
import { patientHex } from '@/lib/patient-colors'
import { cn } from '@/lib/utils'
import { WEEK_ORDER, formatTime, weekdayName } from '@/lib/week'
import { firstName } from '@/lib/whatsapp'
import type { AppointmentWithPatient } from '@/server/appointments'
import type { BusyBlock } from '@/server/google-calendar'

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
 * ─── Por qué cada día es una columna y no una pila de celdas ───────────────
 *
 * Antes cada hora era una celda y lo que empezaba 18:30 se dibujaba pegado
 * arriba, a las 18:00. Media hora de diferencia dicha mal, y en una agenda esa
 * es toda la diferencia.
 *
 * Ahora la columna del día es un solo lienzo con altura conocida —una hora son
 * `HOUR_HEIGHT` píxeles— y cada cosa se ubica por el minuto en que empieza y
 * dura lo que dura. Es como está hecho cualquier calendario, y es lo único que
 * permite que 17:30 caiga a mitad de la franja de las 17.
 *
 * Las líneas de hora quedan de fondo, dibujadas por `HourLines`.
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

/** "09:30:00" → 570 */
const minutesOf = (time: string) => hourOf(time) * 60 + Number(time.slice(3, 5))

/**
 * Una cosa dibujable en la columna de un día, ya sea sesión de Hilo o evento de
 * Google. Se mezclan a propósito: el solape hay que resolverlo entre las dos, no
 * dentro de cada una.
 */
type Piece = Span & (
  | { kind: 'session'; appointment: AppointmentWithPatient }
  | { kind: 'busy'; block: BusyBlock }
)

export function WeekCalendar({
  dates,
  appointments,
  today,
  ageOf,
  calendarPrivacy,
  busyBlocks = [],
}: {
  dates: string[]
  appointments: AppointmentWithPatient[]
  today: string
  /** Patient id → "5 años". The appointment does not carry a birthday. */
  ageOf?: Map<string, string | null>
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
  const allDayByDate = new Map<string, BusyBlock[]>()
  for (const block of busyBlocks) {
    const bucket = block.startTime ? busyByDate : allDayByDate
    const list = bucket.get(block.date)
    if (list) list.push(block)
    else bucket.set(block.date, [block])
  }

  // Un sábado con una cena tiene que aparecer, igual que un sábado con una
  // sesión: si el día trae algo, el día se dibuja.
  const has = (date: string) =>
    (byDate.get(date)?.length ?? 0) +
      (busyByDate.get(date)?.length ?? 0) +
      (allDayByDate.get(date)?.length ?? 0) >
    0

  const days = dates
    .map((date, index) => ({ date, weekday: WEEK_ORDER[index]!, index }))
    .filter((day) => day.index < 5 || has(day.date))

  // La franja se estira con las dos cosas, y con el final además del principio:
  // una cena que va de 20:30 a 22:30 necesita que la grilla llegue a las 22, o
  // se dibujaría cortada por abajo.
  const edges = [
    ...appointments.flatMap((a) => [
      hourOf(a.start_time),
      Math.ceil((minutesOf(a.start_time) + a.duration_minutes) / 60) - 1,
    ]),
    ...busyBlocks.flatMap((b) =>
      b.startTime
        ? [hourOf(b.startTime), Math.ceil(minutesOf(b.endTime ?? b.startTime) / 60) - 1]
        : [],
    ),
  ]

  const firstHour = Math.min(DEFAULT_FIRST_HOUR, ...edges)
  const lastHour = Math.max(DEFAULT_LAST_HOUR, ...edges)
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i)
  const dayHeight = hours.length * HOUR_HEIGHT
  const gridStart = firstHour * 60

  const anyAllDay = allDayByDate.size > 0

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

          {/* Los eventos de todo el día no tienen hora que ubicar, así que no
              entran en la escala de minutos. Van en su propia franja, arriba de
              las horas — como en cualquier calendario. La fila sólo existe si
              hay alguno. */}
          {anyAllDay ? (
            <>
              <div className="border-b border-border px-1.5 py-1 text-right text-[10px] text-muted-foreground">
                Todo el día
              </div>
              {days.map((day) => (
                <div
                  key={`allday-${day.date}`}
                  className="space-y-1 border-b border-l border-border p-1"
                >
                  {(allDayByDate.get(day.date) ?? []).map((block) => (
                    <div
                      key={block.id}
                      className="truncate rounded-[7px] border border-dashed border-border bg-muted px-1.5 py-1 text-[11px] font-semibold text-muted-foreground"
                    >
                      {block.title}
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : null}

          <div className="border-border">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-border px-1.5 pt-1 text-right text-[11px] text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const pieces: Piece[] = [
              ...(byDate.get(day.date) ?? []).map(
                (appointment): Piece => ({
                  kind: 'session',
                  appointment,
                  key: `s-${appointment.id}`,
                  from: minutesOf(appointment.start_time) - gridStart,
                  to:
                    minutesOf(appointment.start_time) +
                    appointment.duration_minutes -
                    gridStart,
                }),
              ),
              ...(busyByDate.get(day.date) ?? []).map(
                (block): Piece => ({
                  kind: 'busy',
                  block,
                  key: `b-${block.id}`,
                  from: minutesOf(block.startTime!) - gridStart,
                  to:
                    (block.endTime
                      ? Math.max(minutesOf(block.endTime), minutesOf(block.startTime!) + 30)
                      : minutesOf(block.startTime!) + 60) - gridStart,
                }),
              ),
            ]

            return (
              <div
                key={day.date}
                className="relative border-l border-border"
                style={{ height: dayHeight }}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                <div className="absolute inset-0">
                  {placeSpans(pieces).map(({ span: piece, z, top, height, width, labelTop }) => (
                    <div
                      key={piece.key}
                      className="absolute left-0 px-[3px] py-px"
                      style={{ top, height, width: `${width}%`, zIndex: z }}
                    >
                      {piece.kind === 'session' ? (
                        <Event
                          appointment={piece.appointment}
                          ageOf={ageOf}
                          calendarPrivacy={calendarPrivacy}
                          labelTop={labelTop}
                        />
                      ) : (
                        <Busy block={piece.block} labelTop={labelTop} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Event({
  appointment,
  ageOf,
  calendarPrivacy,
  labelTop,
}: {
  appointment: AppointmentWithPatient
  ageOf?: Map<string, string | null>
  calendarPrivacy?: string | null
  labelTop: number
}) {
  const patient = appointment.patients
  const name = patient ? firstName(patient.full_name) : 'Paciente'
  const age = patient ? ageOf?.get(patient.id) : null

  return (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-[9px] px-1.5 py-1.5 pr-6 text-[11.5px] leading-tight font-semibold text-white',
        appointment.status === 'cancelled' && 'opacity-55',
      )}
      style={{ background: patientHex(patient?.color ?? null) }}
    >
      <div style={{ paddingTop: labelTop }}>
        <LinkOrText patientId={patient?.id}>
          {formatTime(appointment.start_time)} · {name}
        </LinkOrText>
        {age ? <div className="font-normal opacity-90">{age}</div> : null}
      </div>

      <AppointmentMenu
        appointment={appointment}
        calendarPrivacy={calendarPrivacy}
        className="absolute top-0.5 right-0 text-white/80 hover:text-white"
      />
    </div>
  )
}

/**
 * Un evento del calendario de Google que Hilo no creó.
 *
 * Deliberadamente distinto de una sesión: gris, sin color de paciente, sin menú
 * y sin enlace. No hay nada que editar acá — esto vive en Google y se cambia en
 * Google. Que se note a simple vista cuál de los dos es cuál importa más que que
 * quede lindo: son las dos únicas cosas en la grilla, y confundirlas es agendar
 * un paciente encima de tu propia cena.
 */
function Busy({ block, labelTop }: { block: BusyBlock; labelTop: number }) {
  return (
    <div className="h-full overflow-hidden rounded-[9px] border border-dashed border-border bg-muted px-1.5 py-1.5 text-[11.5px] leading-tight text-muted-foreground">
      <div style={{ paddingTop: labelTop }}>
        <div className="truncate font-semibold">{block.title}</div>
        <div className="font-normal opacity-90">
          {block.startTime ? formatTime(block.startTime) : ''}
          {block.endTime ? ` – ${formatTime(block.endTime)}` : ''}
        </div>
      </div>
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
