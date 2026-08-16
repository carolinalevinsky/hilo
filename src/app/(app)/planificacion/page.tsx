import { ClipboardList, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatLongDate } from '@/lib/dates'
import { patientHex } from '@/lib/patient-colors'
import { formatTime } from '@/lib/week'
import { requireUser } from '@/server/auth'
import { planUpcoming } from '@/server/planning'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Planificación · Hilo' }

export default async function PlanningPage() {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)
  const sessions = await planUpcoming(user.id, practitioner.discipline)

  // One heading per day, so a week reads as a week rather than as a list.
  const byDate = new Map<string, typeof sessions>()
  for (const session of sessions) {
    const list = byDate.get(session.scheduledOn)
    if (list) list.push(session)
    else byDate.set(session.scheduledOn, [session])
  }

  return (
    <>
      <PageHeader
        title="Planificación"
        subtitle="Tus próximas sesiones, con el objetivo que menos se movió."
      />

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No hay sesiones en los próximos días"
            text="Agendá una sesión o cargá un horario fijo, y acá te dejamos la próxima casi armada: el objetivo más atrasado y un material para trabajarlo."
            action={
              <Button asChild>
                <Link href="/agenda">Ir a la agenda</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {[...byDate.entries()].map(([date, daySessions]) => (
            <section key={date}>
              <h2 className="mb-2 text-[13px] font-extrabold text-muted-foreground">
                {formatLongDate(date)}
              </h2>

              <ul className="grid gap-2.5 lg:grid-cols-2">
                {daySessions.map((session) => (
                  <li key={session.appointmentId}>
                    <Card className="h-full">
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <PatientAvatar
                            fullName={session.patientName}
                            color={session.patientColor}
                            size={36}
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/pacientes/${session.patientId}`}
                              className="text-[14px] font-bold hover:underline"
                            >
                              {session.patientName}
                            </Link>
                            <p className="text-[12px] text-muted-foreground">
                              {formatTime(session.startTime)}
                            </p>
                          </div>
                        </div>

                        {session.focus ? (
                          <div
                            className="rounded-xl border-l-4 bg-muted/60 px-3 py-2.5"
                            style={{ borderLeftColor: patientHex(session.patientColor) }}
                          >
                            <p className="text-[11px] font-bold text-muted-foreground uppercase">
                              Lo que menos se movió
                            </p>
                            <p className="text-[13.5px] font-bold">{session.focus.title}</p>
                            <p className="text-[12px] text-muted-foreground">
                              {session.focus.progress}% de avance
                            </p>
                          </div>
                        ) : (
                          <p className="text-[13px] text-muted-foreground">
                            Todavía no tiene objetivos cargados.{' '}
                            <Link
                              href={`/pacientes/${session.patientId}`}
                              className="font-semibold text-violet underline"
                            >
                              Agregá el primero
                            </Link>
                            .
                          </p>
                        )}

                        {session.suggestedMaterial ? (
                          <Link
                            href={`/materiales/${session.suggestedMaterial.id}`}
                            className="flex items-start gap-2 rounded-xl bg-violet-soft px-3 py-2.5 text-violet hover:opacity-90"
                          >
                            <Sparkles className="mt-0.5 size-4 shrink-0" />
                            <span className="min-w-0">
                              <span className="block text-[13px] font-bold">
                                {session.suggestedMaterial.title}
                              </span>
                              <span className="block text-[11.5px] opacity-85">
                                {session.suggestedMaterial.objective ??
                                  session.suggestedMaterial.area}
                              </span>
                            </span>
                          </Link>
                        ) : null}

                        <Button asChild variant="outline" size="sm">
                          <Link href={`/pacientes/${session.patientId}/sesiones/nueva`}>
                            Registrar esta sesión
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
