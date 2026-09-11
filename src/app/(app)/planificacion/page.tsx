import {
  BookOpen,
  ClipboardList,
  type LucideIcon,
  Plus,
  Sparkles,
  Target,
  User,
} from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import {
  addActivityToPlanAction,
  addGoalToPlanAction,
  addMaterialToPlanAction,
  clearPlanAction,
  removePlanItemAction,
} from '@/app/(app)/planificacion/actions'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { MaterialSearch } from '@/components/materials/material-search'
import { PlanSessionPicker } from '@/components/planning/plan-controls'
import { PlanningTabs } from '@/components/planning/planning-tabs'
import { PrintButton } from '@/components/print-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { formatLongDate, today, toDateInput, todayDate } from '@/lib/dates'
import { ageGroupLabel } from '@/lib/patient-labels'
import { formatTime } from '@/lib/week'
import {
  getAppointment,
  listAppointments,
  nextAppointmentFor,
  type NextAppointment,
} from '@/server/appointments'
import { averageProgress } from '@/server/goals'
import { listMaterials } from '@/server/materials'
import { getPhotoUrl, listPatients } from '@/server/patients'
import { listPlanItems, planSuggestions } from '@/server/session-plans'
import { currentSession } from '../session'

/** Sin "· Hilo": se imprime. Ver la nota en `informes/[id]/page.tsx`. */
export const metadata: Metadata = { title: 'Planificar sesión' }

/**
 * "Planificar sesión" — v1's, restored, and since P14 tied to the agenda.
 *
 * The rewrite replaced this with a read-only list of the coming week. That list
 * was not wrong, it was a different screen: it told you what was ahead and gave
 * you nothing to do about it, and the part it dropped is the part that takes the
 * time. What lives here is v1's three panels — the goals that have moved least
 * with a one-click "Agregar", the library search, and the session you are
 * assembling, which persists until you register it.
 *
 * What P14 changed (Thomas's QA: "costó mucho entender qué hace"): you prepare a
 * **session**, not a patient. The screen opens on the soonest one and says when
 * it is; what you assemble is what "Plan de la semana" shows for that session in
 * the Agenda, and what registering it starts from.
 */

/** How far ahead the session picker looks: a month of planning. */
const PICKER_DAYS = 28

function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

function whenLabel(session: { scheduled_on: string; start_time: string }) {
  return `${formatLongDate(session.scheduled_on)} · ${formatTime(session.start_time)}`
}

