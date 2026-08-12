'use client'

import { Check, Pencil, Plus } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'

import {
  saveGoalAction,
  setGoalActiveAction,
  setGoalProgressAction,
} from '@/app/(app)/pacientes/goal-actions'
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
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { PATIENT_COLOR_HEX } from '@/lib/patient-colors'
import type { Goal } from '@/server/goals'

const CHART_COLORS = ['violet', 'teal', 'coral', 'blue', 'amber', 'green'] as const

/**
 * The goals block on a patient's page: a bar per goal, a slider to move it, and
 * a dialog to add or rename one.
 *
 * The slider matters more than it looks. Progress gets adjusted right after a
 * session, often on a phone, often standing up. A number field there means
 * tapping, a keyboard, and a decision about the exact value; a slider means one
 * drag and a rough answer, which is the honest precision anyway.
 */
export function GoalList({
  patientId,
  goals,
}: {
  patientId: string
  goals: Goal[]
}) {
  const [editing, setEditing] = useState<Goal | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-3.5">
      {goals.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Todavía no cargaste objetivos. Agregá el primero y su avance empieza a quedar
          registrado en cada sesión.
        </p>
      ) : (
        <ul className="space-y-3.5">
          {goals.map((goal, index) => (
            <GoalRow
              key={goal.id}
              patientId={patientId}
              goal={goal}
              color={PATIENT_COLOR_HEX[CHART_COLORS[index % CHART_COLORS.length]!]!}
              onEdit={() => setEditing(goal)}
            />
          ))}
        </ul>
      )}

      <Button type="button" variant="outline" size="sm" onClick={() => setCreating(true)}>
        <Plus className="size-4" />
        Nuevo objetivo
      </Button>

      <GoalDialog
        patientId={patientId}
        goal={editing}
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
      />
    </div>
  )
}

function GoalRow({
  patientId,
  goal,
  color,
  onEdit,
}: {
  patientId: string
  goal: Goal
  color: string
  onEdit: () => void
}) {
  // Local while dragging so the bar tracks the thumb; the server is told when
  // the drag ends.
  //
  // The second piece of state is React's documented way to reset local state
  // when a prop changes: compare during render, not in an effect. An effect here
  // would render the stale value once before correcting it, which on a progress
  // bar is a visible flick backwards after every save.
  const [value, setValue] = useState(goal.progress)
  const [lastSaved, setLastSaved] = useState(goal.progress)
  if (goal.progress !== lastSaved) {
    setLastSaved(goal.progress)
    setValue(goal.progress)
  }

  function commit(next: number) {
    if (next === goal.progress) return
    const formData = new FormData()
    formData.set('patientId', patientId)
    formData.set('goalId', goal.id)
    formData.set('progress', String(next))
    void setGoalProgressAction(formData)
  }

  return (
    <li>
      <div className="flex items-center justify-between gap-2 text-[13.5px]">
        <span className="min-w-0 font-semibold">
          {goal.title}
          {goal.progress >= 100 ? (
            <span className="ml-1.5 rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-bold text-[#1a8f57]">
              Logrado
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
          {value}%
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${goal.title}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </button>
        </span>
      </div>

      {/* One control, not a bar plus a slider below it. The range input is both
          the readout and the way to change it, tinted to the goal's colour so it
          matches its line in the chart above. */}
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        aria-label={`Avance de ${goal.title}`}
        onChange={(event) => setValue(Number(event.target.value))}
        onPointerUp={() => commit(value)}
        onKeyUp={() => commit(value)}
        className="hilo-range mt-2 w-full cursor-pointer"
        style={
          {
            '--range-color': color,
            background: `linear-gradient(to right, ${color} ${value}%, var(--muted) ${value}%)`,
          } as React.CSSProperties
        }
      />
    </li>
  )
}

function GoalDialog({
  patientId,
  goal,
  open,
  onClose,
}: {
  patientId: string
  goal: Goal | null
  open: boolean
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(saveGoalAction, EMPTY_FORM_STATE)

  useEffect(() => {
    if (state.ok) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Editar objetivo' : 'Nuevo objetivo'}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="patientId" value={patientId} />
          {goal ? <input type="hidden" name="goalId" value={goal.id} /> : null}
          <input type="hidden" name="progress" value={goal?.progress ?? 0} />

          <FormMessage message={state.message} />

          <div className="space-y-1.5">
            <Label htmlFor="goal-title">¿Qué querés lograr?</Label>
            <Input
              id="goal-title"
              name="title"
              defaultValue={goal?.title ?? ''}
              placeholder="Ej: Producción del fonema /r/"
              required
              autoFocus
            />
          </div>

          <DialogFooter>
            {goal ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const formData = new FormData()
                  formData.set('patientId', patientId)
                  formData.set('goalId', goal.id)
                  formData.set('isActive', 'false')
                  void setGoalActiveAction(formData)
                  onClose()
                }}
              >
                <Check className="size-4" />
                Dar por cerrado
              </Button>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
