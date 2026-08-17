'use client'

import { useActionState } from 'react'

import { saveSessionAction } from '@/app/(app)/pacientes/session-actions'
import { FormMessage } from '@/components/auth/form-message'
import { DictateButton } from '@/components/dictate-button'
import { RecordSession } from '@/components/sessions/record-session'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { today } from '@/lib/dates'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import type { Goal } from '@/server/goals'

/**
 * Recording a session. Ported from v1's modal (`legacy/index.html:722`), with
 * one change that matters: a real date field.
 *
 * v1 stamped `new Date()` and stored `"04 jul"` — so a session written up on
 * Monday for Friday's appointment was filed on the wrong day, and the year was
 * never recorded at all.
 *
 * Which goals were worked is a checkbox list rather than a per-goal progress
 * field. Marking "we touched this" takes a second; deciding a new percentage for
 * each one does not, and the slider on the patient's page is where that belongs.
 */
export function SessionForm({
  patientId,
  goals,
  session,
  selectedGoalIds = [],
  fromPlan = false,
  noteDraft = '',
}: {
  patientId: string
  goals: Goal[]
  session?: {
    id: string
    held_on: string
    progress_note: string | null
    private_note: string | null
  }
  selectedGoalIds?: string[]
  /** Opened from the planner, so saving retires the prepared session. */
  fromPlan?: boolean
  /** A first sentence to edit, built from what was planned. Never saved as-is. */
  noteDraft?: string
}) {
  const [state, formAction, pending] = useActionState(saveSessionAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="patientId" value={patientId} />
      {session ? <input type="hidden" name="sessionId" value={session.id} /> : null}
      {fromPlan ? <input type="hidden" name="clearPlan" value="1" /> : null}

      <FormMessage message={state.message} />

      {/* At the top, as in v1 (`legacy/index.html:1943`): it is the first thing
          you reach for, before the session starts, not something you find after
          filling the form in. Only when writing a session up for the first time
          — a recording cannot be made of a session that already happened. */}
      {session ? null : <RecordSession patientId={patientId} targetId="progressNote" />}

      <div className="max-w-[200px] space-y-1.5">
        <Label htmlFor="heldOn">Fecha de la sesión</Label>
        <Input
          id="heldOn"
          name="heldOn"
          type="date"
          defaultValue={session?.held_on ?? today()}
          required
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          Objetivos trabajados
          <span className="font-normal text-muted-foreground">
            {' '}
            · marcá cuáles tocaste
          </span>
        </legend>

        {goals.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Sin objetivos todavía. Podés registrar la sesión igual y cargarlos después.
          </p>
        ) : (
          <div className="space-y-1">
            {goals.map((goal) => (
              <Label
                key={goal.id}
                htmlFor={`goal-${goal.id}`}
                className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 font-normal hover:bg-muted"
              >
                <Checkbox
                  id={`goal-${goal.id}`}
                  name="goalIds"
                  value={goal.id}
                  defaultChecked={selectedGoalIds.includes(goal.id)}
                />
                {goal.title}
              </Label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="progressNote">Cómo salió la sesión</Label>
          <DictateButton targetId="progressNote" />
        </div>
        <Textarea
          id="progressNote"
          name="progressNote"
          rows={5}
          required
          defaultValue={session?.progress_note ?? noteDraft}
          placeholder="Logró la /r/ en posición inicial de forma consistente, muy conectado al juego."
        />
        <p className="text-xs text-muted-foreground">
          Esto es lo que Hilo lee después para armar los informes. Cuanto más concreto,
          mejor sale el borrador.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="privateNote">
          Nota privada
          <span className="font-normal text-muted-foreground"> · opcional</span>
        </Label>
        <Textarea
          id="privateNote"
          name="privateNote"
          rows={2}
          defaultValue={session?.private_note ?? ''}
          placeholder="Para vos. No entra en ningún informe."
        />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending ? 'Guardando…' : session ? 'Guardar cambios' : 'Guardar sesión'}
      </Button>
    </form>
  )
}
