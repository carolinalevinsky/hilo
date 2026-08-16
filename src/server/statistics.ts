import { toDateInput } from '@/lib/dates'

import { getDb } from './db'

/**
 * The numbers behind the statistics screen and the fortnightly digest.
 *
 * All computed, none stored. Every figure here is a `count(*)` or an average
 * over rows that exist — there is no summary table to drift out of step with the
 * records it summarises, which is the same reason `payments` has no counter
 * column.
 */

export type PractitionerStats = {
  activePatients: number
  sessionsThisMonth: number
  sessionsLastMonth: number
  averageProgress: number
  goalsAchieved: number
  activeGoals: number
  reportsThisMonth: number
  attendanceRate: number | null
}

function monthStart(offset = 0): string {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + offset)
  return toDateInput(date)
}

export async function practitionerStats(practitionerId: string): Promise<PractitionerStats> {
  const db = await getDb()

  const thisMonth = monthStart()
  const lastMonth = monthStart(-1)

  const [patients, sessionsThis, sessionsLast, goals, reports, appointments] =
    await Promise.all([
      db
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('practitioner_id', practitionerId)
        .is('deleted_at', null)
        .is('archived_at', null),
      db
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('practitioner_id', practitionerId)
        .gte('held_on', thisMonth),
      db
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('practitioner_id', practitionerId)
        .gte('held_on', lastMonth)
        .lt('held_on', thisMonth),
      db
        .from('goals')
        .select('progress, is_active')
        .eq('practitioner_id', practitionerId),
      db
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('practitioner_id', practitionerId)
        .gte('created_at', `${thisMonth}T00:00:00`),
      db
        .from('appointments')
        .select('status')
        .eq('practitioner_id', practitionerId)
        .gte('scheduled_on', lastMonth)
        .lt('scheduled_on', toDateInput(new Date())),
    ])

  const activeGoals = (goals.data ?? []).filter((goal) => goal.is_active)
  const averageProgress =
    activeGoals.length === 0
      ? 0
      : Math.round(
          activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length,
        )

  // Only appointments that have been marked count towards attendance: an
  // appointment still sitting at "agendada" a week later means nobody recorded
  // what happened, not that the patient failed to show up. Counting those as
  // absences would make the number a lie in the direction that hurts a family.
  const resolved = (appointments.data ?? []).filter(
    (appointment) => appointment.status !== 'scheduled',
  )
  const attended = resolved.filter((appointment) => appointment.status === 'attended')

  return {
    activePatients: patients.count ?? 0,
    sessionsThisMonth: sessionsThis.count ?? 0,
    sessionsLastMonth: sessionsLast.count ?? 0,
    averageProgress,
    goalsAchieved: (goals.data ?? []).filter((goal) => goal.progress >= 100).length,
    activeGoals: activeGoals.length,
    reportsThisMonth: reports.count ?? 0,
    attendanceRate:
      resolved.length === 0 ? null : Math.round((attended.length / resolved.length) * 100),
  }
}

export type PatientProgress = {
  id: string
  fullName: string
  color: string | null
  averageProgress: number
  goalCount: number
  sessionCount: number
}

/**
 * Average progress per patient, for the comparison list.
 *
 * Sorted lowest first, deliberately. The patient who is not moving is the one
 * worth a second look, and a list sorted by success puts them where nobody
 * scrolls.
 */
export async function progressByPatient(practitionerId: string): Promise<PatientProgress[]> {
  const db = await getDb()

  const [{ data: patients }, { data: goals }, { data: sessions }] = await Promise.all([
    db
      .from('patients')
      .select('id, full_name, color')
      .eq('practitioner_id', practitionerId)
      .is('deleted_at', null)
      .is('archived_at', null),
    db
      .from('goals')
      .select('patient_id, progress')
      .eq('practitioner_id', practitionerId)
      .eq('is_active', true),
    db.from('sessions').select('patient_id').eq('practitioner_id', practitionerId),
  ])

  const goalsByPatient = new Map<string, number[]>()
  for (const goal of goals ?? []) {
    const list = goalsByPatient.get(goal.patient_id)
    if (list) list.push(goal.progress)
    else goalsByPatient.set(goal.patient_id, [goal.progress])
  }

  const sessionsByPatient = new Map<string, number>()
  for (const session of sessions ?? []) {
    sessionsByPatient.set(
      session.patient_id,
      (sessionsByPatient.get(session.patient_id) ?? 0) + 1,
    )
  }

  return (patients ?? [])
    .map((patient) => {
      const own = goalsByPatient.get(patient.id) ?? []
      return {
        id: patient.id,
        fullName: patient.full_name,
        color: patient.color,
        averageProgress:
          own.length === 0
            ? 0
            : Math.round(own.reduce((sum, value) => sum + value, 0) / own.length),
        goalCount: own.length,
        sessionCount: sessionsByPatient.get(patient.id) ?? 0,
      }
    })
    .sort((a, b) => a.averageProgress - b.averageProgress)
}

/**
 * Which goals were worked most often, across every patient.
 *
 * Answers "what am I actually spending my time on?", which is a question a
 * practitioner cannot answer from memory and which `session_goals` makes cheap.
 */
export async function mostWorkedGoals(practitionerId: string, limit = 8) {
  const db = await getDb()

  const { data, error } = await db
    .from('session_goals')
    .select('goal_id, goals(title)')
    .eq('practitioner_id', practitionerId)

  if (error) throw error

  const counts = new Map<string, { title: string; count: number }>()
  for (const link of data ?? []) {
    const title = link.goals?.title
    if (!title) continue
    const existing = counts.get(title)
    if (existing) existing.count += 1
    else counts.set(title, { title, count: 1 })
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit)
}
