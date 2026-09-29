import Link from 'next/link'

import {
  clearPlanAction,
  removePlanItemAction,
  savePlanNoteAction,
  setPlanItemDurationAction,
} from '@/app/(app)/planificacion/actions'
import { CalendarDays, ClipboardList, Clock, FileText, Trash2 } from '@/components/icons'
import { DurationSelect } from '@/components/planning/duration-select'
import { PlanFields, type PlanTarget } from '@/components/planning/plan-fields'
import { PrintButton } from '@/components/print-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { totalDuration } from '@/lib/plan-durations'
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
  note,
  sessionMinutes,
  items,
}: {
  target: PlanTarget
  patientName: string
  when: string | null
  /** La nota previa de la sesión: `appointments.note`, la misma de la Agenda. */
  note: string | null
  /** Lo que dura la sesión agendada, o `null` si no hay ninguna. */
  sessionMinutes: number | null
  items: PlanItem[]
}) {
  const planned = totalDuration(items)
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

        {/* Lo preparado contra lo que dura la sesión.
            Sólo con algo adentro: "0 / 45 min" arriba de un plan vacío es un
            reproche antes de empezar. Pasado el largo de la sesión se marca,
            que es la única razón por la que el número está acá — no para
            cuadrar exacto, sino para avisar cuando no entra. */}
        {sessionMinutes && items.length > 0 ? (
          <p
            className={cn(
              'mt-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-bold w-fit print:bg-transparent print:px-0 print:text-muted-foreground',
              planned > sessionMinutes ? 'bg-amber text-[#3d2a00]' : 'bg-white/20',
            )}
          >
            <Clock className="size-3.5 shrink-0" />
            {planned} / {sessionMinutes} min
            {planned > sessionMinutes ? ' · te pasás' : null}
          </p>
        ) : null}
      </header>

      {note ? (
        <div className="hidden px-4 pt-3 print:block">
          <p className="text-micro font-bold uppercase">Nota previa</p>
          <p className="mt-0.5 text-meta leading-relaxed whitespace-pre-wrap">{note}</p>
        </div>
      ) : null}

      <CardContent className="py-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <ClipboardList className="mx-auto mb-2.5 size-6 text-muted-foreground/70" />
            <p className="text-item font-bold">Tu plan está listo para armarse</p>
            <p className="mx-auto mt-1 max-w-xs text-meta leading-relaxed text-muted-foreground">
              Sumá un objetivo, un material o una actividad tuya desde el paso 2 y van
              cayendo acá, en orden.
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

                      {/* El largo se elige acá y no donde se agregó: se decide
                          mirando el total, que está arriba de esta lista. */}
                      <form action={setPlanItemDurationAction} className="no-print mt-1.5">
                        <input type="hidden" name="itemId" value={item.id} />
                        <DurationSelect
                          defaultValue={item.durationMinutes}
                          submitOnChange
                          className="h-7 rounded-lg bg-card pr-7 pl-2.5 text-meta"
                        />
                      </form>
                      <p className="hidden text-meta text-muted-foreground print:block">
                        {item.durationMinutes} min
                      </p>
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

      {/* La nota previa, entre el plan y los botones.
          Vive en la cita, no en el plan: es la misma que se escribe al agendar
          (`setAppointmentNote`), así que lo que se anota acá aparece allá y al
          revés. Sin sesión agendada no hay dónde guardarla y no se ofrece.

          Un `<details>` y no un botón con estado: abrir un renglón para
          escribir no necesita JavaScript, y así la nota se ve escrita sin
          abrir nada. */}
      {target.appointmentId ? (
        <CardContent className="no-print pb-4">
          <details open={Boolean(note)} className="group/note rounded-xl bg-muted/60 p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-meta font-bold">
                <FileText className="size-4 text-muted-foreground" />
                Nota previa para la sesión
              </span>
              <span className="text-meta font-semibold text-violet group-open/note:hidden">
                + Añadir
              </span>
            </summary>

            <form action={savePlanNoteAction} className="mt-2.5">
              <PlanFields {...target} />
              <textarea
                name="note"
                rows={3}
                maxLength={2000}
                defaultValue={note ?? ''}
                placeholder="Lo que quieras tener presente al empezar: cómo venía de la vez pasada, qué traer, qué avisarle a la familia."
                aria-label="Nota previa para la sesión"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-body leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" size="sm" variant="secondary" className="mt-2">
                Guardar nota
              </Button>
            </form>
          </details>
        </CardContent>
      ) : null}

      {/* Only with a plan that exists. Offering to register a session that has
          nothing in it, or to print a blank page, is offering nothing. */}
      {items.length > 0 ? (
        <CardFooter className="no-print flex-col items-stretch gap-2.5">
          {/* "Guardar planificación" is the end of the task, not the moment the
              rows are written — those went in as you added them. Planning is
              something you finish, and a screen with no way to finish it leaves
              you looking for the button that says you are done.

              Uno solo. Al lado hubo un segundo botón que llevaba al registro de
              la sesión, y no se entendía: mientras planificás el miércoles,
              "registrar" es una acción de otro día. Lo que hace falta —empezar
              la sesión con este plan, cuando el chico ya está en la sala— está
              del otro lado del guardado, que es donde alguien lo busca: el
              `?guardado=` le dice a "Planes preparados" cuál acaba de guardar y
              ahí se ofrece arrancarla. */}
          <Button asChild className="w-full">
            <Link
              href={`/planificacion/proximas?guardado=${target.appointmentId ?? `p:${target.patientId}`}`}
            >
              Guardar planificación
            </Link>
          </Button>

          <div className="flex items-center justify-between gap-2">
            <PrintButton label="Imprimir" />
            <form action={clearPlanAction}>
              <PlanFields {...target} />
              <Button
                type="submit"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Descartar borrador
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
