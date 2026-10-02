'use client'

import { useActionState } from 'react'

import {
  copyInvitationLinkAction,
  resendInvitationAction,
  revokeInvitationAction,
} from '@/app/(app)/invitaciones/actions'
import { EMPTY_INVITE_STATE } from '@/app/(app)/invitaciones/state'
import { EmptyState } from '@/components/empty-state'
import { Check, Clock, Link2, RotateCw, Trash2, UserPlus } from '@/components/icons'
import { InviteLink } from '@/components/invitations/invite-link'
import { InviteResult } from '@/components/invitations/invite-result'
import { Button } from '@/components/ui/button'
import { auditWhen } from '@/lib/audit-labels'
import { disciplineLabel } from '@/lib/disciplines'
import type { ListedInvitation } from '@/server/invitations'

/** El estado ya viene decidido por `listInvitations`; acá sólo se dice. */
function label(invitation: ListedInvitation): string {
  if (invitation.status === 'accepted') {
    return `Entró el ${auditWhen(invitation.accepted_at!)}`
  }
  if (invitation.status === 'expired') return 'Venció sin usarse'
  return `Pendiente · vence el ${auditWhen(invitation.expires_at)}`
}

export function InvitationList({ invitations }: { invitations: ListedInvitation[] }) {
  // Both row buttons share one state. `useActionState` hands back a single
  // `formAction` that any number of forms may submit to, and only one row can be
  // acted on at a time anyway — so one banner above the list says what happened,
  // instead of eleven empty slots waiting for a message.
  const [resent, resendAction, resending] = useActionState(
    resendInvitationAction,
    EMPTY_INVITE_STATE,
  )
  const [copied, copyAction, copying] = useActionState(
    copyInvitationLinkAction,
    EMPTY_INVITE_STATE,
  )
  const [revoked, revokeAction, revoking] = useActionState(
    revokeInvitationAction,
    EMPTY_INVITE_STATE,
  )

  const busy = resending || copying || revoking
  const last = [resent, copied, revoked].find((state) => state.message) ?? null
  // Sólo uno de los dos puede traer enlace, y es el último que se apretó.
  const withLink = [resent, copied].find((state) => state.link)

  if (invitations.length === 0) {
    return (
      <EmptyState
        icon={UserPlus}
        title="Todavía no invitaste a nadie"
        text="Cuando mandes una invitación va a aparecer acá, con el estado de si la abrieron o no."
      />
    )
  }

  return (
    <div className="space-y-3.5">
      {last ? <InviteResult state={last} /> : null}

      {withLink?.link ? (
        <InviteLink link={withLink.link} invitee={withLink.invitee} />
      ) : null}

      <ul className="divide-y divide-border">
        {invitations.map((invitation) => {
          const accepted = invitation.status === 'accepted'

          return (
            <li
              key={invitation.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-body font-bold">{invitation.full_name}</p>
                <p className="truncate text-meta text-muted-foreground">
                  {invitation.email} · {disciplineLabel(invitation.discipline)}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {accepted ? (
                    <Check className="size-3.5 text-green-ink" />
                  ) : (
                    <Clock className="size-3.5" />
                  )}
                  {label(invitation)}
                  {invitation.sent_count > 1 && !accepted
                    ? ` · enviada ${invitation.sent_count} veces`
                    : ''}
                </p>
              </div>

              {/* Una invitación aceptada ya no es una invitación: es una colega.
                  Reenviar no tendría a dónde llevarla y cancelar significaría
                  borrarle la cuenta, que no es lo que este botón promete. */}
              {accepted ? null : (
                <div className="flex shrink-0 flex-wrap gap-2">
                  {/* Primero, y no "Reenviar", porque es el que sirve cuando el
                      correo no llega.

                      Dice "Generar" y no "Copiar" por dos motivos, y los dos
                      importan. El primero es que no copia nada: el enlace sólo
                      existe después de que el servidor contesta, y para entonces
                      ya no hay gesto del usuario con el que escribir el
                      portapapeles. El segundo es que el enlace es **nuevo** — el
                      anterior queda muerto, porque de la base sólo se puede
                      sacar el hash. Un botón que dice "copiar" y en realidad
                      invalida el link que alguien ya mandó por WhatsApp miente
                      sobre lo único que hay que entender acá.

                      El copiado de verdad está abajo, en el bloque que aparece
                      con el enlace. */}
                  <form action={copyAction}>
                    <input type="hidden" name="invitationId" value={invitation.id} />
                    <Button type="submit" variant="outline" size="sm" disabled={busy}>
                      <Link2 className="size-3.5" />
                      Generar enlace
                    </Button>
                  </form>

                  <form action={resendAction}>
                    <input type="hidden" name="invitationId" value={invitation.id} />
                    <Button type="submit" variant="outline" size="sm" disabled={busy}>
                      <RotateCw className="size-3.5" />
                      Reenviar
                    </Button>
                  </form>

                  <form action={revokeAction}>
                    <input type="hidden" name="invitationId" value={invitation.id} />
                    <Button type="submit" variant="ghost" size="sm" disabled={busy}>
                      <Trash2 className="size-3.5" />
                      Cancelar
                    </Button>
                  </form>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
