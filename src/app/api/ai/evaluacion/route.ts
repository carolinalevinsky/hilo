import { ageLabel } from '@/lib/age'
import { AiUnavailableError, AI_MODEL, streamCompletion } from '@/server/ai'
import {
  assessmentInstructions,
  assessmentUserPrompt,
} from '@/server/assessment-prompt'
import { AssessmentResults, getAssessment } from '@/server/assessments'
import { getUser } from '@/server/auth'
import { assertQuota, QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'

import { sseResponse, type SseEvent } from '../sse'

/**
 * Streams the interpretation of an assessment.
 *
 * Same three gates as the report route: session, ownership through RLS, then the
 * monthly quota — all before the first token is bought.
 */
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'No pudimos verificar tu sesión.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    assessmentId?: string
    adjustment?: string
  }

  if (!body.assessmentId) {
    return Response.json({ error: 'Falta la evaluación.' }, { status: 400 })
  }

  const [practitioner, assessment] = await Promise.all([
    getPractitioner(user.id),
    getAssessment(user.id, body.assessmentId),
  ])

  if (!assessment) {
    return Response.json({ error: 'No encontramos esa evaluación.' }, { status: 404 })
  }

  try {
    await assertQuota(user.id, practitioner.plan, 'assessments', { alreadyCounted: true })
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return Response.json({ error: quotaMessage(error.status) }, { status: 429 })
    }
    throw error
  }

  const results = AssessmentResults.parse(assessment.results)

  const instructions = assessmentInstructions(practitioner.discipline)
  const prompt = assessmentUserPrompt({
    instrumentName: assessment.instrument,
    patientName: assessment.patients?.full_name ?? 'el paciente',
    age: ageLabel(assessment.patients?.date_of_birth ?? null) ?? 'sin edad consignada',
    results,
    observations: assessment.observations,
    adjustment: body.adjustment,
  })

  return sseResponse(generate(instructions, prompt))
}

async function* generate(instructions: string, prompt: string): AsyncGenerator<SseEvent> {
  try {
    for await (const chunk of streamCompletion(instructions, prompt)) {
      yield { event: 'delta', data: chunk }
    }
    yield { event: 'done', data: AI_MODEL }
  } catch (error) {
    const message =
      error instanceof AiUnavailableError
        ? error.message
        : 'La IA no respondió esta vez.'

    console.error('[ai/evaluacion]', error)
    yield { event: 'error', data: message }
  }
}
