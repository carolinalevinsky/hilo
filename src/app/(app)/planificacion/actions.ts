'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/server/auth'
import { getPractitioner } from '@/server/practitioners'
import {
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
 */

export async function addGoalToPlanAction(formData: FormData) {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  await addGoalToPlan(
    user.id,
    String(formData.get('patientId')),
    String(formData.get('goalId')),
    practitioner.discipline,
  )
  revalidatePath('/planificacion')
}

export async function addMaterialToPlanAction(formData: FormData) {
  const user = await requireUser()

  await addMaterialToPlan(
    user.id,
    String(formData.get('patientId')),
    String(formData.get('materialId')),
  )
  revalidatePath('/planificacion')
}

export async function removePlanItemAction(formData: FormData) {
  const user = await requireUser()

  await removePlanItem(user.id, String(formData.get('itemId')))
  revalidatePath('/planificacion')
}

export async function clearPlanAction(formData: FormData) {
  const user = await requireUser()

  await clearPlan(user.id, String(formData.get('patientId')))
  revalidatePath('/planificacion')
}
