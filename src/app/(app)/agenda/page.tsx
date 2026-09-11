import { CalendarDays } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { cookies } from 'next/headers'

import { BookingChip } from '@/components/agenda/booking-chip'
import { ConnectGoogle } from '@/components/agenda/connect-google'
import { ScheduleDialogs } from '@/components/agenda/schedule-dialogs'
import { SessionPanel } from '@/components/agenda/session-panel'
import { PeriodNav } from '@/components/period-nav'
import { WeekViewSelect } from '@/components/agenda/week-view-select'
import { TomorrowReminders } from '@/components/agenda/tomorrow-reminders'
import { WeekCalendar } from '@/components/agenda/week-calendar'
import { WeekGrid } from '@/components/agenda/week-grid'
import { WeekPlan } from '@/components/agenda/week-plan'
import { EmptyState } from '@/components/empty-state'
import { PendingBookingRequests } from '@/components/booking/pending-requests'
import { PageHeader } from '@/components/page-header'
import { PeriodSwitcher } from '@/components/period-switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { frequencyLabel } from '@/lib/appointment-labels'
import { toDateInput, today as todayString, todayDate } from '@/lib/dates'
import { formatTime, weekDates, weekLabel, weekdayName, weekOffsetFrom } from '@/lib/week'
import {
  listAppointments,
  listSchedules,
  materialiseAppointments,
} from '@/server/appointments'
import { listBookingRequests } from '@/server/booking'
import { findGoogleAccount } from '@/server/google'
import { listBusyBlocks, pullFromGoogle } from '@/server/google-calendar'
import { listPatients } from '@/server/patients'
import { planForRange } from '@/server/planning'

import { deactivateScheduleAction } from './actions'

import { currentOrigin } from '../origin'
import { currentPractitioner, currentUser } from '../session'

export const metadata: Metadata = { title: 'Agenda · Hilo' }

/**
 * "Ahora no" al aviso de Google Calendar, por un mes.
 *
 * Vive acá y no en `ConnectGoogle` porque ese archivo es `'use client'`: una
 * constante exportada desde un módulo de cliente llega a un componente de
 * servidor como una referencia, no como su texto, y `cookies().get()` devuelve
 * `undefined` en silencio. La página es la que lee, así que la página es la
 * dueña del nombre.
 */
const GOOGLE_NOTICE_COOKIE = 'hilo_agenda_google'

