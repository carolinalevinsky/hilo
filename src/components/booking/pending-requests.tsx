import { UserPlus } from '@/components/icons'

import { confirmBookingAction, dismissBookingAction } from '@/app/(app)/reservas/actions'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/dates'
import { weekdayName } from '@/lib/week'
import type { BookingRequestWithPatient } from '@/server/booking'

/**
 * The requests waiting to be answered — one component, rendered in both places
 * they appear.
 *
 * v1 answered these where you saw them (`legacy/index.html:1499`): the card sat
 * on top of the Agenda and the two buttons were right there. v2 showed a count
 * and a link to another screen, which is a worse trade than it looks — a family
 * waiting on an answer is exactly the thing you deal with in the ten seconds you
 * have, and "go somewhere else first" is how it becomes tomorrow's job.
 *
 * A plain Server Component with `<form action={…}>` inside: no client JavaScript,
 * and the same markup on both screens rather than two copies that drift.
 */
export function PendingBookingRequests({
  requests,
}: {
  requests: BookingRequestWithPatient[]
}) {
  return (
    <ul className="divide-y divide-border">
      {requests.map((request) => (
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
  )
}
