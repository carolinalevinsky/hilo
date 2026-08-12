'use client'

import { CalendarClock, Plus } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'

import {
  createAppointmentAction,
  createScheduleAction,
} from '@/app/(app)/agenda/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FREQUENCY_LABELS } from '@/lib/appointment-labels'
import { today } from '@/lib/dates'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { WEEK_ORDER, weekdayName } from '@/lib/week'

type PatientOption = { id: string; full_name: string }

/**
 * The two ways something gets on the agenda, side by side, because the
 * difference between them is the thing a practitioner has to choose:
 *
 *   **A fixed slot** is the rule — "Tomás, Mondays at nine". It fills every week
 *   from now on and is what most of the agenda is made of.
 *
 *   **A one-off** is a single date. A make-up session, a first interview, an
 *   evaluation.
 *
 * v1 only had the first, and it had no dates, so a make-up session had nowhere
 * to go.
 */
export function ScheduleDialogs({ patients }: { patients: PatientOption[] }) {
  const [openDialog, setOpenDialog] = useState<'schedule' | 'appointment' | null>(null)

  return (
    <div className="flex gap-2 max-lg:w-full">
      <Button
        size="lg"
        onClick={() => setOpenDialog('appointment')}
        disabled={patients.length === 0}
        className="max-lg:flex-1"
      >
        <Plus className="size-[18px]" />
        Agendar
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => setOpenDialog('schedule')}
        disabled={patients.length === 0}
        className="max-lg:flex-1"
      >
        <CalendarClock className="size-[18px]" />
        Horario fijo
      </Button>

      <AppointmentDialog
        patients={patients}
        open={openDialog === 'appointment'}
        onClose={() => setOpenDialog(null)}
      />
      <ScheduleDialog
        patients={patients}
        open={openDialog === 'schedule'}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  )
}

function AppointmentDialog({
  patients,
  open,
  onClose,
}: {
  patients: PatientOption[]
  open: boolean
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(
    createAppointmentAction,
    EMPTY_FORM_STATE,
  )

  useEffect(() => {
    if (state.ok) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar una sesión</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormMessage message={state.message} />

          <PatientSelect patients={patients} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Día" htmlFor="scheduledOn">
              <Input
                id="scheduledOn"
                name="scheduledOn"
                type="date"
                defaultValue={today()}
                required
              />
            </Field>
            <Field label="Hora" htmlFor="startTime">
              <Input id="startTime" name="startTime" type="time" defaultValue="09:00" required />
            </Field>
          </div>

          <DurationField />

          <Field label="Nota" htmlFor="note" hint="opcional">
            <Input id="note" name="note" placeholder="Ej: primera entrevista" />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Agendando…' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ScheduleDialog({
  patients,
  open,
  onClose,
}: {
  patients: PatientOption[]
  open: boolean
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(createScheduleAction, EMPTY_FORM_STATE)

  useEffect(() => {
    if (state.ok) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Horario fijo</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormMessage message={state.message} />

          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Se agenda solo, semana a semana. Podés cancelar una sesión suelta sin tocar el
            horario.
          </p>

          <PatientSelect patients={patients} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Día de la semana" htmlFor="weekday">
              <Select id="weekday" name="weekday" defaultValue="1">
                {WEEK_ORDER.map((weekday) => (
                  <option key={weekday} value={weekday}>
                    {weekdayName(weekday)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Hora" htmlFor="scheduleTime">
              <Input id="scheduleTime" name="startTime" type="time" defaultValue="09:00" required />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Frecuencia" htmlFor="frequency">
              <Select id="frequency" name="frequency" defaultValue="weekly">
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Desde" htmlFor="startsOn">
              <Input id="startsOn" name="startsOn" type="date" defaultValue={today()} required />
            </Field>
          </div>

          <DurationField idPrefix="schedule" />

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar horario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PatientSelect({ patients }: { patients: PatientOption[] }) {
  return (
    <Field label="Paciente" htmlFor="patientId">
      <Select id="patientId" name="patientId" required defaultValue="">
        <option value="" disabled>
          Elegí un paciente
        </option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.full_name}
          </option>
        ))}
      </Select>
    </Field>
  )
}

function DurationField({ idPrefix = 'one-off' }: { idPrefix?: string }) {
  const id = `${idPrefix}-duration`
  return (
    <Field label="Duración" htmlFor={id}>
      <Select id={id} name="durationMinutes" defaultValue="45">
        <option value="30">30 minutos</option>
        <option value="45">45 minutos</option>
        <option value="60">1 hora</option>
        <option value="90">1 hora y media</option>
      </Select>
    </Field>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {hint ? <span className="font-normal text-muted-foreground"> · {hint}</span> : null}
      </Label>
      {children}
    </div>
  )
}

function Select(props: React.ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}
