'use client'

import { useActionState, useState } from 'react'

import { rescheduleAppointmentAction } from '@/app/(app)/agenda/actions'
import { FormMessage } from '@/components/auth/form-message'
import { DurationField, Field, TimeField } from '@/components/agenda/schedule-dialogs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * "Cambiar día u hora" de una sesión agendada. La regla está en
 * `src/server/reschedule.ts`; esto es el formulario.
 *
 * Una sesión de un horario fijo pregunta si es sólo esta vez o de acá en
 * adelante, con las mismas palabras que "Quitar de la agenda", así las dos
 * preguntas se leen como la misma.
 *
 * Controlado desde afuera (`open`) porque se abre desde un ítem del menú de
 * la sesión, y el menú se cierra al elegirlo: un diálogo adentro del menú se
 * desmontaría con él.
 */
export function RescheduleDialog({
  open,
  onOpenChange,
  appointment,
  patientName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    id: string
    scheduled_on: string
    start_time: string
    duration_minutes: number
    schedule_id: string | null
  }
  patientName: string
}) {
  const [state, formAction, pending] = useActionState(
    rescheduleAppointmentAction,
    EMPTY_FORM_STATE,
  )

  // Se cierra solo cuando el servidor dijo que sí. Se ajusta durante el render,
  // que es como React pide reaccionar a un cambio de estado de la acción.
  const [seen, setSeen] = useState(state)
  if (state !== seen) {
    setSeen(state)
    if (state.ok) onOpenChange(false)
  }

  const series = Boolean(appointment.schedule_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar día u hora</DialogTitle>
          <DialogDescription>
            La sesión de {patientName} se mueve con lo que tenga preparado: el plan y la
            nota previa van con ella.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="appointmentId" value={appointment.id} />

          {!state.ok && state.message ? <FormMessage message={state.message} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Día" htmlFor="reschedule-date">
              <Input
                id="reschedule-date"
                name="scheduledOn"
                type="date"
                required
                defaultValue={state.values?.scheduledOn ?? appointment.scheduled_on}
              />
            </Field>
            <TimeField
              id="reschedule-time"
              defaultTime={state.values?.startTime ?? appointment.start_time}
            />
          </div>

          <DurationField
            idPrefix="reschedule"
            defaultMinutes={Number(state.values?.durationMinutes ?? appointment.duration_minutes)}
          />

          {series ? (
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">Es de un horario fijo</legend>
              <label className="flex items-start gap-2 text-meta">
                <input
                  type="radio"
                  name="scope"
                  value="once"
                  defaultChecked={(state.values?.scope ?? 'once') === 'once'}
                  className="mt-0.5"
                />
                <span>
                  <b>Sólo esta vez.</b> Las demás siguen en su día y hora de siempre.
                </span>
              </label>
              <label className="flex items-start gap-2 text-meta">
                <input
                  type="radio"
                  name="scope"
                  value="series"
                  defaultChecked={state.values?.scope === 'series'}
                  className="mt-0.5"
                />
                <span>
                  <b>De acá en adelante.</b> Desde esta sesión, el horario fijo pasa al día y
                  la hora nuevos.
                </span>
              </label>
            </fieldset>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Moviendo…' : 'Mover la sesión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
