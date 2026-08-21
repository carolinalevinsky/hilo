import { BookOpen, Check, FileText, Sparkles, Target } from '@/components/icons'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * "Primeros pasos" — v1's onboarding card (`legacy/index.html:1033`), and the
 * only thing standing between a new practitioner and six empty screens.
 *
 * Two steps, as in v1, and they are the two that unlock everything else: a
 * patient to write about, and one session written. Not five — a checklist long
 * enough to feel like work is a checklist nobody finishes.
 *
 * ─── Why the library is here and is not a step ────────────────────────────
 *
 * Walking the app as a new account makes one thing obvious: **every screen
 * funnels to "cargá tu primer paciente"**, six times over, and the first thing
 * Hilo asks anybody to do is type a real child's name into software they have
 * used for ninety seconds. That is a reasonable thing to hesitate over, and
 * hesitating leaves you with nothing to look at.
 *
 * Except it does not, because the library already has materials for their
 * discipline on the day they sign up. That is the one piece of real, present-
 * tense value available before any data is entered — so it goes on this card,
 * below the steps, worded as a fact rather than a task. It is deliberately not
 * numbered: nothing about it is required, and making it step three would make
 * the checklist longer for no reason.
 *
 * **The card removes itself** once both steps are done, which is what keeps it
 * from becoming furniture. There is no dismiss button, because there is nothing
 * to dismiss for more than a day or two.
 */
export function FirstSteps({
  hasPatient,
  hasSession,
  firstPatientId,
  materialCount,
  disciplineLabel,
}: {
  hasPatient: boolean
  hasSession: boolean
  /** Where "Registrá tu primera sesión" points, once there is somebody to write about. */
  firstPatientId: string | null
  materialCount: number
  /** "Fonoaudiología", to be lowercased into running text. */
  disciplineLabel: string
}) {
  if (hasPatient && hasSession) return null

  const done = [hasPatient, hasSession].filter(Boolean).length

  return (
    <Card className="mb-4 border-violet">
      <CardContent className="px-5 py-4.5">
        <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-extrabold">Primeros pasos</h2>
          <span className="text-[12.5px] text-muted-foreground">{done} de 2</span>
        </div>
        <p className="mb-3 text-[12.5px] text-muted-foreground">
          Dos pasos para empezar a usar Hilo.
        </p>

        <Step
          done={hasPatient}
          number={1}
          title="Cargá tu primer paciente"
          text="Nombre, edad y motivo de consulta. Se hace una sola vez y la ficha queda guardada para siempre."
          action={
            <Button asChild size="sm">
              <Link href="/pacientes/nuevo">Cargar paciente</Link>
            </Button>
          }
        />

        <Step
          done={hasSession}
          number={2}
          title="Registrá tu primera sesión"
          text="Anotá cómo salió, o dictala por voz, y Hilo empieza el seguimiento."
          action={
            firstPatientId ? (
              <Button asChild size="sm">
                <Link href={`/pacientes/${firstPatientId}/sesiones/nueva`}>
                  Registrar sesión
                </Link>
              </Button>
            ) : (
              // Said rather than left blank: an inert row reads as broken, and
              // "after the first one" reads as a sequence.
              <span className="shrink-0 text-[12px] text-muted-foreground">
                Después del paso 1
              </span>
            )
          }
        />

        {/* Something to do right now that needs no patient. See above. */}
        {materialCount > 0 ? (
          <Link
            href="/materiales"
            className="mt-3 flex items-center gap-2.5 rounded-xl bg-violet-soft px-3 py-2.5 text-[12.5px] leading-relaxed text-violet transition-opacity hover:opacity-85"
          >
            <BookOpen className="size-4 shrink-0" />
            <span>
              Mientras tanto, tu biblioteca ya tiene{' '}
              <b>
                {materialCount} {materialCount === 1 ? 'material' : 'materiales'} de{' '}
                {disciplineLabel.toLowerCase()}
              </b>{' '}
              para usar hoy.
            </span>
            <span className="ml-auto shrink-0 font-bold">Ver →</span>
          </Link>
        ) : null}

        {/* v1 closed the card with what all this is *for*. It is the answer to
            "why am I typing this in", and it is the reason somebody finishes
            step two instead of leaving. */}
        <div className="mt-4 border-t border-border pt-3.5">
          <p className="mb-2 text-[12.5px] text-muted-foreground">
            Con lo que cargás, Hilo te arma:
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            <Promise icon={FileText} text="Informes para el colegio o la mutualista" />
            <Promise icon={Target} text="El seguimiento de cada objetivo" />
            <Promise icon={Sparkles} text="La próxima sesión, casi lista" />
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function Step({
  done,
  number,
  title,
  text,
  action,
}: {
  done: boolean
  number: number
  title: string
  text: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-2.5 last:border-b-0">
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-extrabold',
          done ? 'bg-green-soft text-[#1a8f57]' : 'bg-violet-soft text-violet',
        )}
      >
        {done ? <Check className="size-4" /> : number}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[14.5px] font-bold',
            done && 'text-muted-foreground line-through',
          )}
        >
          {title}
        </p>
        {done ? null : (
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{text}</p>
        )}
      </div>

      {done ? null : action}
    </div>
  )
}

function Promise({
  icon: Icon,
  text,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement
  text: string
}) {
  return (
    <li className="flex items-start gap-2 rounded-xl bg-muted/60 px-2.5 py-2 text-[12px] leading-snug">
      <Icon className="mt-0.5 size-4 shrink-0 text-violet" />
      {text}
    </li>
  )
}
