'use client'

import { CalendarClock, Plus } from '@/components/icons'
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
 * Agendar, en un solo botón.
 *
 * Antes eran dos, "Agendar" y "Horario fijo", y esa era la primera decisión que
 * la pantalla te pedía: elegir un botón sabiendo de antemano en cuál de los dos
 * mundos estabas. Pero no son dos cosas distintas — son la misma cosa, una vez o
 * todas las semanas. Ahora se entra por un lado y la repetición se elige
 * adentro, que es donde la pregunta tiene sentido.
 *
 *   **Una vez** es una fecha sola: una recuperación, una primera entrevista, una
 *   evaluación.
 *
 *   **Cada semana** es la regla — "Tomás, los lunes a las nueve" — y llena la
 *   agenda sola de acá en adelante. Es de lo que está hecha la mayor parte de la
 *   semana.
 *
 * Los horarios fijos que ya existen se siguen viendo y dando de baja en la
 * tarjeta "Horarios fijos", al pie de la Agenda.
 *
 * Son dos formularios y no uno con campos que aparecen y desaparecen: cada uno
 * postea a su propia Server Action, y los campos que piden no se parecen —una
 * fecha contra un día de la semana más una frecuencia. Mezclarlos en un formulario
 * obligaría a decidir en el servidor qué mitad ignorar.
 */
export function ScheduleDialogs({ patients }: { patients: PatientOption[] }) {
  const [open, setOpen] = useState(false)
  const [repeats, setRepeats] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="max-lg:w-full">
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        disabled={patients.length === 0}
        className="max-lg:w-full"
      >
        <Plus className="size-[18px]" />
        Agendar sesión
      </Button>

      <Dialog open={open} onOpenChange={(next) => !next && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar una sesión</DialogTitle>
          </DialogHeader>

          {/* La elección arriba de todo, antes de cualquier campo: es lo que
              decide qué campos tienen sentido abajo. */}
          <div
            role="radiogroup"
            aria-label="¿Se repite?"
            className="grid grid-cols-2 gap-1.5 rounded-xl bg-muted p-1"
          >
            <ModeButton selected={!repeats} onSelect={() => setRepeats(false)}>
              <Plus className="size-4" />
              Una sola vez
            </ModeButton>
            <ModeButton selected={repeats} onSelect={() => setRepeats(true)}>
              <CalendarClock className="size-4" />
              Cada semana
            </ModeButton>
          </div>

          {repeats ? (
            <ScheduleFields patients={patients} onDone={close} />
          ) : (
            <AppointmentFields patients={patients} onDone={close} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ModeButton({
  selected,
  onSelect,
  children,
}: {
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={
        selected
          ? 'flex items-center justify-center gap-1.5 rounded-lg bg-card px-3 py-2 text-body font-bold shadow-card'
          : 'flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-body font-semibold text-muted-foreground hover:text-foreground'
      }
    >
      {children}
    </button>
  )
}

function AppointmentFields({
  patients,
  onDone,
}: {
  patients: PatientOption[]
  onDone: () => void
}) {
  const [state, formAction, pending] = useActionState(
    createAppointmentAction,
    EMPTY_FORM_STATE,
  )

  useEffect(() => {
    if (state.ok) onDone()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
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
  )
}

function ScheduleFields({
  patients,
  onDone,
}: {
  patients: PatientOption[]
  onDone: () => void
}) {
  const [state, formAction, pending] = useActionState(createScheduleAction, EMPTY_FORM_STATE)

  useEffect(() => {
    if (state.ok) onDone()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      <p className="text-meta leading-relaxed text-muted-foreground">
        Se agenda solo, semana a semana. Podés cancelar una sesión suelta sin tocar el
        horario, y darlo de baja cuando quieras desde “Horarios fijos”, al pie de la
        Agenda.
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
