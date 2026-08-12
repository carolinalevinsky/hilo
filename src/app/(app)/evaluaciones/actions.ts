'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ageLabel } from '@/lib/age'
import { formError, type FormState } from '@/lib/form-state'
import { instrument } from '@/lib/instruments'
import { requireUser } from '@/server/auth'
import { assessmentFallback } from '@/server/assessment-prompt'
import {
  AssessmentResults,
  createAssessment,
  deleteAssessment,
  suggestedGoals,
  updateAssessmentAnalysis,
} from '@/server/assessments'
import { createGoal } from '@/server/goals'
import { getPatient } from '@/server/patients'
import { QuotaExceededError, assertQuota, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'

/**
 * Creating an assessment.
 *
 * Same shape as reports: the row is written with the offline draft before any AI
 * call, so an outage costs polish rather than the whole document, and the quota
 * is charged at creation rather than at success.
 */
export async function createAssessmentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  const patientId = String(formData.get('patientId') ?? '')
  const instrumentId = String(formData.get('instrumentId') ?? '')
  const assessedOn = String(formData.get('assessedOn') ?? '')
  const observations = String(formData.get('observations') ?? '').trim() || null

  const chosen = instrument(instrumentId)
  if (!patientId) return formError('Elegí un paciente.')
  if (!chosen) return formError('Elegí un instrumento.')

  // Score boxes arrive as `score:<field name>`, so the field labels stay with
  // the instrument definition instead of being duplicated in the form contract.
  const scores: Record<string, number> = {}
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('score:')) continue
    const parsed = Number(String(value).replace(',', '.'))
    if (String(value).trim() !== '' && Number.isFinite(parsed)) {
      scores[key.slice(6)] = parsed
    }
  }

  const results = AssessmentResults.parse({
    scale: formData.get('scale') ?? 'standard',
    scores,
    prose: String(formData.get('prose') ?? '').trim(),
  })

  if (Object.keys(results.scores).length === 0 && !results.prose) {
    return formError('Cargá al menos un resultado.')
  }

  try {
    await assertQuota(user.id, practitioner.plan, 'assessments')
  } catch (error) {
    if (error instanceof QuotaExceededError) return formError(quotaMessage(error.status))
    throw error
  }

  const patient = await getPatient(user.id, patientId)
  if (!patient) return formError('No encontramos ese paciente.')

  const assessment = await createAssessment(user.id, {
    patientId,
    instrumentName: chosen.name,
    assessedOn,
    results,
    observations,
    analysis: assessmentFallback({
      instrumentName: chosen.name,
      patientName: patient.full_name,
      age: ageLabel(patient.date_of_birth) ?? 'sin edad consignada',
      results,
      observations,
    }),
    aiGenerated: false,
  })

  revalidatePath('/informes')
  redirect(`/evaluaciones/${assessment.id}?ia=1`)
}

export async function saveAssessmentAction(assessmentId: string, analysis: string) {
  const user = await requireUser()
  await updateAssessmentAnalysis(user.id, assessmentId, analysis)
  revalidatePath(`/evaluaciones/${assessmentId}`)
}

export async function deleteAssessmentAction(formData: FormData) {
  const user = await requireUser()

  await deleteAssessment(user.id, String(formData.get('assessmentId')))
  revalidatePath('/informes')
  redirect('/informes')
}

/**
 * Turns the assessment's weakest areas into goals on the patient's record.
 *
 * This is the moment the product stops being a document generator: the
 * assessment becomes the next three sessions, and the chart on the patient's
 * page starts from the day it was administered.
 */
export async function adoptSuggestedGoalsAction(formData: FormData) {
  const user = await requireUser()

  const patientId = String(formData.get('patientId'))
  const instrumentName = String(formData.get('instrumentName'))
  const results = AssessmentResults.parse(JSON.parse(String(formData.get('results'))))

  for (const title of suggestedGoals(results, instrumentName)) {
    await createGoal(user.id, patientId, { title, progress: 0 })
  }

  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/pacientes/${patientId}`)
}
