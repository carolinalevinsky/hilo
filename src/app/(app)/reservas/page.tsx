import { Inbox, UserPlus } from '@/components/icons'
import type { Metadata } from 'next'

import { BookingLink } from '@/components/booking/booking-link'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/dates'
import { publicConfig } from '@/lib/env'
import { weekdayName } from '@/lib/week'
import { requireUser } from '@/server/auth'
import { listBookingRequests } from '@/server/booking'
import { getPractitioner } from '@/server/practitioners'

import { confirmBookingAction, dismissBookingAction } from './actions'

export const metadata: Metadata = { title: 'Reservas · Hilo' }

export default async function BookingsPage() {
  const user = await requireUser()

  const [practitioner, requests] = await Promise.all([
    getPractitioner(user.id),
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
            <ul className="divide-y divide-border">
              {pending.map((request) => (
                <li key={request.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-[180px] flex-1">
                    <p className="text-[14px] font-bold">{request.name}</p>
                    <p className="text-[12.5px] text-muted-foreground">
                      {request.phone}
                      {request.preferred_weekday !== null
                        ? ` · pidió ${weekdayName(request.preferred_weekday).toLowerCase()}`
                        : ''}
                      {request.preferred_time ? ` ${request.preferred_time.slice(0, 5)}` : ''}
                      {' · '}
                      {formatDate(request.created_at)}
                    </p>
                    {request.note ? (
                      <p className="mt-1 text-[13px] leading-relaxed">{request.note}</p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <form action={confirmBookingAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" size="sm">
                        <UserPlus className="size-3.5" />
                        Convertir en paciente
                      </Button>
                    </form>
                    <form action={dismissBookingAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Descartar
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
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
