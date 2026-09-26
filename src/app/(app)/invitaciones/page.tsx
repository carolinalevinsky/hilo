import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { InvitationList } from '@/components/invitations/invitation-list'
import { InviteForm } from '@/components/invitations/invite-form'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { pageTitle } from '@/lib/brand'
import { listInvitations } from '@/server/invitations'

import { currentSession } from '../session'

export const metadata: Metadata = { title: pageTitle('Invitaciones') }

export default async function InvitationsPage() {
  const { practitioner } = await currentSession()

  // `notFound()` and not `redirect('/inicio')`: to somebody who is not an admin
  // this screen does not exist, and saying "no tenés permiso" would confirm that
  // there is a panel to have permission for. The real gate is in
  // `src/server/invitations.ts`, which checks again on every action.
  if (!practitioner.is_admin) notFound()

  const invitations = await listInvitations(practitioner.id)

  return (
    <>
      <PageHeader
        title="Invitaciones"
        subtitle="Ombúa es por invitación. Acá decidís quién entra."
      />

      {/* Las dos tarjetas pueden mostrar un enlace a la vez, y son enlaces
          distintos. Nombrarlas las separa para quien navega con lector de
          pantalla, que si no escucha dos bloques idénticos sin saber cuál es
          cuál. */}
      <Card className="mb-5" role="region" aria-label="Invitar a alguien">
        <CardHeader>
          <CardTitle>Invitar a alguien</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      <Card role="region" aria-label="Invitaciones enviadas">
        <CardHeader>
          <CardTitle>Invitaciones enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationList invitations={invitations} />
        </CardContent>
      </Card>
    </>
  )
}
