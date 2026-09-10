import { TriangleAlert, User, Wallet } from '@/components/icons'
import Link from 'next/link'

import { PatientAvatar } from '@/components/patients/patient-avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/week'
import type { TodaySession } from '@/server/planning'

/**
 * One of today's sessions, on the home screen.
 *
 * Ported from v1's `.hoycard` (`legacy/index.html:1088-1101`), and it is the
 * densest card in the product on purpose. Somebody reads this standing up, in
 * the two minutes between one patient leaving and the next arriving, and the
 * three things they need are always the same: what happened last time, what to
 * push on today, and whether anything is off. A row with a name and a time —
 * which is what v2 had — tells them nothing they did not already know.
 *
 * The summary reads as sentences rather than fields, with the labels small and
 * grey in front of them, because it is meant to be *read*, not scanned like a
 * form.
 */

const ALERT_CLASSES: Record<TodaySession['alerts'][number]['kind'], string> = {
  goal: 'bg-amber-soft text-[#8a5a00]',
  payment: 'bg-coral-soft text-[#c0392b]',
}

const ALERT_ICONS = {
  goal: TriangleAlert,
  payment: Wallet,
}

export function TodaySessionCard({
  session,
  ageLabel,
}: {
  session: TodaySession
  ageLabel?: string | null
}) {
  return (
    <div className="mb-3 rounded-2xl border border-border bg-card px-4 py-3.5 last:mb-0">
      {/* ─── Por qué el nombre baja de renglón en teléfono ──────────────────
          Esta fila mide 281 px adentro de la tarjeta de Inicio, no 375: la
          página tiene su margen, la tarjeta el suyo y ésta el suyo. La hora se
          lleva 46, el avatar 38, el botón 79 y los espacios 36 — al nombre le
          quedaban 82 y necesitaba 237. "Renata Fernández Olivera · 11 años"
          aparecía como "Renata …".

          Acortar la etiqueta del botón no alcanzaba: le devolvía nueve píxeles.
          Así que abajo de `sm` el nombre se lleva la línea entera y la hora, la
          cara y el botón se quedan arriba. En escritorio, donde entra, no
          cambia nada. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[46px] shrink-0 text-item font-extrabold text-violet tabular-nums">
          {formatTime(session.startTime)}
        </div>

        <PatientAvatar
          fullName={session.patientName}
          color={session.patientColor}
          size={38}
        />

        <div className="min-w-0 flex-1 max-sm:order-last max-sm:w-full max-sm:flex-none">
          <p className="truncate text-item font-bold">
            {session.patientName}
            {ageLabel ? (
              <span className="text-body font-medium text-muted-foreground">
                {' · '}
                {ageLabel}
              </span>
            ) : null}
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="max-sm:ml-auto">
          <Link href={`/pacientes/${session.patientId}`}>
            <User className="size-4" />
            Abrir ficha
          </Link>
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-body leading-[1.55] text-[#4a5163]">
        {session.lastNote ? (
          <p>
            <Label>Última vez</Label>
            {session.lastNote}
          </p>
        ) : null}

        {session.focus ? (
          <p>
            <Label>Para hoy</Label>
            priorizar <b className="font-bold text-foreground">{session.focus.title}</b> (
            {session.focus.progress}%)
            {session.suggestedMaterial ? (
              <>
                {' · '}
                <Link
                  href={`/materiales/${session.suggestedMaterial.id}`}
                  className="font-semibold text-violet underline"
                >
                  {session.suggestedMaterial.title}
                </Link>
              </>
            ) : null}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Todavía no tiene objetivos.{' '}
            <Link
              href={`/pacientes/${session.patientId}`}
              className="font-semibold text-violet underline"
            >
              Cargá el primero
            </Link>
            .
          </p>
        )}
      </div>

      {session.alerts.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {session.alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.kind]
            return (
              <span
                key={alert.kind}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-micro font-semibold',
                  ALERT_CLASSES[alert.kind],
                )}
              >
                <Icon className="size-3.5" />
                {alert.text}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-[7px] inline-block text-micro font-bold tracking-[0.4px] text-muted-foreground uppercase">
      {children}
    </span>
  )
}
