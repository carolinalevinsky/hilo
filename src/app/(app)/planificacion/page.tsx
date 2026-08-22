import {
  BookOpen,
  ClipboardList,
  type LucideIcon,
  Sparkles,
  Target,
  User,
} from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import {
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

export const metadata: Metadata = { title: 'Planificar sesión · Hilo' }

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
              className="mb-1 block text-[12px] font-bold text-muted-foreground"
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

          <p className="w-full text-[12.5px] text-muted-foreground">
            {[age, ageGroupLabel(patient.age_group), `avance general ${average}%`]
              .filter(Boolean)
              .join(' · ')}
            . La planificación es lo que más tiempo lleva; Hilo te la deja casi armada.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardContent>
              <PanelTitle icon={Sparkles}>Sugerencias de Hilo</PanelTitle>

              {suggestions.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
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
                  <p className="mb-2.5 text-[12.5px] text-muted-foreground">
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
                          <p className="text-[13.5px] font-bold">
                            {goal.title}{' '}
                            <span className="font-normal text-muted-foreground">
                              ({goal.progress}%)
                            </span>
                          </p>
                          <p className="text-[12px] text-muted-foreground">
                            {goal.activity}
                            {goal.material ? (
                              <>
                                {' · material: '}
                                <Link
                                  href={`/materiales/${goal.material.id}`}
                                  className="font-bold hover:underline"
                                >
                                  {goal.material.title}
                                </Link>
                              </>
                            ) : null}
                          </p>
                        </div>

                        <form action={addGoalToPlanAction}>
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
                  <p className="text-[12.5px] text-muted-foreground">
                    Escribí para buscar en la biblioteca, por área, objetivo o título.
                  </p>
                ) : results.length === 0 ? (
                  <p className="text-[12.5px] text-muted-foreground">
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
                        <span className="shrink-0 rounded-full bg-violet-soft px-2 py-0.5 text-[10.5px] font-bold text-violet">
                          {material.area}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-bold">{material.title}</p>
                          <p className="truncate text-[11.5px] text-muted-foreground">
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

        <Card className="hilo-doc h-fit">
          <CardContent>
            <PanelTitle icon={ClipboardList} hint={String(items.length)}>
              Próxima sesión de {firstName}
            </PanelTitle>

            {items.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">
                Todavía no agregaste nada. Sumá desde las sugerencias, o buscá un material.
              </p>
            ) : (
              <ol className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-xl bg-muted/60 p-2.5"
                  >
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-teal-soft text-[13px] font-extrabold text-[#12706a]">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold">
                        {item.title ?? item.material?.title ?? 'Actividad'}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
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

            <div className="no-print mt-3.5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/pacientes/${patient.id}/sesiones/nueva?plan=1`}>
                  Registrar esta sesión
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/pacientes/${patient.id}`}>
                  <User className="size-[15px]" />
                  Ver ficha de {firstName}
                </Link>
              </Button>
              {items.length > 0 ? (
                <>
                  <PrintButton label="Imprimir" size="default" />
                  <form action={clearPlanAction}>
                    <input type="hidden" name="patientId" value={patient.id} />
                    <Button type="submit" variant="ghost">
                      Vaciar
                    </Button>
                  </form>
                </>
              ) : null}
            </div>

            <p className="no-print mt-2.5 text-[12px] text-muted-foreground">
              Esto queda guardado como la <b>próxima sesión</b> de {firstName}. Cuando la
              tengas, la registrás y pasa al historial. El avance de cada objetivo lo ajustás
              vos.
            </p>
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
    <h2 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold">
      <Icon className="size-[18px] text-violet" />
      {children}
      {hint ? <span className="font-normal text-muted-foreground">{hint}</span> : null}
    </h2>
  )
}
