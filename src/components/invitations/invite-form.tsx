'use client'

import { useActionState, useState } from 'react'

import { inviteAction } from '@/app/(app)/invitaciones/actions'
import { InviteLink } from '@/components/invitations/invite-link'
import { InviteResult } from '@/components/invitations/invite-result'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { DISCIPLINES } from '@/lib/disciplines'

import { EMPTY_INVITE_STATE } from '@/app/(app)/invitaciones/state'

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteAction, EMPTY_INVITE_STATE)

  const typed = state.values ?? {}

  // React vuelve a poner el formulario en su estado inicial cuando la acción
  // contesta, y eso no le devuelve el valor a un `<select>` ni a un checkbox: el
  // `<option>` elegido lo marca React sólo al montar, así que el reset restaura
  // el placeholder. Controlarlo tampoco alcanza — el reset nativo cambia el DOM
  // sin avisarle a React, que sigue creyendo su propio valor. Remontar con una
  // key distinta vuelve a aplicar el default desde cero, y es lo único que no
  // depende del orden en que React resetea y re-renderiza.
  //
  // El contador sube durante el render y no en un efecto, para que el campo no
  // quede vacío ni un instante.
  const [seenState, setSeenState] = useState(state)
  const [attempt, setAttempt] = useState(0)

  if (state !== seenState) {
    setSeenState(state)
    setAttempt((count) => count + 1)
  }

  return (
    <div className="max-w-md space-y-4">
      <form action={formAction} className="space-y-4">
        <InviteResult state={state} />

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nombre y apellido</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="off"
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
            placeholder="nombre@email.com"
            autoComplete="off"
            defaultValue={typed.email ?? ''}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="discipline">Su profesión</Label>
          <NativeSelect
            key={`discipline-${attempt}`}
            id="discipline"
            name="discipline"
            required
            defaultValue={typed.discipline ?? ''}
          >
            <option value="" disabled>
              Elegí la profesión
            </option>
            {DISCIPLINES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">
            Define qué instrumentos y qué materiales va a ver. Lo puede cambiar después
            desde su perfil.
          </p>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? 'Enviando…' : 'Enviar invitación'}
        </Button>
      </form>

      {state.link ? <InviteLink link={state.link} invitee={state.invitee} /> : null}
    </div>
  )
}
