import { ChevronRight, TriangleAlert, User, Wallet } from '@/components/icons'
import Link from 'next/link'

import { PatientAvatar } from '@/components/patients/patient-avatar'
import { buttonVariants } from '@/components/ui/button'
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
  payment: 'bg-coral-soft text-coral-ink',
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
    <div className="mb-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 last:mb-0 sm:mb-3 sm:px-4 sm:py-3.5">
      {/* ─── Toda la fila lleva a la ficha ───────────────────────────────────
          En teléfono esta fila mide 281 px y no entraban hora, cara, nombre y
          un botón "Abrir ficha": el nombre bajaba a un renglón propio y cada
          sesión de hoy ocupaba media pantalla. Ahora la fila entera es el
          link, y en teléfono la cara y el botón se cambian por una flecha — el
          gesto que toda lista de un celular entiende como "entrar". El nombre
          se queda con el ancho. */}
      <Link
        href={`/pacientes/${session.patientId}`}
        className="group flex items-center gap-3"
      >
        <div className="w-[46px] shrink-0 text-item font-extrabold text-violet tabular-nums">
          {formatTime(session.startTime)}
        </div>

        <PatientAvatar
          fullName={session.patientName}
          color={session.patientColor}
          size={38}
          className="max-sm:hidden"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-item font-bold group-hover:underline">
            {session.patientName}
            {ageLabel ? (
              <span className="text-body font-medium text-muted-foreground">
                {' · '}
                {ageLabel}
              </span>
            ) : null}
          </p>
        </div>

        <span
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'max-sm:hidden',
          )}
        >
          <User className="size-4" />
          Abrir ficha
        </span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground sm:hidden" />
      </Link>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-body leading-[1.55] text-[#4a5163]">
        {session.lastNote ? (
          <p className="max-sm:line-clamp-2">
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
