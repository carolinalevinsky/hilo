'use server'

import { revalidatePath } from 'next/cache'

import { formError, formOk, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { createGoal, setGoalActive, setGoalProgress, updateGoal } from '@/server/goals'

/**
 * Server Actions for goals.
 *
 * They live beside the patients routes rather than under `[id]/` so that the
 * import path in a component has no brackets in it.
 */

export async function saveGoalAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))
  const goalId = formData.get('goalId')

  const input = {
    title: formData.get('title'),
    progress: formData.get('progress') ?? 0,
  }

  try {
    if (typeof goalId === 'string' && goalId) {
      await updateGoal(user.id, goalId, input)
    } else {
      await createGoal(user.id, patientId, input)
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const issues = (error as { issues: { message: string }[] }).issues
      return formError(issues[0]?.message ?? 'Revisá los datos.')
    }
    return formError('No pudimos guardar el objetivo. Probá de nuevo.')
  }

  revalidatePath(`/pacientes/${patientId}`)
  return formOk()
}

export async function setGoalProgressAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await setGoalProgress(user.id, String(formData.get('goalId')), Number(formData.get('progress')))
  revalidatePath(`/pacientes/${patientId}`)
}

export async function setGoalActiveAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await setGoalActive(
    user.id,
    String(formData.get('goalId')),
    formData.get('isActive') === 'true',
  )
  revalidatePath(`/pacientes/${patientId}`)
}
