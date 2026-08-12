'use client'

import { useActionState } from 'react'

import { signInAction } from '@/app/(auth)/actions'
import { FormMessage } from '@/components/auth/form-message'
import { PasswordField } from '@/components/auth/password-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

export function SignInForm({ back }: { back?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      {/* Where to land after signing in — set by the proxy when it bounced
          someone off a page they were trying to reach. */}
      {back ? <input type="hidden" name="volver" value={back} /> : null}

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

      <PasswordField
        id="password"
        label="Contraseña"
        placeholder="Tu contraseña"
        autoComplete="current-password"
      />

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
