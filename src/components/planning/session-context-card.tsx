import Link from 'next/link'

import { User } from '@/components/icons'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { PlanSessionPicker } from '@/components/planning/plan-controls'
import { StepBadge } from '@/components/planning/step-heading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
}: {
  patient: {
    id: string
    full_name: string
    color: string | null
  }
  photoUrl: string | null
  sessions: { id: string; label: string }[]
  unscheduled: { id: string; label: string }[]
  selected: string
}) {
  const name = firstName(patient.full_name)

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

        {/* Sin la edad y sin el avance general.
            Estaban acá como "los datos con los que decidís", y no lo son: son
            tus pacientes, ya sabés en qué anda cada uno. Lo que sí hace falta a
            mano es la ficha, que es donde está todo eso y el resto. */}
        <div className="flex flex-wrap items-end gap-2">
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
