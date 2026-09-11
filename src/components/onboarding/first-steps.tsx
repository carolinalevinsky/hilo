import { BookOpen, Check, FileText, Sparkles, Target } from '@/components/icons'
import Link from 'next/link'

import { TourButton } from '@/components/onboarding/app-tour'
import {
  AppointmentStepForm,
  GoalStepForm,
  PatientStepForm,
  RecordStepForm,
} from '@/components/onboarding/step-forms'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * "Primeros pasos" — v1's onboarding card (`legacy/index.html:1033`), and the
 * only thing standing between a new practitioner and six empty screens.
 *
 * ─── Each step is done here (P21) ──────────────────────────────────────────
 *
 * Thomas's QA: the card listed things and sent you elsewhere to do each one — a
 * list of chores with links. Carolina chose that every step be doable right
 * here, and cross itself out when it is done. So each open step carries a small
 * form (`step-forms.tsx`) with the fewest fields that make sense on day one, and
 * a link to the full screen for anybody who wants it.
 *
 * Four steps, in the order a first week goes: somebody to see, what you are
 * working on with them, when you see them, and what happened. The goal comes
 * before the session because everything that makes Hilo more than a notebook
 * hangs off a goal — the progress chart, the material the planner suggests, most
 * of what a report is built from — and because the record of the first session
 * can then say which goal it worked.
 *
 * ─── When it goes away ─────────────────────────────────────────────────────
 *
 * **The card removes itself** once the steps are done, which keeps it from
 * becoming furniture; there is no dismiss button. "Done" is patient, goal and
 * record: the scheduling step was added in P21, and accounts that finished the
 * three steps before it must not see the card come back to ask for the fourth.
 * For a new account the steps go in order, so by the time there is a record
 * there is almost always something scheduled.
 *
 * ─── Why the library is here and is not a step ────────────────────────────
 *
 * Every screen funnels to "cargá tu primer paciente", and typing a real child's
 * name into software you have used for ninety seconds is a reasonable thing to
 * hesitate over. The library already has materials for their discipline on the
 * day they sign up — the one piece of present-tense value available before any
 * data is entered — so it sits below the steps, worded as a fact, not a task.
 */
export function FirstSteps({
  hasPatient,
  hasGoal,
  hasAppointment,
  hasSession,
  firstPatient,
  todaysAppointment,
  materialCount,
  disciplineLabel,
}: {
  hasPatient: boolean
  hasGoal: boolean
  hasAppointment: boolean
  hasSession: boolean
  /** Who steps two to four are about, once there is somebody. */
  firstPatient: { id: string; firstName: string } | null
  /** That patient's session today, if there is one — step four is tied to it. */
  todaysAppointment: { id: string; startTime: string } | null
  materialCount: number
  /** "Fonoaudiología", to be lowercased into running text. */
  disciplineLabel: string
}) {
  if (hasPatient && hasGoal && hasSession) return null

  const steps = [hasPatient, hasGoal, hasAppointment, hasSession]
  const done = steps.filter(Boolean).length

  // Said rather than left blank: an inert row reads as broken, and "after the
  // first one" reads as a sequence.
  const afterStepOne = (
    <span className="text-meta text-muted-foreground">Después del paso 1</span>
  )

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
          Cuatro pasos para empezar a usar Hilo. Se hacen acá mismo.
        </p>

        <Step
          done={hasPatient}
          number={1}
          title="Cargá tu primer paciente"
          text="Con el nombre alcanza para empezar. El resto de la ficha lo completás cuando quieras."
          action={<PatientStepForm />}
        />

        <Step
          done={hasGoal}
          number={2}
          title={
            firstPatient ? `Ponele un objetivo a ${firstPatient.firstName}` : 'Ponele un objetivo'
          }
          text="Es lo que Hilo usa para seguir el progreso, sugerirte materiales y armar los informes."
          action={
            firstPatient ? (
              <GoalStepForm patientId={firstPatient.id} patientName={firstPatient.firstName} />
            ) : (
              afterStepOne
            )
          }
        />

        <Step
          done={hasAppointment}
          number={3}
          title="Agendá su sesión"
          text="Aparece en tu Agenda, y el día anterior podés mandarle el recordatorio."
          action={
            firstPatient ? <AppointmentStepForm patientId={firstPatient.id} /> : afterStepOne
          }
        />

        <Step
          done={hasSession}
          number={4}
          title="Registrá cómo salió"
          text={
            todaysAppointment
              ? `Es el registro de la sesión de hoy a las ${todaysAppointment.startTime}: al guardarlo queda marcada como que vino.`
              : 'Anotá cómo salió la sesión. Es lo que Hilo lee después para armar los informes.'
          }
          action={
            firstPatient ? (
              <RecordStepForm
                patientId={firstPatient.id}
                todaysAppointment={todaysAppointment}
              />
            ) : (
              afterStepOne
            )
          }
        />

        {/* Something to do right now that needs no patient. See above. */}
        {materialCount > 0 ? (
          <Link
            href="/materiales"
            className="mt-3 flex items-center gap-2.5 rounded-xl bg-violet-soft px-3 py-2.5 text-meta leading-relaxed text-violet transition-opacity hover:opacity-85"
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
            the steps instead of leaving. */}
        <div className="mt-4 border-t border-border pt-3.5">
          {/* The tour runs itself on the first visit and then never again. This
              is its only way back, and it lives here because this card is the
              one thing on the screen that is already about getting started. */}
          <p className="mb-3 text-meta text-muted-foreground">
            ¿Querés que te muestre dónde está cada cosa?{' '}
            <TourButton>Ver el recorrido</TourButton>
          </p>

          <p className="mb-2 text-meta text-muted-foreground">
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

/**
 * One step. Open, it shows what it is for and the form that does it, under the
 * text rather than beside it — a form needs the width a button did not. Done, it
 * collapses to its title, crossed out, with a check.
 */
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
    <div className="flex items-start gap-2.5 border-b border-border py-2.5 last:border-b-0">
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-meta font-extrabold',
          done ? 'bg-green-soft text-[#1a8f57]' : 'bg-violet-soft text-violet',
        )}
      >
        {done ? <Check className="size-4" /> : number}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className={cn('text-item font-bold', done && 'text-muted-foreground line-through')}>
          {title}
        </p>
        {done ? null : (
          <>
            <p className="mt-0.5 text-meta text-muted-foreground">{text}</p>
            <div className="mt-2">{action}</div>
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
