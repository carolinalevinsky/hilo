import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { formatLongDate } from '@/lib/dates'
import { formatTime } from '@/lib/week'
import { firstName, whatsappLink } from '@/lib/whatsapp'
import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * "Recordá los turnos de mañana", with one WhatsApp button per session.
 *
 * v1's (`legacy/index.html:1274-1289`), and one of the most-used things in it.
 * Reminding families the night before is what stops a no-show, WhatsApp is how
 * that conversation actually happens in Uruguay, and doing it by hand means
 * looking up four numbers and typing the same sentence four times.
 *
 * The card does not exist when tomorrow is empty. A card that says "no hay
 * nada" every Saturday is a card you learn to skip over on Thursday.
 *
 * Nothing clinical goes in the message — a name, a day and a time. It leaves in
 * a WhatsApp thread, which is an uncontrolled copy forever, and Ley N.º 18.331
 * is the reason that line is drawn here rather than argued about later.
 *
 * ─── The row that cannot be reminded ──────────────────────────────────────
 *
 * A patient with no phone on record used to get the same green "Recordar", one
 * line under the words *sin teléfono cargado*. `whatsappLink` falls back to
 * `https://wa.me/?text=…` — no number — so the button opened WhatsApp with no
 * recipient and the practitioner had to work out why.
 *
 * The fallback itself is right and stays: `booking-link.tsx` uses it on purpose,
 * to send a link to whoever you pick in WhatsApp. It is wrong here, where the
 * row already knows exactly who it is about. So the row says what is missing
 * and offers the way to fix it, which is the same move as "Sin cargar:" on the
 * ficha and "Sin honorario" in Cobros.
 */
export function TomorrowReminders({
  date,
  appointments,
  phoneOf,
}: {
  date: string
  appointments: AppointmentWithPatient[]
  phoneOf: Map<string, string | null>
}) {
  const upcoming = appointments.filter(
    (appointment) => appointment.status !== 'cancelled' && appointment.patients,
  )
  if (upcoming.length === 0) return null

  const dayLabel = formatLongDate(date) ?? ''

  return (
    <Card className="mb-3.5">
      <CardHeader>
        <CardTitle>Recordá los turnos de mañana</CardTitle>
        {/* "lunes, 17 de agosto" comes back lower-cased from `toLocaleDateString`,
            which is correct Spanish inside a sentence and wrong as a heading.
            `capitalize` would give "Lunes, 17 De Agosto". */}
        <p className="text-meta text-muted-foreground first-letter:uppercase">
          {dayLabel}
        </p>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {upcoming.map((appointment) => {
            const patient = appointment.patients!
            const phone = phoneOf.get(patient.id) ?? null
            const time = formatTime(appointment.start_time)
            const message = `¡Hola! Te recuerdo la sesión de ${firstName(patient.full_name)} mañana ${dayLabel} a las ${time}. Cualquier cosa avisame. ¡Saludos!`

            return (
              <li
                key={appointment.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <PatientAvatar
                  fullName={patient.full_name}
                  color={patient.color}
                  size={38}
                />

                <div className="min-w-[120px] flex-1">
                  <p className="text-body font-bold">
                    {firstName(patient.full_name)}
                    <span className="font-medium text-muted-foreground"> · {time}</span>
                  </p>
                  <p className="text-meta text-muted-foreground">
                    {phone ?? 'sin teléfono cargado'}
                  </p>
                </div>

                {phone ? (
                  <a
                    href={whatsappLink(phone, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#25d366] px-3.5 py-2 text-meta font-bold text-white hover:opacity-90"
                  >
                    Recordar
                  </a>
                ) : (
                  <Link
                    href={`/pacientes/${patient.id}/editar`}
                    className="rounded-full border border-border px-3.5 py-2 text-meta font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Cargar teléfono
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
