'use client'

import Link from 'next/link'
import { useActionState } from 'react'

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

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nombre y apellido</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>

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
          id="discipline"
          name="discipline"
          required
          defaultValue=""
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
        <Checkbox id="acceptedTerms" name="acceptedTerms" className="mt-0.5" />
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
