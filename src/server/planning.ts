import { toDateInput } from '@/lib/dates'

import { listAppointments } from './appointments'
import { getDb } from './db'
import { bestMaterialFor, listMaterials, type Material } from './materials'

/**
 * The session planner.
 *
 * v1's "Planificación" screen, and the idea behind it is the good one: for each
 * session coming up, show the goal that is furthest behind and a material that
 * fits it. A practitioner arriving at a session already knows their patient;
 * what they do not have is thirty seconds to remember which of six goals has not
 * moved since April.
 *
 * The lowest-progress goal is the suggestion, not an instruction. It appears
 * beside the others so it can be ignored.
 */

export type PlannedSession = {
  appointmentId: string
  patientId: string
  patientName: string
  patientColor: string | null
  scheduledOn: string
  startTime: string
  goals: { id: string; title: string; progress: number }[]
  /** The goal that has moved least. Null when the patient has no goals yet. */
  focus: { id: string; title: string; progress: number } | null
  suggestedMaterial: Material | null
}

/**
 * The next `days` of appointments, each with its suggested focus.
 *
 * Cancelled ones are left out — there is nothing to plan for a session that is
 * not happening — but a "no vino" from earlier today stays, because the goal
 * still has not been worked.
 */
export async function planUpcoming(
  practitionerId: string,
  discipline: string,
  days = 7,
): Promise<PlannedSession[]> {
  const from = toDateInput(new Date())
  const until = new Date()
  until.setDate(until.getDate() + days)

  const [appointments, materials] = await Promise.all([
    listAppointments(practitionerId, from, toDateInput(until)),
    listMaterials(practitionerId, { discipline }),
  ])

  const upcoming = appointments.filter(
    (appointment) => appointment.status !== 'cancelled' && appointment.patients,
  )
  if (upcoming.length === 0) return []

  const db = await getDb()
  const { data: goals } = await db
    .from('goals')
    .select('id, patient_id, title, progress')
    .eq('practitioner_id', practitionerId)
    .eq('is_active', true)
    .in('patient_id', [...new Set(upcoming.map((appointment) => appointment.patient_id))])
    .order('position')

  const goalsByPatient = new Map<string, { id: string; title: string; progress: number }[]>()
  for (const goal of goals ?? []) {
    const list = goalsByPatient.get(goal.patient_id)
    const entry = { id: goal.id, title: goal.title, progress: goal.progress }
    if (list) list.push(entry)
    else goalsByPatient.set(goal.patient_id, [entry])
  }

  return upcoming.map((appointment) => {
    const own = goalsByPatient.get(appointment.patient_id) ?? []
    // A goal already at 100 is finished; suggesting it would be busywork.
    const candidates = own.filter((goal) => goal.progress < 100)
    const focus =
      candidates.length === 0
        ? null
        : candidates.reduce((lowest, goal) =>
            goal.progress < lowest.progress ? goal : lowest,
          )

    return {
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      patientName: appointment.patients!.full_name,
      patientColor: appointment.patients!.color,
      scheduledOn: appointment.scheduled_on,
      startTime: appointment.start_time,
      goals: own,
      focus,
      suggestedMaterial: focus ? bestMaterialFor(focus.title, materials) : null,
    }
  })
}
