'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { createSession, deleteSession, updateSession } from '@/server/sessions'

export async function saveSessionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))
  const sessionId = formData.get('sessionId')

  const input = {
    heldOn: formData.get('heldOn'),
    progressNote: formData.get('progressNote'),
    privateNote: formData.get('privateNote'),
    // Every checked goal arrives under the same name.
    goalIds: formData.getAll('goalIds').map(String),
  }

  try {
    if (typeof sessionId === 'string' && sessionId) {
      await updateSession(user.id, sessionId, input)
    } else {
      await createSession(user.id, patientId, input)
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const issues = (error as { issues: { message: string }[] }).issues
      return formError(issues[0]?.message ?? 'Revisá los datos.')
    }
    return formError('No pudimos guardar la sesión. Probá de nuevo.')
  }

  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/pacientes/${patientId}`)
}

export async function deleteSessionAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await deleteSession(user.id, String(formData.get('sessionId')))
  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/pacientes/${patientId}`)
}
