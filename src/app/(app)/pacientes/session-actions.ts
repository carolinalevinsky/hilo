'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, formErrorFor, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { setGoalProgress } from '@/server/goals'
import { clearPlan } from '@/server/session-plans'
import {
  createSession,
  deleteSession,
  SessionLinkError,
  updateSession,
} from '@/server/sessions'

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
    // Every checked goal arrives under the same name.
    goalIds: formData.getAll('goalIds').map(String),
    // Only present when the form was opened from the agenda.
    appointmentId: formData.get('appointmentId') || undefined,
  }

  // Read before the session is written, so a failure here fails the whole form
  // rather than saving the session and losing the numbers.
  const moves = readGoalMoves(formData, input.goalIds)

  try {
    if (typeof sessionId === 'string' && sessionId) {
      await updateSession(user.id, sessionId, input)
    } else {
      await createSession(user.id, patientId, input)
    }
  } catch (error) {
    if (error instanceof SessionLinkError) return formError(error.message)
    return formErrorFor(error, 'No pudimos guardar la sesión. Probá de nuevo.')
  }

  // After the session, not before: the numbers describe how the session that was
  // just saved went, and a progress point without its session is a chart that
  // cannot be explained. A failure here does not undo the session — the note is
  // the clinical record and the percentage is a summary of it.
  for (const move of moves) {
    try {
      await setGoalProgress(user.id, move.goalId, move.progress)
    } catch (error) {
      console.error('[sessions] no se pudo mover el avance del objetivo', { ...move, error })
    }
  }

  // Registering the session you had prepared retires the plan, as it did in v1
  // (`registrarSesionPreparada`): the prepared session became history and
  // `p.plan` was emptied. Only when the form was opened from the planner —
  // writing up an unrelated session must not quietly wipe what you planned for
  // next week.
  if (formData.get('clearPlan') === '1') {
    await clearPlan(user.id, patientId)
    revalidatePath('/planificacion')
  }

  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/pacientes/${patientId}`)
}

/**
 * The goals whose number the practitioner actually moved.
 *
 * Only ticked goals submit a percentage at all, and a ticked goal left at the
 * value it arrived with is skipped: writing it anyway would add a point to the
 * progress chart every week saying nothing changed, which is how a chart stops
 * being readable.
 *
 * `progressWas` comes from the browser and is therefore not trusted for
 * anything that matters — it decides only whether to write, and both numbers
 * belong to the same practitioner either way. The value itself is validated in
 * `setGoalProgress`.
 */
function readGoalMoves(formData: FormData, goalIds: string[]) {
  const moves: { goalId: string; progress: number }[] = []

  for (const goalId of goalIds) {
    const raw = formData.get(`progress-${goalId}`)
    if (typeof raw !== 'string' || raw === '') continue

    const progress = Number(raw)
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) continue

    const was = Number(formData.get(`progressWas-${goalId}`))
    if (progress === was) continue

    moves.push({ goalId, progress })
  }

  return moves
}

export async function deleteSessionAction(formData: FormData) {
  const user = await requireUser()
  const patientId = String(formData.get('patientId'))

  await deleteSession(user.id, String(formData.get('sessionId')))
  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/pacientes/${patientId}`)
}
