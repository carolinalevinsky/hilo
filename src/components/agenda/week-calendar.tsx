import Link from 'next/link'

import { AppointmentMenu } from '@/components/agenda/appointment-menu'
import { NowLine } from '@/components/agenda/now-line'
import { HOUR_HEIGHT, placeSpans, type Span } from '@/lib/agenda-layout'
import { appointmentStatusLabel, appointmentStatusTile } from '@/lib/appointment-labels'
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
  selectedId,
  hrefForSession,
  hrefForSlot,
  header,
  headerEnd,
  showWeekend = false,
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
  /** La sesión abierta en el panel, para marcarla en la grilla. */
  selectedId?: string
  /**
   * Cómo se arma el enlace de cada sesión. Lo decide la página, que es la que
   * sabe en qué semana estamos y qué otros parámetros hay que conservar.
   */
  hrefForSession: (appointmentId: string) => string
  /**
   * El enlace de una media hora vacía, que abre "Agendar sesión" con ese día y
   * esa hora puestos (P6). Lo arma la página por la misma razón que el de cada
   * sesión. Sin él —sin pacientes todavía— la grilla no ofrece nada.
   */
  hrefForSlot?: (date: string, time: string) => string
  /**
   * Las flechas de semana y el botón "Hoy", adentro de la tarjeta del
   * calendario y no flotando arriba. Entra como slot en vez de armarse acá
   * porque los enlaces dependen de la URL, y esto no sabe nada de rutas.
   */
  header?: React.ReactNode
  /** Contra el borde derecho de la misma barra: el selector de días. */
  headerEnd?: React.ReactNode
  /**
   * Dibujar sábado y domingo.
   *
   * En `false` —lo normal— la grilla es de lunes a viernes y punto, aunque el
   * fin de semana tenga algo. Casi nadie atiende sábado, y dos columnas
   * permanentemente vacías son dos séptimos del ancho gastados en nada.
   *
   * Lo que no puede pasar es que algo desaparezca sin avisar, así que cuando hay
   * sesiones escondidas la barra lo dice y ofrece el cambio. Ver `hiddenCount`.
   */
  showWeekend?: boolean
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

  // Lunes a viernes, salvo que se pida la semana entera. Antes el fin de semana
  // se dibujaba solo cuando traía algo; ahora lo decide el selector de la barra,
  // y lo que quedó afuera se anuncia en vez de dibujarse (ver `hiddenCount`).
  const days = dates
    .map((date, index) => ({ date, weekday: WEEK_ORDER[index]!, index }))
    .filter((day) => day.index < 5 || showWeekend)

  // Cuántas sesiones quedaron fuera de la vista por ser de fin de semana. Sólo
  // las de Hilo: un cumpleaños en Google que no se vea no es un problema, una
  // sesión que no se vea sí.
  const hiddenCount = showWeekend
    ? 0
    : dates
        .slice(5)
        .reduce((total, date) => total + (byDate.get(date)?.length ?? 0), 0)

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
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        {header || headerEnd ? (
          <div className="flex items-center gap-3 border-b border-border px-3.5 py-2.5">
            {header}

            <div className="ml-auto flex items-center gap-2.5">
              {/* Nada se esconde en silencio. Si hay sesiones el fin de semana y
                  la vista es de lunes a viernes, la barra lo dice; el selector
                  está justo al lado para cambiarlo. */}
              {hiddenCount > 0 ? (
                <span className="text-meta font-semibold text-violet">
                  {hiddenCount === 1
                    ? '1 sesión el fin de semana'
                    : `${hiddenCount} sesiones el fin de semana`}
                </span>
              ) : null}
              {headerEnd}
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
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
                  'border-b border-l border-border px-1.5 py-3 text-center text-body font-bold',
                  isToday ? 'bg-violet-soft' : 'bg-[#faf9ff]',
                )}
              >
                {weekdayName(day.weekday)}
                <div
                  className={cn(
                    'mt-0.5 text-micro font-semibold',
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
              <div className="border-b border-border px-1.5 py-1 text-right text-micro text-muted-foreground">
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
                      className="truncate rounded-[7px] border border-dashed border-border bg-muted px-1.5 py-1 text-micro font-semibold text-muted-foreground"
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
                className="border-b border-border px-1.5 pt-1 text-right text-micro text-muted-foreground"
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
                {/* Each hour is two half-hour links (P6): click the slot and
                    "Agendar sesión" opens with that day and time, as in any
                    calendar. Links, not handlers — the grid stays a Server
                    Component and the slot is a URL. The sessions drawn on top
                    keep their own clicks; see the overlay below. */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="flex flex-col border-b border-border"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {hrefForSlot
                      ? (['00', '30'] as const).map((minutes) => {
                          const time = `${String(hour).padStart(2, '0')}:${minutes}`
                          return (
                            <Link
                              key={minutes}
                              href={hrefForSlot(day.date, time)}
                              scroll={false}
                              aria-label={`Agendar el ${weekdayName(day.weekday).toLowerCase()} ${Number(day.date.slice(8, 10))}/${Number(day.date.slice(5, 7))} a las ${time}`}
                              className="flex flex-1 items-start px-1.5 pt-0.5 text-micro font-semibold text-violet opacity-0 transition-opacity hover:bg-violet-soft/60 hover:opacity-100 focus-visible:opacity-100"
                            >
                              + {time}
                            </Link>
                          )
                        })
                      : null}
                  </div>
                ))}

                {/* Sólo en la columna de hoy: una línea de "ahora" en el jueves
                    que viene no marca nada. */}
                {day.date === today ? (
                  <NowLine firstHour={firstHour} lastHour={lastHour} />
                ) : null}

                {/* `pointer-events-none` on the layer and back on each piece: the
                    layer covers the whole column, and without this it swallowed
                    every click meant for the empty slots underneath. */}
                <div className="pointer-events-none absolute inset-0">
                  {placeSpans(pieces).map(({ span: piece, z, top, height, width, labelTop }) => (
                    <div
                      key={piece.key}
                      className="pointer-events-auto absolute left-0 px-[3px] py-px"
                      style={{ top, height, width: `${width}%`, zIndex: z }}
                    >
                      {piece.kind === 'session' ? (
                        <Event
                          appointment={piece.appointment}
                          ageOf={ageOf}
                          calendarPrivacy={calendarPrivacy}
                          labelTop={labelTop}
                          href={hrefForSession(piece.appointment.id)}
                          selected={piece.appointment.id === selectedId}
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
    </div>
  )
}

function Event({
  appointment,
  ageOf,
  calendarPrivacy,
  labelTop,
  href,
  selected,
}: {
  appointment: AppointmentWithPatient
  ageOf?: Map<string, string | null>
  calendarPrivacy?: string | null
  labelTop: number
  /** A dónde lleva el nombre: esta misma semana, con esta sesión abierta. */
  href: string
  selected: boolean
}) {
  const patient = appointment.patients
  const name = patient ? firstName(patient.full_name) : 'Paciente'
  const age = patient ? ageOf?.get(patient.id) : null

  return (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-[9px] px-1.5 py-1.5 pr-6 text-micro leading-tight font-semibold text-white',
        appointment.status === 'cancelled' && 'line-through opacity-55',
        // El anillo va por fuera del color del paciente, que ya ocupa el fondo.
        // Sin esto no habría forma de saber cuál de las doce es la que estás
        // mirando en el panel.
        selected && 'ring-2 ring-foreground ring-offset-1',
      )}
      style={{ background: patientHex(patient?.color ?? null) }}
    >
      {/* Ver `APPOINTMENT_STATUS_TILE`: los cuatro estados se dibujaban igual
          salvo el cancelado, así que marcar "Vino" no movía un pixel. */}
      {appointmentStatusTile(appointment.status).frame ? (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[9px]',
            appointmentStatusTile(appointment.status).frame,
          )}
        />
      ) : null}

      {appointmentStatusTile(appointment.status).glyph ? (
        <span
          aria-hidden
          className="absolute top-0.5 right-1 text-[10px] leading-none opacity-95"
        >
          {appointmentStatusTile(appointment.status).glyph}
        </span>
      ) : null}

      {/* Dicho también en palabras, para quien no ve el anillo ni el glifo. */}
      <span className="sr-only">{appointmentStatusLabel(appointment.status)}</span>

      <div style={{ paddingTop: labelTop }}>
        <SelectLink href={href}>
          {formatTime(appointment.start_time)} · {name}
        </SelectLink>
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
    <div className="h-full overflow-hidden rounded-[9px] border border-dashed border-border bg-muted px-1.5 py-1.5 text-micro leading-tight text-muted-foreground">
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

/**
 * El nombre, que abre la sesión al costado.
 *
 * Antes llevaba a la ficha del paciente, y eso sacaba la semana de la pantalla
 * para responder algo que casi siempre es más chico: a qué hora era, cuánto
 * dura, marcar que vino. Ahora eso pasa al lado de la grilla y la ficha sigue a
 * un click, desde el panel.
 *
 * Es un enlace y no un botón porque el estado vive en la URL: se puede volver
 * con el botón de atrás, se puede recargar, y anda sin JavaScript.
 */
function SelectLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} scroll={false} className="block hover:underline">
      {children}
    </Link>
  )
}
