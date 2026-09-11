import { BookOpen, Check, ClipboardList, Pencil } from '@/components/icons'
import Link from 'next/link'

import { setAppointmentStatusAction } from '@/app/(app)/agenda/actions'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTime, weekdayName } from '@/lib/week'
import { cn } from '@/lib/utils'
import type { PlannedSession } from '@/server/planning'

/**
 * "Plan de la semana" — v1's panel under the agenda grid
 * (`legacy/index.html:1498`).
 *
 * One row per session of the week: who, when, which goal it is for, the material
 * that fits it, and a tick for when you have given it. It is the week read as
 * work rather than as a calendar — the grid answers "when am I busy", this
 * answers "what am I doing in each of these".
 *
 * What differs from v1:
 *
 *   - **It shows what you prepared, not a second planner (P14).** This row used
 *     to carry its own goal picker, saved on the appointment (`focus_goal_id`),
 *     while Planificación kept a separate list per patient; picking in one
 *     changed nothing in the other, and Thomas's QA could not tell what either
 *     was for. Now the row shows the session's plan — the same rows the planner
 *     writes — and "Preparar" / "Editar" open the planner on this session. The
 *     goal comes from the plan (`planForRange`). The picker (`FocusSelect`) and
 *     its action are hidden, not deleted: a pick already made still counts until
 *     a plan says otherwise.
 *   - **The tick is the appointment's own status**, the same "Vino" the card
 *     menu sets, rather than a separate checkbox that knew nothing about it.
 *     One session, one truth about whether it happened.
 */
export function WeekPlan({ sessions }: { sessions: PlannedSession[] }) {
  const done = sessions.filter((session) => session.status === 'attended').length

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Plan de la semana</CardTitle>
        <p className="text-meta text-muted-foreground">
          {sessions.length === 0
            ? 'Sin sesiones esta semana.'
            : `${done}/${sessions.length} dadas · prepará cada sesión y marcá cuando la des`}
        </p>
      </CardHeader>

      <CardContent>
        {sessions.length === 0 ? null : (
          <ul className="divide-y divide-border">
            {sessions.map((session) => {
              const attended = session.status === 'attended'

              return (
                <li
                  key={session.appointmentId}
                  className={cn(
                    'flex flex-wrap items-center gap-2.5 py-2.5',
                    attended && 'opacity-55',
                  )}
                >
                  <form action={setAppointmentStatusAction}>
                    <input
                      type="hidden"
                      name="appointmentId"
                      value={session.appointmentId}
                    />
                    <input
                      type="hidden"
                      name="status"
                      value={attended ? 'scheduled' : 'attended'}
                    />
                    <button
                      type="submit"
                      aria-label={
                        attended
                          ? `Marcar la sesión de ${session.patientName} como no dada`
                          : `Marcar la sesión de ${session.patientName} como dada`
                      }
                      className={cn(
                        'flex size-[22px] items-center justify-center rounded-md border transition-colors',
                        attended
                          ? 'border-green bg-green text-white'
                          : 'border-border hover:border-violet',
                      )}
                    >
                      {attended ? <Check className="size-3.5" /> : null}
                    </button>
                  </form>

                  <span className="w-[74px] shrink-0 text-body text-muted-foreground">
                    <b className="text-foreground">
                      {weekdayName(new Date(`${session.scheduledOn}T12:00:00`).getDay())
                        .slice(0, 3)
                        .toLowerCase()}
                    </b>{' '}
                    {formatTime(session.startTime)}
                  </span>

                  <PatientAvatar
                    fullName={session.patientName}
                    color={session.patientColor}
                    size={34}
                  />

                  <Link
                    href={`/pacientes/${session.patientId}`}
                    className={cn(
                      'min-w-[90px] flex-1 text-item font-bold hover:underline',
                      attended && 'line-through',
                    )}
                  >
                    {session.patientName}
                  </Link>

                  {/* What is prepared for this session, or what Hilo would
                      start from. One line: the whole list is one click away. */}
                  <p className="min-w-[180px] flex-1 truncate text-meta">
                    {session.plan.length > 0 ? (
                      <>
                        <b className="font-semibold">Preparada:</b>{' '}
                        {session.plan.map((line) => line.title).join(' · ')}
                      </>
                    ) : session.focus ? (
                      <span className="text-muted-foreground">
                        Sin preparar · Hilo sugiere {session.focus.title} (
                        {session.focus.progress}%)
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Sin preparar · sin objetivos cargados
                      </span>
                    )}
                  </p>

                  <Button asChild size="sm" variant={session.plan.length > 0 ? 'outline' : 'default'}>
                    <Link href={`/planificacion?sesion=${session.appointmentId}`}>
                      {session.plan.length > 0 ? (
                        <Pencil className="size-3.5" />
                      ) : (
                        <ClipboardList className="size-3.5" />
                      )}
                      {session.plan.length > 0 ? 'Editar' : 'Preparar'}
                    </Link>
                  </Button>

                  {session.suggestedMaterial ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/materiales/${session.suggestedMaterial.id}`}>
                        <BookOpen className="size-3.5" />
                        Material
                      </Link>
                    </Button>
                  ) : null}
                  {/* Nothing in the material's place when there is none: the
                      line beside it already says "sin objetivos cargados", and
                      "Sin objetivo" here said it a second time. */}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
