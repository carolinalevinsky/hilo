import { ClipboardList } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { CustomActivity } from '@/components/planning/custom-activity'
import { GoalSuggestions } from '@/components/planning/goal-suggestions'
import { LibraryPicker } from '@/components/planning/library-picker'
import { PlanningTabs } from '@/components/planning/planning-tabs'
import { SessionContextCard } from '@/components/planning/session-context-card'
import { SessionPlanCard } from '@/components/planning/session-plan-card'
import { StepHeading } from '@/components/planning/step-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatLongDate, today, toDateInput, todayDate } from '@/lib/dates'
import { formatTime } from '@/lib/week'
import { firstName } from '@/lib/whatsapp'
import {
  getAppointment,
  listAppointments,
  nextAppointmentFor,
  type NextAppointment,
} from '@/server/appointments'
import { averageProgress } from '@/server/goals'
import { listMaterials } from '@/server/materials'
import { getPhotoUrl, listPatients } from '@/server/patients'
import { listPlanItems, planSuggestions } from '@/server/session-plans'
import { currentSession } from '../session'

/** Sin "· Ombúa": se imprime. Ver la nota en `informes/[id]/page.tsx`. */
export const metadata: Metadata = { title: 'Planificar sesión' }

/**
 * "Planificar sesión" — v1's, restored, and since P14 tied to the agenda.
 *
 * The rewrite replaced this with a read-only list of the coming week. That list
 * was not wrong, it was a different screen: it told you what was ahead and gave
 * you nothing to do about it, and the part it dropped is the part that takes the
 * time. What lives here is v1's three panels — the goals that have moved least
 * with a one-click "Agregar", the library search, and the session you are
 * assembling, which persists until you register it.
 *
 * What P14 changed (Thomas's QA: "costó mucho entender qué hace"): you prepare a
 * **session**, not a patient. The screen opens on the soonest one and says when
 * it is; what you assemble is what "Plan de la semana" shows for that session in
 * the Agenda, and what registering it starts from.
 *
 * ─── Why the screen is numbered ────────────────────────────────────────────
 *
 * Four cards of equal weight, each a different kind of thing, and nothing said
 * which to touch first — so the screen read as a dashboard when it is a task.
 * It is three steps: choose the session, fill it, look at what came out and save
 * it. The panels did not change; the order they are announced in did, and the
 * two columns say plainly that everything on the left flows into the one on the
 * right.
 *
 * The page stays a Server Component and every write is a Server Action, as
 * before. Each step is its own component in `src/components/planning/` — this
 * file had grown to six hundred lines of JSX, in which the data loading above
 * was impossible to find.
 */

/** How far ahead the session picker looks: a month of planning. */
const PICKER_DAYS = 28

function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

function whenLabel(session: { scheduled_on: string; start_time: string }) {
  return `${formatLongDate(session.scheduled_on)} · ${formatTime(session.start_time)}`
}

