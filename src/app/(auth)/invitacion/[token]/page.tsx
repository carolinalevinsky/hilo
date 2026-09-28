import type { Metadata } from 'next'
import Link from 'next/link'

import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form'
import { pageTitle } from '@/lib/brand'
import { disciplineLabel } from '@/lib/disciplines'
import { invitationByToken } from '@/server/invitations'

export const metadata: Metadata = { title: pageTitle('Tu invitación') }

/**
 * Where an invitation link lands. **Reachable signed out** — see
 * `PUBLIC_PREFIXES` in `src/proxy.ts`.
 *
 * The account does not exist yet. It is created by the action below this form,
 * which is the only moment anything is written to `auth.users` — so an
 * invitation that is never opened leaves nothing behind, and a link that went to
 * the wrong address can be cancelled without deleting anybody.
 */
export default async function InvitationPage({ params }: PageProps<'/invitacion/[token]'>) {
  const { token } = await params
  const invitation = await invitationByToken(token)

  // One screen for expired, already used, revoked and invented, and no way to
  // tell them apart. Distinguishing them would tell a stranger which addresses
  // were invited here — the same reason `/entrar` does not separate "no such
  // account" from "wrong password".
  if (!invitation) {
    return (
      <>
        <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.8px]">
          Esa invitación no funciona
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Puede que haya vencido, que ya la hayas usado o que el enlace se haya cortado al
          copiarlo. Pedile una nueva a quien te invitó.
        </p>
        <p className="mt-5 text-center text-meta text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link href="/entrar" className="text-violet underline">
            Entrá acá
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.8px]">
        Hola, {invitation.fullName}
      </h1>
      <p className="mt-2 mb-7 text-sm leading-relaxed text-muted-foreground">
        Te invitaron a Ombúa. Elegí una contraseña y ya entrás a tu espacio de trabajo.
      </p>

      <dl className="mb-5 rounded-[14px] bg-muted px-3.5 py-3 text-meta">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Tu correo</dt>
          <dd className="truncate font-semibold">{invitation.email}</dd>
        </div>
        <div className="mt-1 flex justify-between gap-3">
          <dt className="text-muted-foreground">Tu profesión</dt>
          <dd className="truncate font-semibold">{disciplineLabel(invitation.discipline)}</dd>
        </div>
      </dl>

      <AcceptInvitationForm token={token} />

      <p className="mt-5 text-center text-micro text-muted-foreground">
        Tus datos están protegidos y encriptados.
      </p>
    </>
  )
}
