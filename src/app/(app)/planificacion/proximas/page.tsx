import { ClipboardList, Pencil } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { PlanningTabs } from '@/components/planning/planning-tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { upcomingPlans } from '@/server/session-plans'
import { currentUser } from '../../session'

export const metadata: Metadata = { title: 'Planes preparados · Hilo' }

/**
 * Everything left prepared, in one place.
 *
 * A plan used to be reachable only from the planner with that patient already
 * selected, or from that patient's own ficha. Both require knowing which patient
 * you are looking for, which is the one thing you do not know when the question
 * is "what did I leave ready?". Planning happens on Sunday for the whole week;
 * this is the list that survives until Tuesday.
 *
 * Registering starts here rather than only on the ficha, because arriving at a
 * prepared session and having to go one screen further to write it up is the
 * step people skip.
 */
export default async function UpcomingPlansPage() {
  const user = await currentUser()
  const plans = await upcomingPlans(user.id)

  return (
    <>
      <PageHeader
        title="Planificación"
        subtitle="Tu biblioteca de materiales y la planificación de cada paciente, en un solo lugar."
      />
      <PlanningTabs />

      {plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No tenés ningún plan preparado"
            text="Cuando dejes una lista en “Planificar sesión”, aparece acá hasta que registres esa sesión."
            action={
              <Button asChild>
                <Link href="/planificacion">Preparar un plan</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {plans.map((plan) => (
            <li key={plan.patientId}>
              <Card>
                <CardContent>
                  <div className="flex items-center gap-2.5">
                    <PatientAvatar
                      fullName={plan.fullName}
                      color={plan.color}
                      size={38}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-item font-bold">{plan.fullName}</p>
                      <p className="text-meta text-muted-foreground">
                        {plan.items.length === 1
                          ? '1 actividad preparada'
                          : `${plan.items.length} actividades preparadas`}
                      </p>
                    </div>
                  </div>

                  {/* The whole list, not a count. The point of the screen is to
                      recognise the session you planned without opening it. */}
                  <ol className="mt-3 space-y-1.5">
                    {plan.items.map((title, index) => (
                      <li
                        key={`${plan.patientId}-${index}`}
                        className="flex items-center gap-2.5"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-teal-soft text-micro font-extrabold text-[#12706a]">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-body">{title}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link
                        href={`/pacientes/${plan.patientId}/sesiones/nueva?plan=1`}
                      >
                        <ClipboardList className="size-4" />
                        Registrar esta sesión
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/planificacion?paciente=${plan.patientId}`}>
                        <Pencil className="size-4" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
