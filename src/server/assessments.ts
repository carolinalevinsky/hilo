import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { instrument, SCORE_SCALES, type ScoreScale } from '@/lib/instruments'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * Assessments — administering an instrument and interpreting the result.
 *
 * `results` is the one JSONB column in this schema, and it earns it: a WISC-V
 * has six subscale scores, a Bender is qualitative prose, and a goniometry is
 * degrees per joint. Modelling that relationally would be EAV, which is worse
 * than a blob. Unlike v1's patient blob, nothing in here is ever filtered,
 * sorted, or summed.
 */

export type Assessment = Database['public']['Tables']['assessments']['Row']

export type AssessmentWithPatient = Assessment & {
  patients: { id: string; full_name: string; color: string | null } | null
}

/**
 * The shape stored in `results`.
 *
 * `scale` is the field that makes interpretation possible rather than guesswork:
 * 85 is a descended standard score and a perfectly good percentile. Without it,
 * "interpret these numbers" has no answer — and a guess inside a signed report
 * is a liability, not a rough edge.
 */
export const AssessmentResults = z.object({
  scale: z.enum(['standard', 'percentile', 'raw']).default('standard'),
  scores: z.record(z.string(), z.number()).default({}),
  prose: z.string().default(''),
})

export type AssessmentResultsData = z.infer<typeof AssessmentResults>

export const NewAssessment = z.object({
  patientId: z.uuid('Elegí un paciente.'),
  instrumentId: z.string().min(1, 'Elegí un instrumento.'),
  assessedOn: z.iso.date('Revisá la fecha.'),
  results: AssessmentResults,
  observations: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
})

export async function createAssessment(
  practitionerId: string,
  input: {
    patientId: string
    instrumentName: string
    assessedOn: string
    results: AssessmentResultsData
    observations?: string | null
    analysis: string
    aiGenerated: boolean
    aiModel?: string | null
  },
) {
  const db = await getDb()

  const { data, error } = await db
    .from('assessments')
    .insert({
      practitioner_id: practitionerId,
      patient_id: input.patientId,
      instrument: input.instrumentName,
      assessed_on: input.assessedOn,
      results: input.results,
      observations: input.observations ?? null,
      analysis: input.analysis,
      ai_generated: input.aiGenerated,
      ai_model: input.aiModel ?? null,
    })
    .select()
    .single()

  if (error) throw error
  await logAction(practitionerId, 'generate', 'assessment', data.id)
  return data
}

export async function updateAssessmentAnalysis(
  practitionerId: string,
  assessmentId: string,
  analysis: string,
) {
  const db = await getDb()

  const { error } = await db
    .from('assessments')
    .update({ analysis })
    .eq('id', assessmentId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'update', 'assessment', assessmentId)
}

export async function getAssessment(practitionerId: string, assessmentId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('assessments')
    .select('*, patients(id, full_name, color, date_of_birth)')
    .eq('id', assessmentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listAssessments(
  practitionerId: string,
  patientId?: string,
  limit = 100,
): Promise<AssessmentWithPatient[]> {
  const db = await getDb()

  let query = db
    .from('assessments')
    .select('*, patients(id, full_name, color)')
    .eq('practitioner_id', practitionerId)

  if (patientId) query = query.eq('patient_id', patientId)

  const { data, error } = await query
    .order('assessed_on', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function deleteAssessment(practitionerId: string, assessmentId: string) {
  const db = await getDb()

  const { error } = await db
    .from('assessments')
    .delete()
    .eq('id', assessmentId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'delete', 'assessment', assessmentId)
}

// ─── Reading the numbers ────────────────────────────────────────────────────

export type ScoreBands = {
  low: { area: string; value: number }[]
  average: { area: string; value: number }[]
  high: { area: string; value: number }[]
}

/**
 * Sorts scores into descended / expected / strength, using the thresholds for
 * the scale they were recorded on.
 *
 * Used for the fallback draft and to propose goals. The AI is given the raw
 * scores and the scale and does its own interpretation — this is not a
 * pre-chewed answer handed to the model, which would defeat rule 2 of the
 * clinical instructions.
 *
 * A raw score has no norms, so it gets no bands. Sorting ungraded numbers into
 * "low" and "high" would be inventing a baseline, which is exactly what the
 * prompt forbids.
 */
export function bandScores(results: AssessmentResultsData): ScoreBands {
  const empty: ScoreBands = { low: [], average: [], high: [] }
  const thresholds = SCORE_SCALES[results.scale as ScoreScale]
  if (thresholds.low === null || thresholds.high === null) return empty

  for (const [area, value] of Object.entries(results.scores)) {
    if (value < thresholds.low) empty.low.push({ area, value })
    else if (value >= thresholds.high) empty.high.push({ area, value })
    else empty.average.push({ area, value })
  }

  return empty
}

/**
 * Goals suggested by an assessment: the weakest areas first, capped at three.
 *
 * v1 offered these with a "cargar objetivos a la ficha" button, and it is the
 * moment the product feels like it is helping — the assessment stops being a
 * document and becomes the next three sessions.
 */
export function suggestedGoals(results: AssessmentResultsData, instrumentName: string) {
  const bands = bandScores(results)
  const source = bands.low.length > 0 ? bands.low : [...bands.average, ...bands.high]

  const fromScores = source
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((entry) => `Mejorar ${entry.area.toLowerCase()}`)

  if (fromScores.length > 0) return fromScores
  if (results.prose.trim()) {
    return [`Trabajar sobre lo detectado en ${instrumentName.split(' (')[0]}`]
  }
  return []
}

export function instrumentName(instrumentId: string): string {
  return instrument(instrumentId)?.name ?? instrumentId
}
