'use client'

import Link from 'next/link'
import { SelfGenderField } from '@/components/profile/self-gender-field'
import { useActionState } from 'react'

import { acceptInvitationAction } from '@/app/(auth)/actions'
import { AUTH_SUBMIT } from '@/components/auth/field-styles'
import { FormMessage } from '@/components/auth/form-message'
import { submitKeepingFields } from '@/components/auth/keep-fields'
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
export function AcceptInvitationForm({
  token,
  suggestedGender,
}: {
  token: string
  /** Lo que se deduce del nombre de la invitación. Ver `grammatical-gender.ts`. */
  suggestedGender: string | null
}) {
  const [state, formAction, pending] = useActionState(
    acceptInvitationAction,
    EMPTY_FORM_STATE,
  )

  // Nada se borra cuando la acción contesta que no: ni la contraseña ni el
  // tilde. Olvidarse de tildar los términos es la forma más probable de que este
  // formulario vuelva rechazado, y tener que escribir la contraseña de nuevo
  // por eso era lo que hacía difícil entrar la primera vez. Ver `keep-fields.ts`.
  return (
    <form action={formAction} onSubmit={submitKeepingFields(formAction)} className="space-y-4">
      <FormMessage message={state.message} />

      <input type="hidden" name="token" value={token} />

      <SelfGenderField defaultValue={suggestedGender} />

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
