import { AiUnavailableError, AI_MODEL, streamCompletion } from '@/server/ai'
import { getUser } from '@/server/auth'
import { assertQuota, QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'
import {
  gatherReportContext,
  reportInstructions,
  reportUserPrompt,
} from '@/server/report-prompt'
import { getReport } from '@/server/reports'
import type { RecipientId } from '@/lib/recipients'

import { sseResponse, type SseEvent } from '../sse'

/**
 * Streams the body of a clinical report.
 *
 * The three things v1's `/api/ia` did not do, in order, before a single token is
 * bought:
 *
 *   1. Resolve the session. v1's endpoint had no authentication at all
 *      (`legacy/api/ia.js:71`) — anyone who found the URL could drain the key.
 *   2. Load the report through the user's session, so RLS proves it is theirs.
 *   3. Check the monthly quota server-side. v1 checked it in the browser.
 *
 * A route handler rather than a Server Action because Server Actions cannot
 * stream, and streaming is what keeps a thirty-second generation from hitting
 * the serverless timeout.
 */
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'No pudimos verificar tu sesión.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    reportId?: string
    adjustment?: string
  }

  if (!body.reportId) {
    return Response.json({ error: 'Falta el informe.' }, { status: 400 })
  }

  const [practitioner, report] = await Promise.all([
    getPractitioner(user.id),
    getReport(user.id, body.reportId),
  ])

  if (!report) {
    return Response.json({ error: 'No encontramos ese informe.' }, { status: 404 })
  }

  try {
    // `alreadyCounted`: the row exists — it was created with an offline draft so
    // that an outage still leaves something to edit — so it is in the count.
    await assertQuota(user.id, practitioner.plan, 'reports', { alreadyCounted: true })
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return Response.json({ error: quotaMessage(error.status) }, { status: 429 })
    }
    throw error
  }

  const context = await gatherReportContext(user.id, report.patient_id)

  const instructions = reportInstructions(practitioner.discipline)
  const prompt = reportUserPrompt({
    context,
    recipient: report.recipient as RecipientId,
    disciplineId: practitioner.discipline,
    practitionerNotes: report.input_notes,
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
    // The response is already a 200 with bytes on the wire by now, so the only
    // way to tell the client is an event. Anything unexpected gets the same
    // neutral sentence — a practitioner mid-report should not meet a stack
    // trace, and the fallback draft is already on their screen.
    const message =
      error instanceof AiUnavailableError
        ? error.message
        : 'La IA no respondió esta vez.'

    console.error('[ai/informe]', error)
    yield { event: 'error', data: message }
  }
}
