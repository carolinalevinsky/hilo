import Link from 'next/link'

import { TrendingUp, User } from '@/components/icons'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { PlanSessionPicker } from '@/components/planning/plan-controls'
import { StepBadge } from '@/components/planning/step-heading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { ageGroupLabel } from '@/lib/patient-labels'
import { firstName } from '@/lib/whatsapp'

/**
 * Step 1: whose session this is, and which one.
 *
 * v1 put the patient above both columns so the answer to "whose session is
 * this?" is never off-screen; since P14 it also answers "which one", because
 * what is prepared belongs to a session in the agenda.
 *
 * ─── One row of one height ─────────────────────────────────────────────────
 *
 * It used to be a field stretched across two thirds of the screen with the
 * photo floating loose beside it, three facts in three different shapes, and a
 * paragraph underneath that said the same thing as the foot of the plan. Now
 * the four pieces are the same height and the same radius and sit on one line:
 * the patient is *inside* the field, because the photo and the name are one
 * answer, not two.
 *
 * The paragraph is gone rather than reworded. It explained that what you add is
 * saved and where you will see it — which is what the foot of the plan card
 * says, at the moment you have something to save.
 */
export function SessionContextCard({
  patient,
  photoUrl,
  sessions,
  unscheduled,
  selected,
  averageProgress,
}: {
  patient: {
    id: string
    full_name: string
    color: string | null
    date_of_birth: string | null
    age_group: string
  }
  photoUrl: string | null
  sessions: { id: string; label: string }[]
  unscheduled: { id: string; label: string }[]
  selected: string
  /** Across the active goals, or `null` when there are none to average. */
  averageProgress: number | null
}) {
  const name = firstName(patient.full_name)
  const age = ageLabel(patient.date_of_birth)

  return (
    <Card className="no-print mb-4">
      <CardContent className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-[260px] flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <StepBadge step={1} />
            <label htmlFor="plan-session" className="text-body font-bold">
              Elegí la sesión que estás preparando
            </label>
          </div>

          {/* The photo sits in the field, not next to it. `pointer-events-none`
              so it is part of the control rather than a thing in front of it:
              clicking the face opens the list. */}
          <div className="relative max-w-[30rem]">
            <PatientAvatar
              fullName={patient.full_name}
              color={patient.color}
              size={30}
              photoUrl={photoUrl}
              className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
            />
            <PlanSessionPicker
              sessions={sessions}
              unscheduled={unscheduled}
              selected={selected}
              className="h-11 rounded-xl pl-11 text-item font-semibold"
            />
          </div>
        </div>

        {/* The facts you decide with, in the same height as the field they
            belong to. On a phone they wrap underneath it. */}
        <div className="flex flex-wrap items-end gap-2">
          {age || patient.age_group ? (
            <Fact label="Edad y grupo">
              {[age, ageGroupLabel(patient.age_group)].filter(Boolean).join(' · ')}
            </Fact>
          ) : null}

          {/* Only with goals to average. A patient with none would otherwise get
              a green "0%", which reads as a result and is the absence of one. */}
          {averageProgress !== null ? (
            <Fact label="Avance general" tone="green">
              <TrendingUp className="size-3.5" />
              {averageProgress}% alcanzado
            </Fact>
          ) : null}

          <Button asChild variant="secondary" className="h-11 rounded-xl px-4">
            <Link href={`/pacientes/${patient.id}`}>
              <User className="size-[15px]" />
              Ver ficha de {name}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/** One labelled fact: the quiet label above, the value under it. */
function Fact({
  label,
  tone = 'muted',
  children,
}: {
  label: string
  tone?: 'muted' | 'green'
  children: React.ReactNode
}) {
  const green = tone === 'green'

  return (
    <div
      className={
        green
          ? 'flex h-11 flex-col justify-center rounded-xl bg-green-soft px-3.5 text-[#1a8f57]'
          : 'flex h-11 flex-col justify-center rounded-xl bg-muted px-3.5 text-foreground'
      }
    >
      <span
        className={
          green
            ? 'text-micro font-bold uppercase text-[#1a8f57]/75'
            : 'text-micro font-bold uppercase text-muted-foreground'
        }
      >
        {label}
      </span>
      <span className="flex items-center gap-1 text-meta font-bold">{children}</span>
    </div>
  )
}
