'use client'

import { useActionState } from 'react'

import { setNewPasswordAction } from '@/app/(auth)/actions'
import { FormMessage } from '@/components/auth/form-message'
import { PasswordField } from '@/components/auth/password-field'
import { Button } from '@/components/ui/button'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState(setNewPasswordAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      <PasswordField
        id="password"
        label="Contraseña nueva"
        placeholder="Usá al menos 6 caracteres"
        autoComplete="new-password"
      />

      <PasswordField
        id="confirmation"
        name="confirmation"
        label="Repetila"
        placeholder="La misma otra vez"
        autoComplete="new-password"
        hint="Pedimos que la escribas dos veces porque no vas a poder ver si te equivocaste hasta el próximo intento de entrar."
      />

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar contraseña'}
      </Button>
    </form>
  )
}
