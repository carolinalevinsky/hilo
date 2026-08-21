'use client'

import { useActionState, useState } from 'react'

import { completeProfileAction } from '@/app/(auth)/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DISCIPLINES } from '@/lib/disciplines'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * Two fields, and only the two the database cannot guess.
 *
 * The email comes from the session and the plan has a default, so this asks for
 * a name and a profession and nothing else. It is a repair screen, not a second
 * sign-up: everything it can avoid asking, it avoids asking.
 */
export function CompleteProfileForm() {
  const [state, formAction, pending] = useActionState(
    completeProfileAction,
    EMPTY_FORM_STATE,
  )

  const typed = state.values ?? {}

  // Same remount trick the sign-up form documents: a `<select>` does not come
  // back from React's post-action reset on its own.
  const [seenState, setSeenState] = useState(state)
  const [attempt, setAttempt] = useState(0)

  if (state !== seenState) {
    setSeenState(state)
    setAttempt((count) => count + 1)
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nombre y apellido</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={typed.fullName ?? ''}
          placeholder="Lucía Fernández"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="discipline">Profesión</Label>
        <select
          key={`discipline-${attempt}`}
          id="discipline"
          name="discipline"
          defaultValue={typed.discipline ?? ''}
          required
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13.5px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Elegí tu profesión
          </option>
          {DISCIPLINES.map((discipline) => (
            <option key={discipline.id} value={discipline.id}>
              {discipline.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Guardando…' : 'Entrar a Hilo'}
      </Button>
    </form>
  )
}