export default async function PlanningPage({ searchParams }: PageProps<'/planificacion'>) {
  const params = await searchParams
  const { user, practitioner } = await currentSession()
  const patients = await listPatients(user.id)

  const [firstPatient] = patients
  if (!firstPatient) {
    return (
      <>
        <PlanningHeader />
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Planificá tu primera sesión"
            text="Cargá un paciente y sus objetivos, y Hilo prioriza los que menos se movieron y te deja la próxima sesión casi armada."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      </>
    )
  }

  // Only the active list: an archived patient's sessions were cleared when they
  // were archived, and a deleted one is not in `patients` at all.
  const known = new Set(patients.map((row) => row.id))
  const until = todayDate()
  until.setDate(until.getDate() + PICKER_DAYS)
  const upcoming = (await listAppointments(user.id, today(), toDateInput(until))).filter(
    (row) => row.status === 'scheduled' && known.has(row.patient_id),
  )

  // What is being prepared. In order: the session in the URL ("Preparar" in the
  // Agenda), the patient in the URL (the ficha, a material — at their next
  // session), and otherwise the soonest session on the agenda. It used to open
  // on whoever came first alphabetically, which is how the QA landed on a child
  // with no goals and nothing scheduled and could not tell what the screen was
  // for. An id that does not resolve falls through rather than 404s: this is a
  // working screen, not a permalink.
  const askedSession = readParam(params.sesion)
  const askedPatient = readParam(params.paciente)

  let session: NextAppointment | null = null
  let patientId: string | undefined

  if (askedSession) {
    const row =
      upcoming.find((candidate) => candidate.id === askedSession) ??
      (await getAppointment(user.id, askedSession))
    if (row && known.has(row.patient_id)) {
      session = { id: row.id, scheduled_on: row.scheduled_on, start_time: row.start_time }
      patientId = row.patient_id
    }
  }
  if (!patientId && askedPatient && known.has(askedPatient)) patientId = askedPatient
  if (!patientId && upcoming[0]) {
    const [soonest] = upcoming
    session = { id: soonest.id, scheduled_on: soonest.scheduled_on, start_time: soonest.start_time }
    patientId = soonest.patient_id
  }

  const patient = patients.find((row) => row.id === patientId) ?? firstPatient
  if (!session) session = await nextAppointmentFor(user.id, patient.id)

  const appointmentId = session?.id ?? null
  const search = readParam(params.q)?.trim() ?? ''

  const [suggestions, items, results, photoUrl] = await Promise.all([
    planSuggestions(user.id, patient.id, practitioner.discipline, appointmentId),
    listPlanItems(user.id, patient.id, appointmentId),
    search
      ? listMaterials(user.id, { discipline: practitioner.discipline, search })
      : Promise.resolve([]),
    getPhotoUrl(patient.photo_path),
  ])

  const sessionOptions = upcoming.map((row) => ({
    id: row.id,
    label: `${whenLabel(row)} — ${row.patients?.full_name ?? 'Paciente'}`,
  }))
  // A session from beyond the picker's four weeks, opened from the Agenda or as
  // the patient's next: listed too, so the select can show what is on screen.
  if (session && !sessionOptions.some((option) => option.id === session.id)) {
    sessionOptions.unshift({ id: session.id, label: `${whenLabel(session)} — ${patient.full_name}` })
  }
  const unscheduled = patients
    .filter((row) => !upcoming.some((appointment) => appointment.patient_id === row.id))
    .map((row) => ({ id: row.id, label: row.full_name }))

  const inPlan = new Set(items.map((item) => item.material?.id).filter(Boolean))
  const firstName = patient.full_name.split(' ')[0]
  const age = ageLabel(patient.date_of_birth)
  const average = averageProgress(suggestions.map((goal) => ({ progress: goal.progress })))

  return (
    <>
      <PlanningHeader />

      {/* Which session this is. v1 put the patient above both columns so the
          answer to "whose session is this?" is never off-screen; now it also
          answers "which one". */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="plan-session"
              className="mb-1 block text-meta font-bold text-muted-foreground"
            >
              Qué sesión estás preparando
            </label>
            <PlanSessionPicker
              sessions={sessionOptions}
              unscheduled={unscheduled}
              selected={session ? `s:${session.id}` : `p:${patient.id}`}
            />
          </div>
          <PatientAvatar
            fullName={patient.full_name}
            color={patient.color}
            size={40}
            photoUrl={photoUrl}
          />

          <p className="w-full text-meta text-muted-foreground">
            {[age, ageGroupLabel(patient.age_group), `avance general ${average}%`]
              .filter(Boolean)
              .join(' · ')}
            . Armá acá lo que vas a hacer en esa sesión: queda guardado, lo ves en la Agenda
            y en la ficha, y cuando la registres arrancás de ahí.
          </p>
        </CardContent>
      </Card>

      {/* `items-start`: see the same note in `estadisticas/page.tsx`. The session
          card is short and the suggestions beside it are long, so the stretched
          column left a third of a screen of empty card.

          Below `lg` the two columns stack and the order flips — see the note on
          the plan card itself. */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardContent>
              <PanelTitle icon={Sparkles}>Sugerencias de Hilo</PanelTitle>

              {suggestions.length === 0 ? (
                <p className="text-body text-muted-foreground">
                  {firstName} todavía no tiene objetivos activos.{' '}
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="font-semibold text-violet underline"
                  >
                    Cargá el primero
                  </Link>{' '}
                  y Hilo arma las sugerencias.
                </p>
              ) : (
                <>
                  <p className="mb-2.5 text-meta text-muted-foreground">
                    Según los objetivos de {firstName}, Hilo prioriza los que menos se
                    movieron:
                  </p>

                  <ul className="space-y-2">
                    {suggestions.map((goal) => {
                      const [best, ...others] = goal.materials

                      return (
                        <li
                          key={goal.goalId}
                          className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-2.5"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-violet-soft text-violet">
                            <Target className="size-[18px]" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-body font-bold">
                                {goal.title}{' '}
                                <span className="font-normal text-muted-foreground">
                                  ({goal.progress}%)
                                </span>
                              </p>

                              {/* One button per goal, and it adds exactly what the
                                  line under it says. There used to be an
                                  "Agregar" here and a "Con este" on each of three
                                  materials — sixteen buttons for four goals, two
                                  of them doing nearly the same thing. */}
                              <form action={addGoalToPlanAction} className="shrink-0">
                                <PlanFields patientId={patient.id} appointmentId={appointmentId} />
                                <input type="hidden" name="goalId" value={goal.goalId} />
                                {best ? (
                                  <input type="hidden" name="materialId" value={best.id} />
                                ) : null}
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant={goal.added ? 'outline' : 'default'}
                                  disabled={goal.added}
                                >
                                  {goal.added ? 'Agregado' : 'Agregar'}
                                </Button>
                              </form>
                            </div>

                            <p className="mt-0.5 text-meta text-muted-foreground">
                              {goal.activity}
                              {best ? (
                                <>
                                  {' · con '}
                                  <Link
                                    href={`/materiales/${best.id}`}
                                    className="font-semibold text-foreground hover:underline"
                                  >
                                    {best.title}
                                  </Link>
                                </>
                              ) : null}
                            </p>

                            {/* The other two stay a click away: a choice, not a
                                wall. Each opens — the title is a link — so you can
                                read what it is before deciding. */}
                            {others.length > 0 && !goal.added ? (
                              <details className="mt-1.5">
                                <summary className="cursor-pointer text-micro font-semibold text-violet">
                                  Otros materiales para este objetivo ({others.length})
                                </summary>
                                <ul className="mt-1.5 space-y-1">
                                  {others.map((material) => (
                                    <li
                                      key={material.id}
                                      className="flex items-center gap-2 rounded-lg bg-card px-2 py-1.5"
                                    >
                                      <Link
                                        href={`/materiales/${material.id}`}
                                        className="min-w-0 flex-1 hover:underline"
                                      >
                                        <span className="block truncate text-meta font-bold">
                                          {material.title}
                                        </span>
                                        <span className="block truncate text-micro text-muted-foreground">
                                          {[material.area, material.focus]
                                            .filter(Boolean)
                                            .join(' · ')}
                                        </span>
                                      </Link>

                                      <form action={addGoalToPlanAction} className="shrink-0">
                                        <PlanFields
                                          patientId={patient.id}
                                          appointmentId={appointmentId}
                                        />
                                        <input type="hidden" name="goalId" value={goal.goalId} />
                                        <input
                                          type="hidden"
                                          name="materialId"
                                          value={material.id}
                                        />
                                        <Button
                                          type="submit"
                                          size="sm"
                                          variant="outline"
                                          disabled={inPlan.has(material.id)}
                                        >
                                          Agregar con este
                                        </Button>
                                      </form>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            ) : null}

                            {goal.materials.length === 0 ? (
                              <p className="mt-1.5 text-micro text-muted-foreground">
                                No encontré materiales para este objetivo. Buscá abajo o
                                agregá una actividad tuya.
                              </p>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <PanelTitle icon={BookOpen} hint="de la biblioteca">
                Buscar material
              </PanelTitle>

              {/* On a phone the two side by side leave the box too narrow to
                  read what you typed, so the link drops underneath. */}
              <div className="flex flex-wrap gap-2">
                <div className="min-w-[180px] flex-1">
                  <MaterialSearch initial={search} />
                </div>
                <Button asChild variant="outline" className="max-sm:w-full">
                  <Link href="/materiales">Ir a la biblioteca</Link>
                </Button>
              </div>

              <div className="mt-3">
                {!search ? (
                  <p className="text-meta text-muted-foreground">
                    Escribí para buscar en la biblioteca, por área, objetivo o título.
                  </p>
                ) : results.length === 0 ? (
                  <p className="text-meta text-muted-foreground">
                    Sin resultados. Probá otra palabra, o generá uno con IA desde
                    Materiales.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {/* Ten, as in v1: this is a picker inside a column, not the
                        library — the library is one click away. */}
                    {results.slice(0, 10).map((material) => (
                      <li
                        key={material.id}
                        className="flex items-center gap-2.5 rounded-xl border border-border p-2.5"
                      >
                        <span className="shrink-0 rounded-full bg-violet-soft px-2 py-0.5 text-micro font-bold text-violet">
                          {material.area}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body font-bold">{material.title}</p>
                          <p className="truncate text-micro text-muted-foreground">
                            {[material.focus, material.age_range].filter(Boolean).join(' · ')}
                          </p>
                        </div>

                        <form action={addMaterialToPlanAction}>
                          <PlanFields patientId={patient.id} appointmentId={appointmentId} />
                          <input type="hidden" name="materialId" value={material.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant={inPlan.has(material.id) ? 'outline' : 'default'}
                            disabled={inPlan.has(material.id)}
                          >
                            {inPlan.has(material.id) ? 'Agregado' : 'Agregar'}
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* `max-lg:order-first`: on a phone this used to be last, and last is
            below the fold — measured at 375 px it started at y 919 on an 816 px
            screen. You pressed "Agregar", nothing on the screen moved, and the
            item you had just added was 12 % of a screen past the bottom edge.
            That is where "¿dónde quedan guardadas? falta botón de guardar" comes
            from: they were saved, and invisible.

            You are assembling a list. The list goes where you can see it, and
            the things you add to it go underneath. */}
        <Card className="hilo-doc h-fit max-lg:order-first">
          <CardContent>
            <PanelTitle icon={ClipboardList} hint={String(items.length)}>
              Sesión de {firstName}
            </PanelTitle>

            {/* When, right under the name. "Próxima sesión de Tomás" never said,
                and a plan without a date is a list you cannot place. */}
            <p className="-mt-1.5 mb-3 text-meta font-semibold">
              {session
                ? whenLabel(session)
                : 'Sin sesión agendada todavía: lo que prepares queda para la próxima que agendes.'}
            </p>

            {items.length === 0 ? (
              <p className="text-meta text-muted-foreground">
                Todavía no agregaste nada. Sumá desde las sugerencias, buscá un material, o
                escribí abajo una actividad tuya.
              </p>
            ) : (
              <ol className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-xl bg-muted/60 p-2.5"
                  >
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-teal-soft text-body font-extrabold text-[#12706a]">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-item font-bold">
                        {item.title ?? item.material?.title ?? 'Actividad'}
                      </p>
                      <p className="text-meta text-muted-foreground">
                        {item.title && item.material
                          ? `Material: ${item.material.title}`
                          : item.material
                            ? [item.material.area, item.material.focus]
                                .filter(Boolean)
                                .join(' · ')
                            : 'Actividad'}
                      </p>
                    </div>

                    <form action={removePlanItemAction} className="no-print">
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Quitar
                      </Button>
                    </form>
                  </li>
                ))}
              </ol>
            )}

            {/* Anything, in your own words. Not everything that goes into a
                session is a goal or a library material, and until this existed
                the planner could only assemble the parts Hilo already knew
                about. */}
            <form
              action={addActivityToPlanAction}
              className="no-print mt-3 flex flex-wrap gap-2"
            >
              <PlanFields patientId={patient.id} appointmentId={appointmentId} />
              <input
                name="activity"
                required
                maxLength={200}
                placeholder="Ej: juego de la oca con sílabas"
                aria-label="Agregar una actividad tuya"
                className="h-9 min-w-[180px] flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" size="sm" variant="outline">
                <Plus className="size-4" />
                Sumar
              </Button>
            </form>

            {/* "Registrar esta sesión" and "Imprimir" used to be here with an
                empty plan too, which offers to register a session that has
                nothing in it and to print a blank page. Both belong to a plan
                that exists. */}
            {/* "Guardar planificación" is the end of the task, not the moment
                the rows are written — those went in as you added them. Planning
                is something you finish, and a screen with no way to finish it
                leaves you looking for the button that says you are done. So the
                button exists and it is honest about what it does: it closes the
                plan and takes you to the list of what you have ready.

                "Registrar ahora" stays beside it for the Tuesday when you are
                planning with the child already in the room. It carries the
                session, so the record is tied to it and uses this plan. */}
            <div className="no-print mt-3.5 flex flex-wrap gap-2">
              {items.length > 0 ? (
                <>
                  <Button asChild>
                    <Link href="/planificacion/proximas">Guardar planificación</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link
                      href={
                        session
                          ? `/pacientes/${patient.id}/sesiones/nueva?agenda=${session.id}`
                          : `/pacientes/${patient.id}/sesiones/nueva?plan=1`
                      }
                    >
                      Registrar ahora
                    </Link>
                  </Button>
                  <PrintButton label="Imprimir" size="default" />
                  <form action={clearPlanAction}>
                    <PlanFields patientId={patient.id} appointmentId={appointmentId} />
                    <Button type="submit" variant="ghost">
                      Vaciar
                    </Button>
                  </form>
                </>
              ) : (
                <Button asChild variant="outline">
                  <Link href={`/pacientes/${patient.id}`}>
                    <User className="size-[15px]" />
                    Ver ficha de {firstName}
                  </Link>
                </Button>
              )}
            </div>

            {items.length > 0 ? (
              <p className="no-print mt-2.5 text-meta text-muted-foreground">
                Se va guardando a medida que agregás, así que no hay nada que perder si
                cerrás. Lo vas a ver en la Agenda, en <b>Planes preparados</b> y en la
                ficha de {firstName}, y cuando registres la sesión arrancás de acá.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

/**
 * Who and which session every write on this screen is for. The session travels
 * empty for a patient with nothing scheduled; the server reads that as "their
 * next one, whenever it is".
 */
function PlanFields({
  patientId,
  appointmentId,
}: {
  patientId: string
  appointmentId: string | null
}) {
  return (
    <>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="appointmentId" value={appointmentId ?? ''} />
    </>
  )
}

function PlanningHeader() {
  return (
    <>
      {/* Same title and subtitle as /materiales: to a practitioner these are one
          screen with two tabs, as they were in v1. */}
      <PageHeader
        title="Planificación"
        subtitle="Tu biblioteca de materiales y la planificación de cada paciente, en un solo lugar."
      />
      <PlanningTabs />
    </>
  )
}

function PanelTitle({
  icon: Icon,
  hint,
  children,
}: {
  icon: LucideIcon
  hint?: string
  children: React.ReactNode
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-item font-extrabold">
      <Icon className="size-[18px] text-violet" />
      {children}
      {hint ? <span className="font-normal text-muted-foreground">{hint}</span> : null}
    </h2>
  )
}
