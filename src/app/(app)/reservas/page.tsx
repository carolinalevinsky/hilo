import { Inbox } from '@/components/icons'
import type { Metadata } from 'next'

import { BookingLink } from '@/components/booking/booking-link'
import { PendingBookingRequests } from '@/components/booking/pending-requests'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/dates'
import { publicConfig } from '@/lib/env'
import { listBookingRequests } from '@/server/booking'

import { currentPractitioner, currentUser } from '../session'

export const metadata: Metadata = { title: 'Reservas · Hilo' }

export default async function BookingsPage() {
  const user = await currentUser()

  const [practitioner, requests] = await Promise.all([
    currentPractitioner(user.id),
    listBookingRequests(user.id),
  ])

  const pending = requests.filter((request) => request.status === 'pending')
  const handled = requests.filter((request) => request.status !== 'pending')

  return (
    <>
      <PageHeader
        title="Reservas"
        subtitle="Las familias que pidieron un turno desde tu link."
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Tu link para reservar</CardTitle>
        </CardHeader>
        <CardContent>
          {practitioner.slug ? (
            <BookingLink
              url={`${publicConfig.NEXT_PUBLIC_APP_URL}/reservar/${practitioner.slug}`}
              practitionerName={practitioner.full_name}
            />
          ) : (
            <p className="text-[13px] text-muted-foreground">
              Todavía no tenés un link. Escribinos y te lo activamos.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Sin confirmar</CardTitle>
          <p className="text-[12.5px] text-muted-foreground">
            {pending.length === 0
              ? 'Nada pendiente'
              : pending.length === 1
                ? '1 solicitud'
                : `${pending.length} solicitudes`}
          </p>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No hay solicitudes nuevas"
              text="Cuando alguien complete tu link de reserva, va a aparecer acá y te va a llegar un mail."
            />
          ) : (
            <PendingBookingRequests requests={pending} />
          )}
        </CardContent>
      </Card>

      {handled.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ya resueltas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {handled.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-2 py-2 text-[13px]"
                >
                  <span>
                    <b>{request.name}</b> · {formatDate(request.created_at)}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {request.status === 'confirmed'
                      ? (request.patients?.full_name ?? 'Confirmada')
                      : 'Descartada'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}
