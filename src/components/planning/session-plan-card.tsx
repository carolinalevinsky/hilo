import Link from 'next/link'

import { clearPlanAction, removePlanItemAction } from '@/app/(app)/planificacion/actions'
import { CalendarDays, ClipboardList, Trash2 } from '@/components/icons'
import { PlanFields, type PlanTarget } from '@/components/planning/plan-fields'
import { PrintButton } from '@/components/print-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { firstName } from '@/lib/whatsapp'
import type { PlanItem } from '@/server/session-plans'

/**
 * Step 3: the plan that came out, and what to do with it.
 *
 * Everything on this screen exists to fill this card, so it is drawn as the one
 * thing that is not a panel — a violet head, the items numbered in the order
 * they will be worked, and the actions at the foot of it. It is the only part
 * that gets printed and handed over, which is why it carries `app-doc` and why
 * the head has print colours of its own: white on violet prints as white on
 * white, and a printed plan with no title on it is a list of activities for
 * nobody.
 */

/** What a row of the plan is. The badge says which, so the list reads as one. */
function kindOf(item: PlanItem) {
  if (item.goalId) {
    return {
      label: 'Objetivo',
      classes: 'bg-violet-soft text-violet',
      title: item.title ?? item.material?.title ?? 'Objetivo',
      detail: item.material ? `Con ${item.material.title}` : 'Sin material de la biblioteca',
    }
  }

  if (item.material) {
    return {
      label: 'Material',
      classes: 'bg-blue-soft text-blue',
      title: item.material.title,
      detail: [item.material.area, item.material.focus].filter(Boolean).join(' · '),
    }
  }

  return {
    label: 'Actividad tuya',
    classes: 'bg-amber-soft text-[#8a5a12]',
    title: item.title ?? 'Actividad',
    detail: '',
  }
}

export function SessionPlanCard({
  target,
  patientName,
  /** When the session is, already written out, or `null` if there is none yet. */
  when,
  items,
}: {
  target: PlanTarget
  patientName: string
  when: string | null
  items: PlanItem[]
}) {
  const name = firstName(patientName)

  return (
    // `h-fit`: the card is short and the column beside it is long, so a
    // stretched card left a third of a screen of empty white.
    <Card className="app-doc h-fit gap-0 py-0">
      <header className="bg-violet px-4 py-3.5 text-white print:bg-transparent print:text-foreground">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <p className="text-micro font-bold uppercase text-white/70 print:text-muted-foreground">
              Plan de la sesión
            </p>
            <h3 className="text-lead font-extrabold">{patientName}</h3>
          </div>

          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-micro font-bold print:bg-muted print:text-foreground">
            {items.length === 0
              ? 'Vacío'
              : items.length === 1
                ? '1 actividad'
                : `${items.length} actividades`}
          </span>
        </div>

        {/* When, right under the name. A plan without a date is a list you
            cannot place. */}
        <p className="mt-1.5 flex items-center gap-1.5 text-meta font-medium text-white/90 print:text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" />
          {when ?? 'Sin sesión agendada: queda para la próxima que agendes'}
        </p>
      </header>

      <CardContent className="py-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
            <ClipboardList className="mx-auto mb-2 size-6 text-muted-foreground/70" />
            <p className="text-meta text-muted-foreground">
              Todavía no agregaste nada. Sumá un objetivo, un material o una actividad tuya
              desde el paso 2.
            </p>
          </div>
        ) : (
          <>
            <ol className="space-y-2">
              {items.map((item, index) => {
                const kind = kindOf(item)

                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3 print:bg-transparent print:px-0"
                  >
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-teal-soft text-body font-extrabold text-[#12706a]">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'inline-block rounded px-1.5 py-0.5 text-micro font-bold uppercase',
                          kind.classes,
                        )}
                      >
                        {kind.label}
                      </span>
                      <p className="mt-1 text-item font-bold">{kind.title}</p>
                      {kind.detail ? (
                        <p className="text-meta text-muted-foreground">{kind.detail}</p>
                      ) : null}
                    </div>

                    <form action={removePlanItemAction} className="no-print shrink-0">
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button
                        type="submit"
                        size="icon-sm"
                        variant="ghost"
                        title="Quitar de esta sesión"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Quitar {kind.title}</span>
                      </Button>
                    </form>
                  </li>
                )
              })}
            </ol>

            <p className="no-print mt-2.5 rounded-xl border border-dashed border-border px-3 py-2 text-center text-micro text-muted-foreground">
              Seguí sumando desde el paso 2
            </p>
          </>
        )}
      </CardContent>

      {/* Only with a plan that exists. Offering to register a session that has
          nothing in it, or to print a blank page, is offering nothing. */}
      {items.length > 0 ? (
        <CardFooter className="no-print flex-col items-stretch gap-2.5">
          {/* "Guardar planificación" is the end of the task, not the moment the
              rows are written — those went in as you added them. Planning is
              something you finish, and a screen with no way to finish it leaves
              you looking for the button that says you are done.

              "Registrar ahora" stays beside it for the Tuesday when you are
              planning with the child already in the room. It carries the
              session, so the record is tied to it and uses this plan. */}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild>
              <Link href="/planificacion/proximas">Guardar planificación</Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href={
                  target.appointmentId
                    ? `/pacientes/${target.patientId}/sesiones/nueva?agenda=${target.appointmentId}`
                    : `/pacientes/${target.patientId}/sesiones/nueva?plan=1`
                }
              >
                Registrar ahora
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <PrintButton label="Imprimir" />
            <form action={clearPlanAction}>
              <PlanFields {...target} />
              <Button
                type="submit"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Vaciar plan
              </Button>
            </form>
          </div>

          <p className="text-micro text-muted-foreground">
            Se va guardando a medida que agregás, así que no hay nada que perder si cerrás.
            Lo vas a ver en la Agenda, en <b className="font-semibold">Planes preparados</b> y
            en la ficha de {name}.
          </p>
        </CardFooter>
      ) : null}
    </Card>
  )
}
