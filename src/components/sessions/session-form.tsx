'use client'

import { useActionState, useState } from 'react'

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
 * ─── Why the progress field is here after all ─────────────────────────────
 *
 * This used to be a plain checkbox list, on the argument that marking "we
 * touched this" takes a second and deciding a new percentage does not, so the
 * slider on the patient's page was the right home for it.
 *
 * Walking the whole flow as a practitioner is what settled it the other way.
 * You register the session, you tick the goal, the note describes exactly how it
 * went — and the number stays where it was. Fixing it means leaving the form,
 * opening the ficha and moving a slider from memory, at which point most people
 * do not, and the chart stops meaning anything.
 *
 * The compromise the old argument was really protecting is kept: the field only
 * appears for a goal you actually ticked, it arrives pre-filled with the current
 * number, and leaving it alone writes nothing. Three ticked goals cost three
 * glances, not three decisions.
 */
export function SessionForm({
  patientId,
  goals,
  session,
  selectedGoalIds = [],
  planItemIds = [],
  appointment,
  noteDraft = '',
}: {
  patientId: string
  goals: Goal[]
  session?: {
    id: string
    held_on: string
    progress_note: string | null
  }
  selectedGoalIds?: string[]
  /**
   * The prepared rows the draft was built from. Saving retires exactly these —
   * see `removePlanItems` for why by id and not by session.
   */
  planItemIds?: string[]
  /**
   * Opened from a slot in the agenda: the record is tied to it, and saving marks
   * it as attended. `startTime` arrives already formatted.
   */
  appointment?: { id: string; scheduledOn: string; startTime: string }
  /** A first sentence to edit, built from what was planned. Never saved as-is. */
  noteDraft?: string
}) {
  const [state, formAction, pending] = useActionState(saveSessionAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="patientId" value={patientId} />
      {session ? <input type="hidden" name="sessionId" value={session.id} /> : null}
      {planItemIds.map((id) => (
        <input key={id} type="hidden" name="planItemId" value={id} />
      ))}
      {appointment ? (
        <input type="hidden" name="appointmentId" value={appointment.id} />
      ) : null}

      <FormMessage message={state.message} />

      {/* At the top, as in v1 (`legacy/index.html:1943`): it is the first thing
          you reach for, before the session starts, not something you find after
          filling the form in. Only when writing a session up for the first time
          — a recording cannot be made of a session that already happened. */}
      {session ? null : <RecordSession patientId={patientId} targetId="progressNote" />}

      <div className="max-w-[200px] space-y-1.5">
        <Label htmlFor="heldOn">Fecha de la sesión</Label>
        {/* From the agenda, the slot's own date and not today: the record of
            Friday's session written up on Monday belongs to Friday — the bug
            this field was added to fix in the first place. */}
        <Input
          id="heldOn"
          name="heldOn"
          type="date"
          defaultValue={session?.held_on ?? appointment?.scheduledOn ?? today()}
          required
        />
      </div>

      {appointment ? (
        <p className="-mt-3 text-meta text-muted-foreground">
          Es el registro de la sesión de las {appointment.startTime} en tu agenda. Al
          guardarlo, esa sesión queda marcada como que vino.
        </p>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          Objetivos trabajados
          <span className="font-normal text-muted-foreground">
            {' '}
            · marcá cuáles tocaste
          </span>
        </legend>

        {goals.length === 0 ? (
          <p className="text-body text-muted-foreground">
            Sin objetivos todavía. Podés registrar la sesión igual y cargarlos después.
          </p>
        ) : (
          <div className="space-y-1">
            {goals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                defaultChecked={selectedGoalIds.includes(goal.id)}
              />
            ))}
          </div>
        )}
      </fieldset>

      {/* One note per session. There used to be a second, private field kept out
          of reports and out of the patient's data export; two textareas one
          above the other read as the same question asked twice. What is written
          here is clinical record: the AI reads it to draft reports, and it is
          handed over if the patient exercises their right of access. The hint
          says so, because the field no longer has a private counterpart to
          imply it. */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="progressNote">Comentarios</Label>
          <DictateButton targetId="progressNote" />
        </div>
        {/* No `rows`: the component sets `field-sizing-content`, so the box grows
            with what is typed and `rows` is ignored. As the only field on the
            screen it should look like it expects a paragraph, so the floor is
            raised from `min-h-16` instead. */}
        <Textarea
          id="progressNote"
          name="progressNote"
          className="min-h-40"
          required
          defaultValue={session?.progress_note ?? noteDraft}
          placeholder="Logró la /r/ en posición inicial de forma consistente, muy conectado al juego."
        />
        <p className="text-xs text-muted-foreground">
          Esto es lo que Hilo lee después para armar los informes, y lo que se entrega
          si la familia pide sus datos. Cuanto más concreto, mejor sale el borrador.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending ? 'Guardando…' : session ? 'Guardar cambios' : 'Guardar registro'}
      </Button>
    </form>
  )
}

/**
 * One goal: whether it was worked, and where its number stands afterwards.
 *
 * The percentage input is rendered only while the box is ticked, so an untouched
 * goal submits nothing at all and cannot move by accident. `progressWas` travels
 * with it so the server can tell "she left it alone" from "she set it to the
 * same number on purpose" — see `session-actions.ts`.
 */
function GoalRow({ goal, defaultChecked }: { goal: Goal; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="rounded-lg px-1 py-1.5 hover:bg-muted">
      <Label
        htmlFor={`goal-${goal.id}`}
        className="flex items-center gap-2.5 font-normal"
      >
        <Checkbox
          id={`goal-${goal.id}`}
          name="goalIds"
          value={goal.id}
          checked={checked}
          onCheckedChange={(next) => setChecked(next === true)}
        />
        {goal.title}
        <span className="ml-auto shrink-0 text-meta text-muted-foreground tabular-nums">
          {goal.progress}%
        </span>
      </Label>

      {checked ? (
        <div className="mt-1.5 flex items-center gap-2.5 pl-8">
          <input type="hidden" name={`progressWas-${goal.id}`} value={goal.progress} />
          <Label
            htmlFor={`progress-${goal.id}`}
            className="shrink-0 text-meta font-normal text-muted-foreground"
          >
            ¿Cómo quedó?
          </Label>
          <input
            id={`progress-${goal.id}`}
            name={`progress-${goal.id}`}
            type="range"
            min="0"
            max="100"
            step="5"
            defaultValue={goal.progress}
            onInput={(event) => {
              const output = event.currentTarget.nextElementSibling
              if (output) output.textContent = `${event.currentTarget.value}%`
            }}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-violet"
          />
          <output
            htmlFor={`progress-${goal.id}`}
            className="w-10 shrink-0 text-right text-meta font-bold tabular-nums"
          >
            {goal.progress}%
          </output>
        </div>
      ) : null}
    </div>
  )
}
