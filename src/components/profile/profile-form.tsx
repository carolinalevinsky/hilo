'use client'

import { useActionState } from 'react'

import { updateProfileAction } from '@/app/(app)/perfil/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DISCIPLINES } from '@/lib/disciplines'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

export function ProfileForm({
  fullName,
  discipline,
  phone,
}: {
  fullName: string
  discipline: string
  phone: string | null
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, EMPTY_FORM_STATE)

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {state.ok ? (
        <p
          role="status"
          className="rounded-[11px] bg-green-soft px-3.5 py-2.5 text-[12.5px] text-[#1a8f57]"
        >
          {state.message}
        </p>
      ) : (
        <FormMessage message={state.message} />
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nombre y apellido</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={fullName}
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="discipline">Tu profesión</Label>
        <select
          id="discipline"
          name="discipline"
          defaultValue={discipline}
          required
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {DISCIPLINES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Define qué instrumentos de evaluación y qué materiales ves en la app.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ''}
          placeholder="099 123 456"
          autoComplete="tel"
        />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
