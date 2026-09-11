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
import { PlanPatientPicker } from '@/components/planning/plan-controls'
import { PlanningTabs } from '@/components/planning/planning-tabs'
import { PrintButton } from '@/components/print-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { ageGroupLabel } from '@/lib/patient-labels'
import { averageProgress } from '@/server/goals'
import { listMaterials } from '@/server/materials'
import { getPhotoUrl, listPatients } from '@/server/patients'
import { listPlanItems, planSuggestions } from '@/server/session-plans'
import { currentSession } from '../session'

/** Sin "· Hilo": se imprime. Ver la nota en `informes/[id]/page.tsx`. */
export const metadata: Metadata = { title: 'Planificar sesión' }

/**
 * "Planificar sesión" — v1's, restored.
 *
 * The rewrite replaced this with a read-only list of the coming week. That list
 * was not wrong, it was a different screen: it told you what was ahead and gave
 * you nothing to do about it, and the part it dropped is the part that takes the
 * time. What lives here now is v1's three panels — the goals that have moved
 * least with a one-click "Agregar", the library search, and the session you are
 * assembling, which persists until you register it.
 *
 * The weekly list is not lost: `todayBriefing` on Inicio is built from the same
 * `planUpcoming`, and it is where a practitioner actually looked at it.
 */

function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
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

  // A patient id that is not in the list (stale link, archived since) falls back
  // to the first rather than 404s: this is a working screen, not a permalink.
  const asked = readParam(params.paciente)
  const patient = patients.find((row) => row.id === asked) ?? firstPatient
  const search = readParam(params.q)?.trim() ?? ''

  const [suggestions, items, results, photoUrl] = await Promise.all([
    planSuggestions(user.id, patient.id, practitioner.discipline),
    listPlanItems(user.id, patient.id),
    search
      ? listMaterials(user.id, { discipline: practitioner.discipline, search })
      : Promise.resolve([]),
    getPhotoUrl(patient.photo_path),
  ])

  const inPlan = new Set(items.map((item) => item.material?.id).filter(Boolean))
  const firstName = patient.full_name.split(' ')[0]
  const age = ageLabel(patient.date_of_birth)
  const average = averageProgress(suggestions.map((goal) => ({ progress: goal.progress })))

  return (
    <>
      <PlanningHeader />

      {/* Who you are planning for. v1 put this above both columns so the answer
          to "whose session is this?" is never off-screen. */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="plan-patient"
              className="mb-1 block text-meta font-bold text-muted-foreground"
            >
              Paciente
            </label>
            <PlanPatientPicker
              patients={patients.map((row) => ({ id: row.id, fullName: row.full_name }))}
              selectedId={patient.id}
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
            . La planificación es lo que más tiempo lleva; Hilo te la deja casi armada.
          </p>
        </CardContent>
      </Card>

      {/* `items-start`: see the same note in `estadisticas/page.tsx`. "Próxima
          sesión" is short and the suggestions beside it are long, so the
          stretched column left a third of a screen of empty card.

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
                    {suggestions.map((goal) => (
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

                            {/* Adding the goal on its own, with whatever Hilo
                                matched. The three below add it with the one you
                                picked instead. */}
                            <form action={addGoalToPlanAction} className="shrink-0">
                              <input type="hidden" name="patientId" value={patient.id} />
                              <input type="hidden" name="goalId" value={goal.goalId} />
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
                          </p>

                          {/* Three, not one. The material used to be a single
                              guess printed at the end of the activity line, so
                              the only two moves were to accept it or to go and
                              search the library yourself. Each one opens — the
                              title is a link — so you can read what it actually
                              is before deciding. */}
                          {goal.materials.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                              {goal.materials.map((material) => (
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
                                    <input
                                      type="hidden"
                                      name="patientId"
                                      value={patient.id}
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
                                      disabled={goal.added || inPlan.has(material.id)}
                                    >
                                      Con este
                                    </Button>
                                  </form>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1.5 text-micro text-muted-foreground">
                              No encontré materiales para este objetivo. Buscá abajo o
                              agregá una actividad tuya.
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
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
                          <input type="hidden" name="patientId" value={patient.id} />
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
              Próxima sesión de {firstName}
            </PanelTitle>

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
              <input type="hidden" name="patientId" value={patient.id} />
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

                "Registrar esta sesión" stays beside it for the Tuesday when you
                are planning with the child already in the room. */}
            <div className="no-print mt-3.5 flex flex-wrap gap-2">
              {items.length > 0 ? (
                <>
                  <Button asChild>
                    <Link href="/planificacion/proximas">Guardar planificación</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/pacientes/${patient.id}/sesiones/nueva?plan=1`}>
                      Registrar ahora
                    </Link>
                  </Button>
                  <PrintButton label="Imprimir" size="default" />
                  <form action={clearPlanAction}>
                    <input type="hidden" name="patientId" value={patient.id} />
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
                cerrás. Lo vas a encontrar en <b>Planes preparados</b> y en la ficha de{' '}
                {firstName}, y desde ahí registrás la sesión cuando la tengas.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
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
