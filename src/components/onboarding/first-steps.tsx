import { Check, FileText, Sparkles, Target } from '@/components/icons'
import Link from 'next/link'

import { openPaymentsStepAction } from '@/app/(app)/inicio/actions'
import { TourButton } from '@/components/onboarding/app-tour'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * "Primeros pasos" — v1's onboarding card (`legacy/index.html:1033`), and the
 * only thing standing between a new practitioner and six empty screens.
 *
 * ─── Each step opens the real screen ───────────────────────────────────────
 *
 * For a while every step was done right here, in a small form of its own (P21).
 * Carolina, using it: "esto no tiene sentido, no es como funciona la app". The
 * small forms were a second way of doing each thing that exists nowhere else.
 *
 * So a step is a sentence and a button. The button opens the screen where that
 * thing is always done, which says what to do there (`StepHint`), and saving
 * brings you back here with the step crossed out — the Server Action decides
 * that, from `src/server/first-steps.ts`. What P21 asked for and stays: nothing
 * to tick by hand, each step crosses itself out.
 *
 * ─── The three steps ───────────────────────────────────────────────────────
 *
 * Carolina's, 2026-10-07: a patient, a planned session, and a look at Pagos.
 * There were four before — patient, goal, scheduling, a record — which is the
 * clinical order but is also four screens before anything feels done. These
 * three are the product's shape: somebody to see, what you will do with them,
 * and what it is worth. The third is a visit rather than a save, so its
 * button is an action that remembers the visit (`openPaymentsStepAction`).
 *
 * One step is open at a time, the first one not done. The rest are listed so
 * the road is visible, without a button.
 *
 * ─── When it goes away ─────────────────────────────────────────────────────
 *
 * **The card removes itself** once the three are done, which keeps it from
 * becoming furniture; there is no dismiss button.
 */
export function FirstSteps({
  hasPatient,
  hasPlan,
  hasSeenPayments,
}: {
  hasPatient: boolean
  hasPlan: boolean
  hasSeenPayments: boolean
}) {
  if (hasPatient && hasPlan && hasSeenPayments) return null

  const steps = [hasPatient, hasPlan, hasSeenPayments]
  const done = steps.filter(Boolean).length
  // The one that is open. Never -1: the card is gone when all of them are done.
  const current = steps.indexOf(false) + 1

  return (
    <Card className="mb-4 border-violet">
      <CardContent className="px-5 py-4.5">
        <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-extrabold">Primeros pasos</h2>
          <span className="text-meta text-muted-foreground">
            {done} de {steps.length}
          </span>
        </div>
        <p className="mb-3 text-meta text-muted-foreground">
          Tres pasos para empezar. Cada uno te lleva a la pantalla donde se hace, y al
          terminar volvés acá.
        </p>

        <Step
          done={hasPatient}
          open={current === 1}
          number={1}
          title="Cargá tu primer paciente"
          text="En su ficha ponés el nombre, qué van a trabajar y qué día viene. Con eso la sesión aparece sola en tu Agenda."
          action={<StepLink href="/pacientes/nuevo?pasos=paciente">Cargar paciente</StepLink>}
        />

        <Step
          done={hasPlan}
          open={current === 2}
          number={2}
          title="Planificá una sesión"
          text="Elegís al paciente, Ombúa te sugiere sus objetivos y materiales de tu biblioteca, y con «Agregar» pasan al plan de ese día."
          action={<StepLink href="/planificacion?pasos=planificar">Planificar sesión</StepLink>}
        />

        <Step
          done={hasSeenPayments}
          open={current === 3}
          number={3}
          title="Mirá tus pagos"
          text="Quién pagó y quién debe, mes a mes. Anotás cada pago cuando llega y el mes se cuenta solo."
          action={
            <form action={openPaymentsStepAction}>
              <Button type="submit" size="sm">
                Ver pagos →
              </Button>
            </form>
          }
        />

        {/* v1 closed the card with what all this is *for*. It is the answer to
            "why am I typing this in", and it is the reason somebody finishes
            the steps instead of leaving. */}
        <div className="mt-4 border-t border-border pt-3.5">
          {/* The tour runs itself on the first visit and then never again. This
              is its only way back, and it lives here because this card is the
              one thing on the screen that is already about getting started. */}
          <p className="mb-3 text-meta text-muted-foreground">
            ¿Querés que te muestre dónde está cada cosa?{' '}
            <TourButton>Ver el recorrido</TourButton>
          </p>

          {/* "Ombúa arma", never "Ombúa te arma": the product's voice is one
              that does things, not one that does them for you. Carolina. */}
          <p className="mb-2 text-meta text-muted-foreground">Con lo que cargás, Ombúa arma:</p>
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

function StepLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild size="sm">
      <Link href={href}>{children} →</Link>
    </Button>
  )
}

/**
 * One step. Done, it collapses to its title, crossed out, with a check. Open,
 * it says what it is for and has the button that goes and does it. Still ahead,
 * it says the same thing without the button and a shade quieter — it is there
 * to show the road, and an inert row with no words reads as broken.
 */
function Step({
  done,
  open,
  number,
  title,
  text,
  action,
}: {
  done: boolean
  open: boolean
  number: number
  title: string
  text: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5 border-b border-border py-2.5 last:border-b-0">
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-meta font-extrabold',
          done
            ? 'bg-green-soft text-green-ink'
            : open
              ? 'bg-violet-soft text-violet'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {done ? <Check className="size-4" /> : number}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={cn(
            'text-item font-bold',
            done && 'text-muted-foreground line-through',
            !done && !open && 'text-muted-foreground',
          )}
        >
          {title}
        </p>
        {done ? null : (
          <>
            <p className="mt-0.5 text-meta text-muted-foreground">{text}</p>
            {open && action ? <div className="mt-2">{action}</div> : null}
          </>
        )}
      </div>
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
    <li className="flex items-start gap-2 rounded-xl bg-muted/60 px-2.5 py-2 text-meta leading-snug">
      <Icon className="mt-0.5 size-4 shrink-0 text-violet" />
      {text}
    </li>
  )
}
