import { BookOpen, Check } from '@/components/icons'
import Link from 'next/link'

import { setAppointmentFocusAction, setAppointmentStatusAction } from '@/app/(app)/agenda/actions'
import { FocusSelect } from '@/components/agenda/focus-select'
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
 * Two things differ from v1, both because v1 kept its state in memory:
 *
 *   - **The goal you pick is kept.** v1 reset every row to the lowest-scoring
 *     goal on each reload, which made choosing feel pointless.
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
        <p className="text-[12.5px] text-muted-foreground">
          {sessions.length === 0
            ? 'Sin sesiones esta semana.'
            : `${done}/${sessions.length} dadas · elegí el objetivo de cada sesión y marcá cuando la des`}
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

                  <span className="w-[74px] shrink-0 text-[13px] text-muted-foreground">
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
                      'min-w-[90px] flex-1 text-[14px] font-bold hover:underline',
                      attended && 'line-through',
                    )}
                  >
                    {session.patientName}
                  </Link>

                  {session.goals.length === 0 ? (
                    <span className="text-[12.5px] text-muted-foreground">
                      Sin objetivos cargados
                    </span>
                  ) : (
                    <form
                      action={setAppointmentFocusAction}
                      className="min-w-[180px] flex-1"
                    >
                      <input
                        type="hidden"
                        name="appointmentId"
                        value={session.appointmentId}
                      />
                      <FocusSelect
                        name="goalId"
                        defaultValue={session.focus?.id ?? ''}
                        label={`Objetivo de la sesión de ${session.patientName}`}
                        options={session.goals}
                      />
                    </form>
                  )}

                  {session.suggestedMaterial ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/materiales/${session.suggestedMaterial.id}`}>
                        <BookOpen className="size-3.5" />
                        Material
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-[12.5px] text-muted-foreground">Sin objetivo</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
