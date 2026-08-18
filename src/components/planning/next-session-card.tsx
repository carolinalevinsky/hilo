import { ClipboardList, Pencil, Plus } from '@/components/icons'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PlanItem } from '@/server/session-plans'

/**
 * "Próxima sesión" on the patient's ficha.
 *
 * v1's `proxSesionHTML` (`legacy/index.html:1674`), and the half of the planner
 * that makes it worth using: what you prepared on Sunday has to be visible on
 * Tuesday, on the screen you open with the child already in the room. A plan you
 * have to go and look for is a plan you re-make from memory.
 *
 * Both states are v1's. With nothing prepared it is an invitation with the
 * patient already chosen; with something prepared it is the list, in order, and
 * the two things you do about it.
 */
export function NextSessionCard({
  patientId,
  patientFirstName,
  items,
}: {
  patientId: string
  patientFirstName: string
  items: PlanItem[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próxima sesión</CardTitle>
        {items.length > 0 ? (
          <p className="text-[12.5px] text-muted-foreground">
            Dejaste preparada la próxima sesión con{' '}
            <b>{items.length === 1 ? '1 actividad' : `${items.length} actividades`}</b>.
            Cuando la tengas, registrala y pasa al historial.
          </p>
        ) : null}
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <>
            <p className="mb-3 text-[13px] text-muted-foreground">
              Hilo ordena los objetivos de {patientFirstName} por los que menos se movieron
              y te sugiere con qué trabajarlos.
            </p>
            <Button asChild size="sm">
              {/* The patient is already chosen: arriving at the planner and
                  having to pick them from a list is the friction v1 avoided. */}
              <Link href={`/planificacion?paciente=${patientId}`}>
                <Plus className="size-4" />
                Preparar la próxima sesión
              </Link>
            </Button>
          </>
        ) : (
          <>
            <ol className="space-y-2">
              {items.map((item, index) => (
                <li key={item.id} className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-[12px] font-extrabold text-[#12706a]">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold">
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
                </li>
              ))}
            </ol>

            <div className="mt-3.5 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/pacientes/${patientId}/sesiones/nueva?plan=1`}>
                  <ClipboardList className="size-4" />
                  Registrar esta sesión
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/planificacion?paciente=${patientId}`}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
