'use client'

import { useActionState } from 'react'

import { signOutAction, verifySecondStepAction } from '@/app/(auth)/actions'
import { AUTH_FIELD, AUTH_LABEL, AUTH_SUBMIT } from '@/components/auth/field-styles'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

export function VerifyCodeForm({ back }: { back?: string }) {
  const [state, formAction, pending] = useActionState(verifySecondStepAction, EMPTY_FORM_STATE)

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <FormMessage message={state.message} />
        {back ? <input type="hidden" name="volver" value={back} /> : null}

        <div className="space-y-1.5">
          <Label htmlFor="code" className={AUTH_LABEL}>
            Código de 6 números
          </Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            className={AUTH_FIELD}
            autoFocus
            required
          />
        </div>

        <Button type="submit" className={AUTH_SUBMIT} disabled={pending}>
          {pending ? 'Verificando…' : 'Entrar'}
        </Button>
      </form>

      {/* Sin el teléfono no hay código, y quedarse en esta pantalla sin salida
          es peor que volver a empezar. */}
      <form action={signOutAction} className="text-center">
        <button type="submit" className="text-meta text-muted-foreground underline">
          No tengo el código: salir
        </button>
      </form>
    </div>
  )
}
