'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'

import { signUpAction } from '@/app/(auth)/actions'
import { FormMessage } from '@/components/auth/form-message'
import { PasswordField } from '@/components/auth/password-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DISCIPLINES } from '@/lib/disciplines'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, EMPTY_FORM_STATE)

  // React clears an uncontrolled form once the action returns, so everything the
  // practitioner typed goes with it. The action hands the values back and they
  // come in here as defaults — except the password, which is never sent back.
  // See `FormState`.
  const typed = state.values ?? {}

  /**
   * A counter that ticks on every rejected attempt, used as a `key` on the two
   * controls that a text input's trick does not work for.
   *
   * React resets the form once the action returns. A text input comes back
   * because `form.reset()` restores its `defaultValue`, which React has already
   * re-rendered with the echoed value. A `<select>` does not: React marks the
   * chosen `<option>` on mount only, so the reset restores the empty
   * placeholder. Making it controlled does not help either — the native reset
   * changes the DOM without telling React, React still believes its own value,
   * and the two stay out of step with nothing to trigger a re-render.
   *
   * Changing the key remounts them, which re-applies the default from scratch.
   * It is the one approach that does not depend on the order React resets and
   * re-renders in.
   *
   * The counter is bumped during render rather than in an effect — the pattern
   * `PaymentDialog` already uses — so the field is never briefly empty.
   */
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
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          defaultValue={typed.email ?? ''}
          required
        />
      </div>

      <PasswordField
        id="password"
        label="Contraseña"
        placeholder="Usá al menos 6 caracteres"
        autoComplete="new-password"
      />

      <div className="space-y-1.5">
        <Label htmlFor="discipline">Tu profesión</Label>
        {/*
          A plain <select>, not the shadcn Select. Radix's Select renders a
          listbox that does not submit with the form, so it would need client
          state and a hidden input to do what one native element already does —
          and on a phone the native picker is the better control anyway.
        */}
        <select
          key={`discipline-${attempt}`}
          id="discipline"
          name="discipline"
          required
          defaultValue={typed.discipline ?? ''}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Elegí tu profesión
          </option>
          {DISCIPLINES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <Label
        htmlFor="acceptedTerms"
        className="flex items-start gap-2 text-[12.5px] leading-relaxed font-normal"
      >
        <Checkbox
          key={`terms-${attempt}`}
          id="acceptedTerms"
          name="acceptedTerms"
          defaultChecked={typed.acceptedTerms === 'on'}
          className="mt-0.5"
        />
        <span>
          Leí y acepto los{' '}
          <Link href="/terminos" className="text-violet underline">
            Términos y Condiciones
          </Link>{' '}
          y la{' '}
          <Link href="/privacidad" className="text-violet underline">
            Política de Privacidad
          </Link>
          .
        </span>
      </Label>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Creando tu cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
