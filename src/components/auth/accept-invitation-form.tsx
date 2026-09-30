'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'

import { acceptInvitationAction } from '@/app/(auth)/actions'
import { AUTH_SUBMIT } from '@/components/auth/field-styles'
import { FormMessage } from '@/components/auth/form-message'
import { PasswordField } from '@/components/auth/password-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * Choosing a password is the whole of accepting an invitation.
 *
 * The name, the address and the discipline came with the invitation and are
 * shown above this form rather than repeated as fields: they are already
 * decided, and asking somebody to retype an address they did not choose is how
 * a typo gets introduced at the last step. All three are editable afterwards
 * from `/perfil`.
 */
export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    acceptInvitationAction,
    EMPTY_FORM_STATE,
  )

  // El checkbox no sobrevive al reset que hace React cuando la acción contesta
  // —lo marca sólo al montar—, así que se remonta con una key que cambia. La
  // explicación larga está en `invite-form.tsx`, que hace lo mismo con su
  // `<select>`.
  //
  // Olvidarse de tildar los términos es la forma más probable de que este
  // formulario vuelva rechazado, y perder el tilde en el camino es una pequeña
  // falta de respeto en el peor momento.
  const [seenState, setSeenState] = useState(state)
  const [attempt, setAttempt] = useState(0)

  if (state !== seenState) {
    setSeenState(state)
    setAttempt((count) => count + 1)
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      <input type="hidden" name="token" value={token} />

      <PasswordField
        id="password"
        label="Elegí tu contraseña"
        placeholder="Usá al menos 10 caracteres"
        autoComplete="new-password"
      />

      <Label
        htmlFor="acceptedTerms"
        className="flex items-start gap-2 text-meta leading-relaxed font-normal"
      >
        <Checkbox
          key={`terms-${attempt}`}
          id="acceptedTerms"
          name="acceptedTerms"
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

      <Button type="submit" size="lg" className={AUTH_SUBMIT} disabled={pending}>
        {pending ? 'Creando tu cuenta…' : 'Entrar a Ombúa'}
      </Button>
    </form>
  )
}
