'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import {
  firstAppointmentAction,
  firstGoalAction,
  firstPatientAction,
  firstRecordAction,
} from '@/app/(app)/inicio/onboarding-actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { today } from '@/lib/dates'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * The four small forms inside "Primeros pasos" (P21).
 *
 * Client components only because each one shows its own error — a name left
 * blank says so under that step, not somewhere else. On success there is nothing
 * to show: Inicio re-renders, and the step crosses itself out.
 *
 * Each ends with a link to the full screen for the same thing, because the small
 * form is the fastest way through, not the only one.
 */

function FullFormLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-meta font-semibold text-violet hover:underline">
      {children}
    </Link>
  )
}

export function PatientStepForm() {
  const [state, formAction, pending] = useActionState(firstPatientAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="space-y-2">
      <FormMessage message={state.message} />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          name="fullName"
          placeholder="Nombre y apellido"
          aria-label="Nombre y apellido de tu primer paciente"
          autoComplete="off"
          required
          className="min-w-[200px] flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Guardando…' : 'Cargar paciente'}
        </Button>
      </div>
      <FullFormLink href="/pacientes/nuevo">O cargá la ficha completa →</FullFormLink>
    </form>
  )
}

export function GoalStepForm({
  patientId,
  patientName,
}: {
  patientId: string
  patientName: string
}) {
  const [state, formAction, pending] = useActionState(firstGoalAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="patientId" value={patientId} />
      <FormMessage message={state.message} />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          name="title"
          placeholder="Ej: Producir /r/ en posición inicial"
          aria-label={`Qué querés lograr con ${patientName}`}
          maxLength={200}
          required
          className="min-w-[200px] flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar objetivo'}
        </Button>
      </div>
    </form>
  )
}

export function AppointmentStepForm({ patientId }: { patientId: string }) {
  const [state, formAction, pending] = useActionState(firstAppointmentAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="patientId" value={patientId} />
      <FormMessage message={state.message} />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          name="scheduledOn"
          type="date"
          defaultValue={today()}
          aria-label="Día de la sesión"
          required
          className="w-auto"
        />
        <Input
          name="startTime"
          type="time"
          step={900}
          defaultValue="09:00"
          aria-label="Hora de la sesión"
          required
          className="w-auto"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Agendando…' : 'Agendar'}
        </Button>
      </div>
      <FullFormLink href="/agenda">O armale un horario fijo en la Agenda →</FullFormLink>
    </form>
  )
}

export function RecordStepForm({
  patientId,
  todaysAppointment,
}: {
  patientId: string
  /** Today's scheduled session, if there is one: the record is tied to it. */
  todaysAppointment: { id: string; startTime: string } | null
}) {
  const [state, formAction, pending] = useActionState(firstRecordAction, EMPTY_FORM_STATE)

  const fullForm = todaysAppointment
    ? `/pacientes/${patientId}/sesiones/nueva?agenda=${todaysAppointment.id}`
    : `/pacientes/${patientId}/sesiones/nueva`

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="heldOn" value={today()} />
      {todaysAppointment ? (
        <input type="hidden" name="appointmentId" value={todaysAppointment.id} />
      ) : null}
      <FormMessage message={state.message} />
      <Textarea
        name="progressNote"
        placeholder="¿Cómo salió? Ej: logró la /r/ en posición inicial, muy conectado al juego."
        aria-label="Cómo salió la sesión"
        required
        className="min-h-20"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar registro'}
        </Button>
        <FullFormLink href={fullForm}>O abrí el formulario completo, con dictado →</FullFormLink>
      </div>
    </form>
  )
}
