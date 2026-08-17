import { Pencil } from '@/components/icons'
import Link from 'next/link'

import { formatDate } from '@/lib/dates'
import type { SessionWithGoals } from '@/server/sessions'

/**
 * The history of sessions, newest first. v1's timeline
 * (`legacy/index.html:1196`), with the dates now real.
 *
 * The private note is shown, marked. It belongs to the practitioner and it is
 * their screen — what matters is that it is visibly separate, so nothing written
 * "for me" ever ends up pasted into a report by accident.
 */
export function SessionTimeline({
  patientId,
  sessions,
}: {
  patientId: string
  sessions: SessionWithGoals[]
}) {
  if (sessions.length === 0) {
    return (
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Todavía no registraste sesiones. La primera que cargues empieza la historia clínica.
      </p>
    )
  }

  return (
    <ol className="space-y-4 border-l-2 border-border pl-4">
      {sessions.map((session) => (
        <li key={session.id} className="relative">
          <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-violet" />

          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[12.5px] font-bold text-muted-foreground">
              {formatDate(session.held_on)}
            </p>
            <Link
              href={`/pacientes/${patientId}/sesiones/${session.id}`}
              aria-label="Editar sesión"
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </Link>
          </div>

          {session.progress_note ? (
            <p className="mt-0.5 text-[14px] leading-relaxed">{session.progress_note}</p>
          ) : null}

          {session.session_goals.length > 0 ? (
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {session.session_goals.map((link) => (
                <li
                  key={link.goal_id}
                  className="rounded-full bg-violet-soft px-2.5 py-1 text-[11px] font-bold text-violet"
                >
                  {link.goals?.title ?? 'Objetivo'}
                </li>
              ))}
            </ul>
          ) : null}

          {session.private_note ? (
            <p className="mt-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-[12.5px] text-muted-foreground">
              <span className="font-bold">Nota privada:</span> {session.private_note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
