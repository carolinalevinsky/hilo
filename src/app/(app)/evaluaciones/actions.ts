'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { readCustomInstructions } from '@/app/(app)/custom-instructions'
import { ageLabel } from '@/lib/age'
import { formError, typedValues, type FormState } from '@/lib/form-state'
import { instrument } from '@/lib/instruments'
import { requireUser } from '@/server/auth'
import { assessmentFallback } from '@/server/assessment-prompt'
import {
  AssessmentResults,
  createAssessment,
  suggestedGoals,
  updateAssessmentAnalysis,
} from '@/server/assessments'
import { createGoal } from '@/server/goals'
import { getPatient } from '@/server/patients'
import { claimUsage, releaseUsage } from '@/server/ai-usage'
import { listVersions, type VersionReason } from '@/server/document-versions'
import { QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'
import { trashRecord } from '@/server/trash'

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

  // Con cualquier error vuelve lo cargado: los puntajes de un WISC entero no
  // se vuelven a tipear porque se agotó la cuota.
  const values = typedValues(formData)
  const patientId = String(formData.get('patientId') ?? '')
  const instrumentId = String(formData.get('instrumentId') ?? '')
  const assessedOn = String(formData.get('assessedOn') ?? '')
  const observations = String(formData.get('observations') ?? '').trim() || null

  const chosen = instrument(instrumentId)
  if (!patientId) return formError('Elegí un paciente.', values)
  if (!chosen) return formError('Elegí un instrumento.', values)

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
    return formError('Cargá al menos un resultado.', values)
  }

  // Her own instructions (P20), before the quota like every other field.
  const own = await readCustomInstructions(user.id, 'assessment', formData)
  if ('message' in own) return formError(own.message, values)

  const patient = await getPatient(user.id, patientId)
  if (!patient) return formError('No encontramos ese paciente.', values)

  // Reservada de una, y devuelta si el documento no llega a crearse. Ver el
  // equivalente en `informes/actions.ts` y `claimUsage`.
  let usageId: string | null
  try {
    usageId = await claimUsage(user.id, practitioner.plan, 'assessments')
  } catch (error) {
    if (error instanceof QuotaExceededError) return formError(quotaMessage(error.status), values)
    throw error
  }

  let assessment
  try {
    assessment = await createAssessment(user.id, {
      patientId,
      instrumentName: chosen.name,
      assessedOn,
      results,
      observations,
      customInstructions: own.text,
      analysis: assessmentFallback({
        instrumentName: chosen.name,
        patientName: patient.full_name,
        age: ageLabel(patient.date_of_birth) ?? 'sin edad consignada',
        results,
        observations,
      }),
      aiGenerated: false,
    })
  } catch (error) {
    await releaseUsage(usageId)
    throw error
  }

  revalidatePath('/informes')
  redirect(`/evaluaciones/${assessment.id}?ia=1`)
}

/** Igual que `saveReportAction`: ver la nota ahí. */
export async function saveAssessmentAction(
  assessmentId: string,
  analysis: string,
  reason: VersionReason = 'edit',
) {
  const user = await requireUser()
  await updateAssessmentAnalysis(user.id, assessmentId, analysis, reason)
  revalidatePath(`/evaluaciones/${assessmentId}`)
  return listVersions(user.id, 'assessment', assessmentId)
}

/** Sólo un borrador: lo firmado se anula. Ver `document-lifecycle.ts`. */
export async function trashAssessmentAction(formData: FormData) {
  const user = await requireUser()

  await trashRecord(user.id, 'assessment', String(formData.get('assessmentId')))
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
