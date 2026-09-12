import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { SCALE_IDS, SCALES, scaleIsReady, type ScaleId } from '@/lib/scales'

import { logAction } from './audit'
import { getDb } from './db'
import {
  formByToken,
  looksLikeToken,
  newLinkToken,
  PatientFormError,
  type SubmitResult,
} from './patient-forms'

/**
 * PHQ-9 and GAD-7, answered by the patient from a link and scored by Hilo.
 *
 * The link is a `patient_forms` row of kind 'scale' — same token, same hash,
 * same "retire the unanswered one" rule as "Antes de empezar". The answers go
 * through `submit_scale`, a `security definer` function that computes the
 * total itself, so the number on the ficha never comes from the browser.
 * Schema and reasons: `supabase/migrations/20260911170257_scale_responses.sql`.
 * The instruments and their cut-offs: `@/lib/scales`.
 */

export type ScaleResponse = Database['public']['Tables']['scale_responses']['Row']

/** A questionnaire about the last two weeks is answered this week or not at all. */
const LINK_LIFETIME_DAYS = 7

export async function createScaleLink(practitionerId: string, patientId: string, scale: unknown) {
  const id = z.enum(SCALE_IDS).parse(scale)
  if (!scaleIsReady(id)) {
    throw new PatientFormError(`El ${SCALES[id].name} todavía no está disponible.`)
  }

  const db = await getDb()
  const { data: patient, error: patientError } = await db
    .from('patients')
    .select('id')
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)
    .is('deleted_at', null)
    .maybeSingle()
  if (patientError) throw patientError
  if (!patient) throw new PatientFormError('No encontramos ese paciente.')

  const now = new Date()
  const { error: retireError } = await db
    .from('patient_forms')
    .update({ expires_at: now.toISOString() })
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .eq('kind', 'scale')
    .eq('scale', id)
    .is('submitted_at', null)
    .gt('expires_at', now.toISOString())
  if (retireError) throw retireError

  const { token, hash } = newLinkToken()
  const { data: row, error } = await db
    .from('patient_forms')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      kind: 'scale',
      scale: id,
      token_hash: hash,
      expires_at: new Date(now.getTime() + LINK_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()
  if (error) throw error

  await logAction(practitionerId, 'create', 'patient_form', row.id)
  return token
}

/** Every answered questionnaire for a patient, oldest first, and the links still open. */
export async function scaleHistory(practitionerId: string, patientId: string) {
  const db = await getDb()
  const now = new Date().toISOString()

  const [responses, open] = await Promise.all([
    db
      .from('scale_responses')
      .select('id, scale, total, difficulty, self_harm_flag, submitted_at, reviewed_at')
      .eq('practitioner_id', practitionerId)
      .eq('patient_id', patientId)
      .order('submitted_at', { ascending: true })
      .limit(200),
    db
      .from('patient_forms')
      .select('scale, created_at')
      .eq('practitioner_id', practitionerId)
      .eq('patient_id', patientId)
      .eq('kind', 'scale')
      .is('submitted_at', null)
      .gt('expires_at', now),
  ])
  if (responses.error) throw responses.error
  if (open.error) throw open.error

  return {
    responses: responses.data.map((row) => ({ ...row, scale: row.scale as ScaleId })),
    openLinks: open.data.map((row) => ({ scale: row.scale as ScaleId, since: row.created_at })),
  }
}

/** "Lo vi": the practitioner saw the item-9 flag. Only `reviewed_at` can change. */
export async function markScaleReviewed(practitionerId: string, responseId: string) {
  const db = await getDb()
  const { error } = await db
    .from('scale_responses')
    .update({ reviewed_at: new Date().toISOString() })
    .eq('id', responseId)
    .eq('practitioner_id', practitionerId)
  if (error) throw error
}

/**
 * Sends a patient's answers. The scale is read from the link, not from the
 * form, so the form cannot claim a different questionnaire; the length is
 * checked against it here, and again by the table's checks.
 */
export async function submitScale(token: string, input: Record<string, unknown>): Promise<SubmitResult> {
  if (!looksLikeToken(token)) return 'not_found'

  const form = await formByToken(token)
  if (!form || form.kind !== 'scale' || !form.scale) return 'not_found'
  if (form.state !== 'open') return form.state

  const scale = SCALES[form.scale as ScaleId]
  if (!scale) return 'not_found'

  const answer = z.coerce.number('Contestá todas las preguntas.').int().min(0).max(3)
  const answers = z
    .array(answer)
    .length(scale.items.length)
    .parse(scale.items.map((_, index) => input[`item-${index}`] ?? undefined))

  const rawDifficulty = input.difficulty
  const difficulty =
    typeof rawDifficulty === 'string' && rawDifficulty !== '' ? answer.parse(rawDifficulty) : undefined

  const db = await getDb()
  const { data: result, error } = await db.rpc('submit_scale', {
    raw_token: token,
    p_answers: answers,
    p_difficulty: difficulty,
  })
  if (error) throw error

  return result === 'ok' || result === 'expired' || result === 'submitted' ? result : 'not_found'
}
