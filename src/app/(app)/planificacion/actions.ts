'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireUser } from '@/server/auth'
import { getPractitioner } from '@/server/practitioners'
import {
  addActivityToPlan,
  addGoalToPlan,
  addMaterialToPlan,
  clearPlan,
  removePlanItem,
} from '@/server/session-plans'

/**
 * Every write on the planner.
 *
 * All of them take the patient id from the form and pass it straight through:
 * the functions in `src/server/session-plans.ts` scope every query by
 * `practitioner_id`, so a tampered field can only ever address rows that are
 * already this practitioner's. That is the same reason `practitionerId` is an
 * explicit argument everywhere in `src/server/` rather than read from a cookie.
 * The session id gets the same treatment one level down: the composite foreign
 * key refuses a session that is not this patient's.
 */

/**
 * The session the plan on screen is for. Empty for a patient with nothing
 * scheduled, which the server reads as "their next one, whenever it is".
 */
function sessionOf(formData: FormData) {
  const value = formData.get('appointmentId')
  return typeof value === 'string' && value ? value : undefined
}

/**
 * The Agenda's "Plan de la semana" and Inicio read the same rows (P14), so a
 * change here is a change there.
 */
function refresh() {
  revalidatePath('/planificacion')
  revalidatePath('/agenda')
  revalidatePath('/inicio')
}

export async function addGoalToPlanAction(formData: FormData) {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  // Absent when the goal has no material to offer; `addGoalToPlan` falls back to
  // its own match in that case.
  const materialId = formData.get('materialId')

  await addGoalToPlan(
    user.id,
    String(formData.get('patientId')),
    String(formData.get('goalId')),
    practitioner.discipline,
    typeof materialId === 'string' && materialId ? materialId : null,
    sessionOf(formData),
  )
  refresh()
}

/** An activity the practitioner typed, that is neither a goal nor a material. */
export async function addActivityToPlanAction(formData: FormData) {
  const user = await requireUser()

  await addActivityToPlan(
    user.id,
    String(formData.get('patientId')),
    String(formData.get('activity') ?? ''),
    sessionOf(formData),
  )
  refresh()
}

export async function addMaterialToPlanAction(formData: FormData) {
  const user = await requireUser()

  await addMaterialToPlan(
    user.id,
    String(formData.get('patientId')),
    String(formData.get('materialId')),
    sessionOf(formData),
  )
  refresh()
}

/**
 * The same add, from an open material rather than from the planner's own search.
 *
 * A second action rather than a flag on the first, because it does a second
 * thing: it takes you to the planner, with that patient chosen. That is v1's
 * behaviour (`matAPlan` closed the modal and switched to the planner tab) and it
 * is the right one — you are somewhere else, and adding to a list you cannot see
 * gives no sign that anything happened. It goes to the patient's next session,
 * and the planner opens on that same one.
 */
export async function addMaterialFromLibraryAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await addMaterialToPlan(user.id, patientId, String(formData.get('materialId')))
  refresh()
  redirect(`/planificacion?paciente=${patientId}`)
}

export async function removePlanItemAction(formData: FormData) {
  const user = await requireUser()

  await removePlanItem(user.id, String(formData.get('itemId')))
  refresh()
}

export async function clearPlanAction(formData: FormData) {
  const user = await requireUser()

  await clearPlan(user.id, String(formData.get('patientId')), sessionOf(formData))
  refresh()
}