export default async function AgendaPage({ searchParams }: PageProps<'/agenda'>) {
  const params = await searchParams
  const user = await currentUser()

  // La dirección real de esta petición, no la variable cargada a mano. Ver
  // `currentOrigin`: la variable quedó apuntando a Supabase y el link que se le
  // pasa a las familias no llevaba a ningún lado.
  const origin = await currentOrigin()

  const offset = weekOffsetFrom(params.semana)

  const dates = weekDates(todayDate(), offset)
  const first = dates[0]!
  const last = dates[dates.length - 1]!

  // Fill in the occurrences the standing rules imply, three weeks out. Safe to
  // run on every load: the unique constraint on (schedule_id, scheduled_on)
  // turns a repeat into a no-op.
  //
  // The window starts on Monday of the current week, not today, so that a slot
  // earlier this week is not missing from the grid. It deliberately does not
  // reach further back: a rule that has existed for five months would otherwise
  // conjure five months of appointments marked "agendada", inventing a history
  // of sessions nobody recorded. Weeks before Hilo was in use are empty because
  // Hilo genuinely does not know what happened in them.
  const horizon = weekDates(todayDate(), Math.max(offset, 0) + 3)
  await materialiseAppointments(
    user.id,
    weekDates(todayDate(), 0)[0]!,
    horizon[horizon.length - 1]!,
  )

  // Traer de Google lo que se movió allá, antes de leer la semana.
  //
  // Antes de `listAppointments` y no en paralelo, a propósito: si corriera al
  // lado, la pantalla mostraría los horarios viejos y los nuevos recién
  // aparecerían al recargar. Esperarlo cuesta una consulta y hace que lo que ves
  // sea lo que hay.
  //
  // Adentro se limita solo a una vez cada dos minutos, así que pasear por las
  // semanas con las flechas no dispara un viaje a Google por cada click. Y si
  // Google falla o tarda, devuelve cero y la Agenda sigue: ver la regla en
  // `google-calendar.ts`.
  await pullFromGoogle(user.id)

  // Tomorrow, whichever week is on screen. The reminder is about the phone
  // calls tonight, not about the week you happen to be paging through.
  const tomorrowDate = todayDate()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = toDateInput(tomorrowDate)

  const [
    appointments,
    schedules,
    patients,
    pendingBookings,
    tomorrowAppointments,
    practitioner,
    googleAccount,
  ] = await Promise.all([
    listAppointments(user.id, first, last),
    listSchedules(user.id),
    listPatients(user.id),
    // The requests themselves rather than a count: they are answered here.
    listBookingRequests(user.id, 'pending'),
    listAppointments(user.id, tomorrow, tomorrow),
    currentPractitioner(user.id),
    // Sólo para saber si hay que ofrecer conectar. No se usa nada de adentro.
    findGoogleAccount(user.id),
  ])

  // Lo que ya está ocupado en Google y no lo puso Hilo: la reunión de trabajo, la
  // cena, el cumpleaños. No se guarda en ningún lado — se lee, se dibuja y se
  // olvida. Ver `listBusyBlocks`.
  //
  // Va después del `Promise.all` y no adentro porque sólo hace falta la semana
  // que está en pantalla, y `first`/`last` ya la delimitan. Si la cuenta no está
  // conectada no hay nada que traer. Si está conectada y Google falla, la Agenda
  // se sigue viendo pero lo dice: ver `googleUnavailable` más abajo.
  const { blocks: busyBlocks, unavailable: googleUnavailable } = await listBusyBlocks(
    user.id,
    first,
    last,
  )

  // The week read as work rather than as a calendar. It needs the goals and the
  // matched material, which the grid does not — but it needs the same
  // appointments, so they are handed over rather than fetched again.
  const weekSessions = await planForRange(
    user.id,
    practitioner.discipline,
    first,
    last,
    appointments,
  )

  // The appointment row carries the patient's name and colour but not their
  // birthday, and the list is already loaded for the "Agendar" dialog.
  const ageOf = new Map(
    patients.map((patient) => [patient.id, ageLabel(patient.date_of_birth)]),
  )
  const phoneOf = new Map(patients.map((patient) => [patient.id, patient.phone]))

  // ─── La sesión abierta en el panel ────────────────────────────────────────
  //
  // Vive en la URL (`?sesion=<id>`) y no en estado de cliente. Eso hace que el
  // botón de atrás la cierre, que recargar no la pierda, y sobre todo que el
  // panel pueda ser un componente de servidor con los datos de verdad al lado.
  //
  // Se busca dentro de la semana que ya está cargada: un id de otra semana —o
  // inventado en la barra de direcciones— simplemente no encuentra nada y no
  // abre el panel, sin consultar la base y sin error.
  const weekHref = offset === 0 ? '/agenda' : `/agenda?semana=${offset}`
  const hrefForSession = (appointmentId: string) =>
    offset === 0
      ? `/agenda?sesion=${appointmentId}`
      : `/agenda?semana=${offset}&sesion=${appointmentId}`

  const selected =
    typeof params.sesion === 'string'
      ? appointments.find((appointment) => appointment.id === params.sesion)
      : undefined

  // El objetivo más atrasado de cada sesión, que "Plan de la semana" ya calculó
  // sobre estas mismas citas. Se reusa en vez de volver a pedirlo.
  const goalOf = new Map(
    weekSessions.map((session) => [session.appointmentId, session.focus?.title ?? null]),
  )

  // Las flechas, el rango y "Hoy". Se arma una sola vez y se usa en los dos
  // lugares donde hace falta —adentro de la tarjeta en escritorio, suelto en
  // teléfono— para que no se puedan desincronizar.
  // En teléfono el período es el título de lo que hay abajo, así que va centrado
  // entre las dos flechas. En escritorio es una barra de herramientas arriba de
  // la grilla, y ahí los controles van juntos a la izquierda. Ver `WeekNav`.
  const weekNavMobile = (
    <>
      <PeriodSwitcher
        prevHref={`/agenda?semana=${offset - 1}`}
        nextHref={`/agenda?semana=${offset + 1}`}
        label={weekLabel(dates)}
        // Sin "Esta semana": la columna de hoy ya viene pintada en la grilla, y
        // cuando no estás en la semana actual aparece el botón "Hoy". Decirlo
        // además con texto era la tercera vez.
        className="min-w-0"
      />
      {offset !== 0 ? (
        <Button asChild variant="outline" size="sm">
          <Link href="/agenda">Hoy</Link>
        </Button>
      ) : null}
    </>
  )

  // Cuántos días dibuja la grilla. "laboral" es el valor por defecto, así que la
  // dirección sólo lleva el parámetro cuando se pidió la semana entera.
  const weekView = params.vista === 'completa' ? 'completa' : 'laboral'

  // "Ahora no", de hasta un mes atrás. Se lee acá y no en el componente para que
  // el aviso no llegue a pintarse: ver la nota en `ConnectGoogle`.
  const googleNoticeHidden = (await cookies()).get(GOOGLE_NOTICE_COOKIE)?.value === 'off'

  const weekNavDesktop = (
    <PeriodNav
      prevHref={`/agenda?semana=${offset - 1}`}
      nextHref={`/agenda?semana=${offset + 1}`}
      resetHref="/agenda"
      label={weekLabel(dates)}
      isCurrent={offset === 0}
      resetLabel="Hoy"
    />
  )

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle="Tu semana de sesiones."
        action={
          <div className="flex flex-wrap items-center gap-2.5 max-lg:w-full">
            {/* El link de reservas, donde se lo necesita: acá es donde estás
                cuando alguien te pregunta cómo pedir hora. La pantalla completa
                sigue en /reservas. Sin slug todavía no hay link que copiar. */}
            {practitioner.slug ? (
              <BookingChip url={`${origin}/reservar/${practitioner.slug}`} />
            ) : null}
            <ScheduleDialogs
              patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
            />
          </div>
        }
      />

      {patients.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="Tu agenda te espera"
            text="Cargá tu primer paciente con su día y horario, y la sesión aparece sola en tu semana."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        // ─── El orden, que en teléfono no es el mismo ─────────────────────
        //
        // Una columna flex en vez de un fragmento, para que abajo de `lg` cada
        // bloque pueda decir en qué lugar va. Arriba de `lg` todos vuelven a
        // `order-0` y mandan el orden del documento, que es el de escritorio y
        // no cambió.
        //
        // Por qué: en teléfono la Agenda medía 2187 px —2,7 pantallas— y la
        // primera sesión de la semana caía cerca de y 1400, después del título,
        // el link de reservas, el botón de agendar, el cartel de Google, los
        // recordatorios de mañana y las flechas. Abrís la Agenda para saber qué
        // viene; lo que viene tiene que estar arriba.
        //
        // Las reservas nuevas siguen siendo lo primero. Son la única cosa de
        // esta pantalla que espera una respuesta de tu parte hoy.
        <div className="flex flex-col">
          {/* Reservas sits at the top of the Agenda, as in v1
              (`legacy/index.html:1499`), and only when there is something to
              do about it. A family asking for a time is an interruption to the
              week you are looking at — that is why it belongs above the week
              and not behind a sidebar item you would have to remember to open.

              Answered here, too, and not behind a link. v1 put the two buttons
              on this card; a family waiting on a reply is what you deal with in
              the ten seconds you have between patients, and "go to another
              screen first" is how it becomes tomorrow's job. */}
          {pendingBookings.length > 0 ? (
            <Card className="mb-3.5 border-violet max-lg:order-1">
              <CardHeader>
                <CardTitle>Reservas nuevas</CardTitle>
                <p className="text-meta text-muted-foreground">
                  {pendingBookings.length === 1
                    ? '1 pendiente · confirmala para agregarla a tu agenda'
                    : `${pendingBookings.length} pendientes · confirmalas para agregarlas a tu agenda`}
                </p>
              </CardHeader>
              <CardContent>
                <PendingBookingRequests requests={pendingBookings} />
                <Link
                  href="/reservas"
                  className="mt-2 inline-block text-meta font-semibold text-violet hover:underline"
                >
                  Tu link para reservar y las ya resueltas →
                </Link>
              </CardContent>
            </Card>
          ) : null}
          {/* Acá vivía una línea suelta —"Tu link para que te reserven online
              →"— que existía porque el único camino a /reservas estaba adentro
              de la tarjeta de arriba, y esa tarjeta sólo aparece cuando ya
              tenés reservas: un círculo cerrado que dejaba la pantalla
              inalcanzable justo para quien recién empieza.

              El círculo lo abre ahora la tarjeta "Reservas online" del
              encabezado, que está siempre. Dejar las dos era decir lo mismo dos
              veces en la misma pantalla. */}

          {/* Sólo si todavía no conectó, y sólo si no lo cerró este mes. Ver
              `ConnectGoogle`. */}
          <div className="max-lg:order-4">
            {googleAccount || googleNoticeHidden ? null : (
              <ConnectGoogle cookieName={GOOGLE_NOTICE_COOKIE} />
            )}
          </div>

          {/* Los llamados de esta noche, no la semana en pantalla. Van después
              de la semana en teléfono porque son una tarea de la tarde, y la
              Agenda se abre todo el día. */}
          <div className="max-lg:order-3">
            <TomorrowReminders
              date={tomorrow}
              appointments={tomorrowAppointments}
              phoneOf={phoneOf}
            />
          </div>

          {/* La semana entera —flechas, aviso de semana vacía, grilla y plan—
              en un solo bloque, para que en teléfono suba junta. */}
          <div className="max-lg:order-2">
            {/* En teléfono la navegación va suelta arriba de las tarjetas del día,
                que es la vista que manda ahí. En escritorio entra adentro de la
                tarjeta del calendario — ver el `header` de `WeekCalendar`. */}
            <div className="mb-3.5 flex flex-wrap items-center justify-center gap-2.5 lg:hidden">
              {weekNavMobile}
            </div>

            {/* Google está conectado y no se pudo leer. Sin esta línea la semana
                se veía limpia y un turno con el dentista aparecía libre — ahí
                se agenda un paciente. Va adentro del bloque de la semana y
                arriba de la grilla, porque es la grilla la que puede estar
                mintiendo. "Volver a conectar" porque la causa de casi siempre
                es un permiso vencido, y eso no se arregla esperando. */}
            {googleUnavailable ? (
              <div
                role="status"
                className="mb-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-soft px-4 py-3 text-body text-[#8a5a12]"
              >
                <p className="min-w-[200px] flex-1">
                  <b>No pudimos leer tu Google Calendar.</b> Lo que tenés ahí puede no
                  estar en esta semana: miralo antes de agendar.
                </p>
                <a
                  href="/api/google/conectar"
                  className="shrink-0 font-bold underline underline-offset-2"
                >
                  Volver a conectar
                </a>
              </div>
            ) : null}

            {/* `calendarPrivacy` viaja hasta el menú de cada sesión, que es donde
                se arma el link a Google. Nace acá porque es lo único que conoce a
                la profesional; abajo son todos componentes de presentación.

                La grilla y el panel van en la misma fila: el panel se abre al
                costado sin empujar la semana fuera de la pantalla, que es todo el
                punto de que exista. Abajo de `lg` no hay panel — ahí manda
                `WeekGrid`, que es la vista de teléfono. */}
            {/* An empty week renders as three quarters of a metre of blank grid,
                which looks like the screen failed to load rather than like a week
                with nothing in it. Said in words, above the grid, with the same
                button that is at the top of the page — because this is exactly
                the moment somebody is looking for it. */}
            {appointments.length === 0 ? (
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-3.5">
                {/* Two different situations, and telling somebody to agendar when
                    they already did is the worse of the two mistakes. A rule
                    starts on the day it is written, so a Tuesday slot created on
                    a Wednesday has no occurrence until the following week — and
                    the first thing that used to happen after filling in the alta
                    was the Agenda saying nothing was booked. */}
                {schedules.length > 0 ? (
                  <p className="text-body text-muted-foreground">
                    <b className="text-foreground">En esta semana no cae ninguna sesión.</b>{' '}
                    Tenés horarios fijos cargados, pero ninguno toca estos días. Probá con la
                    semana que viene.
                  </p>
                ) : (
                  <p className="text-body text-muted-foreground">
                    <b className="text-foreground">Esta semana no tenés nada agendado.</b>{' '}
                    Agendá una sesión suelta o un horario fijo y aparece acá abajo.
                  </p>
                )}
                <ScheduleDialogs
                  patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
                />
              </div>
            ) : null}

            <div className="flex items-start gap-3.5">
              <div className="min-w-0 flex-1">
                <WeekCalendar
                  dates={dates}
                  appointments={appointments}
                  today={todayString()}
                  ageOf={ageOf}
                  calendarPrivacy={practitioner.calendar_privacy}
                  busyBlocks={busyBlocks}
                  selectedId={selected?.id}
                  hrefForSession={hrefForSession}
                  header={weekNavDesktop}
                  headerEnd={<WeekViewSelect value={weekView} />}
                  showWeekend={weekView === 'completa'}
                />
              </div>

              {selected ? (
                <div className="max-lg:hidden">
                  <SessionPanel
                    appointment={selected}
                    age={
                      selected.patients ? ageOf.get(selected.patients.id) : null
                    }
                    goal={goalOf.get(selected.id) ?? null}
                    calendarPrivacy={practitioner.calendar_privacy}
                    closeHref={weekHref}
                  />
                </div>
              ) : null}
            </div>
            <WeekGrid
              dates={dates}
              appointments={appointments}
              today={todayString()}
              calendarPrivacy={practitioner.calendar_privacy}
              busyBlocks={busyBlocks}
            />

            {/* Directly under the grid, as in v1 (`legacy/index.html:1499`). The
                grid answers "when am I busy"; this answers "what am I doing in
                each of these". */}
            <WeekPlan sessions={weekSessions} />
          </div>

          <Card className="mt-5 max-lg:order-5">
            <CardHeader>
              <CardTitle>Horarios fijos</CardTitle>
              <p className="text-meta text-muted-foreground">
                Las sesiones que se repiten solas cada semana.
              </p>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-body text-muted-foreground">
                  Todavía no hay ninguno. Con “Horario fijo” se agenda solo y no lo pensás
                  más.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {schedules.map((schedule) => (
                    <li
                      key={schedule.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-body font-bold">
                          {schedule.patients?.full_name ?? 'Paciente'}
                        </p>
                        <p className="text-meta text-muted-foreground">
                          {weekdayName(schedule.weekday)} a las{' '}
                          {formatTime(schedule.start_time)} ·{' '}
                          {frequencyLabel(schedule.frequency).toLowerCase()} ·{' '}
                          {schedule.duration_minutes} min
                        </p>
                      </div>
                      <form action={deactivateScheduleAction}>
                        <input type="hidden" name="scheduleId" value={schedule.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Dar de baja
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