export default async function PlanningPage({ searchParams }: PageProps<'/planificacion'>) {
  const params = await searchParams
  const { user, practitioner } = await currentSession()
  const patients = await listPatients(user.id)

  const [firstPatient] = patients
  if (!firstPatient) {
    return (
      <>
        <PlanningHeader />
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Planificá tu primera sesión"
            text="Cargá un paciente y sus objetivos, y Ombúa prioriza los que menos se movieron y te deja la próxima sesión casi armada."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      </>
    )
  }

  // Only the active list: an archived patient's sessions were cleared when they
  // were archived, and a deleted one is not in `patients` at all.
  const known = new Set(patients.map((row) => row.id))
  const until = todayDate()
  until.setDate(until.getDate() + PICKER_DAYS)
  const upcoming = (await listAppointments(user.id, today(), toDateInput(until))).filter(
    (row) => row.status === 'scheduled' && known.has(row.patient_id),
  )

  // What is being prepared. In order: the session in the URL ("Preparar" in the
  // Agenda), the patient in the URL (the ficha, a material — at their next
  // session), and otherwise the soonest session on the agenda. It used to open
  // on whoever came first alphabetically, which is how the QA landed on a child
  // with no goals and nothing scheduled and could not tell what the screen was
  // for. An id that does not resolve falls through rather than 404s: this is a
  // working screen, not a permalink.
  const askedSession = readParam(params.sesion)
  const askedPatient = readParam(params.paciente)

  let session: NextAppointment | null = null
  let patientId: string | undefined

  if (askedSession) {
    const row =
      upcoming.find((candidate) => candidate.id === askedSession) ??
      (await getAppointment(user.id, askedSession))
    if (row && known.has(row.patient_id)) {
      session = { id: row.id, scheduled_on: row.scheduled_on, start_time: row.start_time }
      patientId = row.patient_id
    }
  }
  if (!patientId && askedPatient && known.has(askedPatient)) patientId = askedPatient
  if (!patientId && upcoming[0]) {
    const [soonest] = upcoming
    session = { id: soonest.id, scheduled_on: soonest.scheduled_on, start_time: soonest.start_time }
    patientId = soonest.patient_id
  }

  const patient = patients.find((row) => row.id === patientId) ?? firstPatient
  if (!session) session = await nextAppointmentFor(user.id, patient.id)

  const appointmentId = session?.id ?? null
  const search = readParam(params.q)?.trim() ?? ''

  const [suggestions, items, results, photoUrl] = await Promise.all([
    planSuggestions(user.id, patient.id, practitioner.discipline, appointmentId),
    listPlanItems(user.id, patient.id, appointmentId),
    search
      ? listMaterials(user.id, { discipline: practitioner.discipline, search })
      : Promise.resolve([]),
    getPhotoUrl(patient.photo_path),
  ])

  const sessionOptions = upcoming.map((row) => ({
    id: row.id,
    label: `${whenLabel(row)} — ${row.patients?.full_name ?? 'Paciente'}`,
  }))
  // A session from beyond the picker's four weeks, opened from the Agenda or as
  // the patient's next: listed too, so the select can show what is on screen.
  if (session && !sessionOptions.some((option) => option.id === session.id)) {
    sessionOptions.unshift({ id: session.id, label: `${whenLabel(session)} — ${patient.full_name}` })
  }
  const unscheduled = patients
    .filter((row) => !upcoming.some((appointment) => appointment.patient_id === row.id))
    .map((row) => ({ id: row.id, label: row.full_name }))

  // Every form on this screen writes into the same plan, so they all carry the
  // same two fields.
  const target = { patientId: patient.id, appointmentId }
  // What is in the plan, and which row it is: the "Agregado" chip is also the
  // way out, so every state on the left needs the id it would remove. First one
  // wins — the same goal added twice is one state and one undo.
  const itemOfGoal = new Map<string, string>()
  const itemOfMaterial = new Map<string, string>()
  for (const item of items) {
    if (item.goalId && !itemOfGoal.has(item.goalId)) itemOfGoal.set(item.goalId, item.id)
    if (item.material && !itemOfMaterial.has(item.material.id)) {
      itemOfMaterial.set(item.material.id, item.id)
    }
  }
  const name = firstName(patient.full_name)

  return (
    <>
      <PlanningHeader />

      <SessionContextCard
        patient={patient}
        photoUrl={photoUrl}
        sessions={sessionOptions}
        unscheduled={unscheduled}
        selected={session ? `s:${session.id}` : `p:${patient.id}`}
        averageProgress={
          suggestions.length > 0
            ? averageProgress(suggestions.map((goal) => ({ progress: goal.progress })))
            : null
        }
      />

      {/* `items-start`: see the same note in `estadisticas/page.tsx`. The plan is
          short and the sources beside it are long, so a stretched column left a
          third of a screen of empty card. */}
      <div className="grid items-start gap-4 print:block lg:grid-cols-12 lg:gap-6">
        {/* Everything something can come from. `no-print`, with the session card
            above it: what gets printed is the plan, not the workbench that
            produced it. */}
        <div className="no-print lg:col-span-7">
          <StepHeading
            step={2}
            title="Elegí qué va a pasar en la sesión"
            hint={`Objetivos de ${name}, materiales de tu biblioteca, o algo tuyo. Todo lo que sumes cae en el plan.`}
          />

          <div className="space-y-4">
            <GoalSuggestions
              target={target}
              firstName={name}
              suggestions={suggestions}
              itemOfGoal={itemOfGoal}
              itemOfMaterial={itemOfMaterial}
            />
            <LibraryPicker
              target={target}
              search={search}
              results={results}
              inPlan={itemOfMaterial}
            />
            <CustomActivity target={target} />
          </div>
        </div>

        {/* `max-lg:order-first`: on a phone this used to be last, and last is
            below the fold — measured at 375 px it started at y 919 on an 816 px
            screen. You pressed "Agregar", nothing on the screen moved, and the
            item you had just added was 12 % of a screen past the bottom edge.
            That is where "¿dónde quedan guardadas? falta botón de guardar" comes
            from: they were saved, and invisible.

            You are assembling a list. The list goes where you can see it, and
            the things you add to it go underneath — which is also why it sticks
            on a desktop: the sources scroll, the plan stays. */}
        <div className="max-lg:order-first print:w-full lg:sticky lg:top-6 lg:col-span-5">
          <div className="no-print">
            <StepHeading
              step={3}
              tone="violet"
              title="Revisá el plan y guardalo"
              hint="Es lo que vas a tener a mano cuando la atiendas."
            />
          </div>

          <SessionPlanCard
            target={target}
            patientName={patient.full_name}
            when={session ? whenLabel(session) : null}
            items={items}
          />
        </div>
      </div>
    </>
  )
}

function PlanningHeader() {
  return (
    <div className="no-print">
      {/* Same title and subtitle as /materiales: to a practitioner these are one
          screen with two tabs, as they were in v1. */}
      <PageHeader
        title="Planificación"
        subtitle="Tu biblioteca de materiales y la planificación de cada paciente, en un solo lugar."
      />
      <PlanningTabs />
    </div>
  )
}
