'use client'

import { useActionState } from 'react'

import { requestPasswordResetAction } from '@/app/(auth)/actions'
import { EmailSent } from '@/components/auth/email-sent'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

export function PasswordResetForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    EMPTY_FORM_STATE,
  )

  // The confirmation says "si hay una cuenta" on purpose: the server answers the
  // same way whether or not that address exists, and the screen must not say
  // more than the server knows. Whether a given professional has an account here
  // is not something a stranger gets to find out by typing an address.
  if (state.ok) {
    return (
      <EmailSent title="Revisá tu correo">
        Si hay una cuenta con ese correo, te llega un enlace para poner una contraseña
        nueva. Vence en una hora.
      </EmailSent>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviame el enlace'}
      </Button>
    </form>
  )
}
