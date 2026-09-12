import { today } from '@/lib/dates'
import { AiUnavailableError, AI_MODEL, streamChat, type ChatMessage } from '@/server/ai'
import { recordUsage, releaseUsage } from '@/server/ai-usage'
import {
  assistantMessages,
  assistantSystemPrompt,
  gatherAssistantContext,
  offlineAnswer,
  parseHistory,
} from '@/server/assistant'
import { getUser } from '@/server/auth'
import { assertQuota, QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'

import { sseResponse, type SseEvent } from '../sse'

/**
 * "Preguntale a Hilo".
 *
 * The same four steps as the other two AI routes, in the same order, before a
 * single token is bought: resolve the session, load the practitioner, check the
 * monthly quota, then call Anthropic. v1's `/api/ia` had no authentication at
 * all (`legacy/api/ia.js:71`).
 *
 * The other difference: this one is a conversation, so the request carries the
 * turns before it. They come from the browser tab that has them — nothing here
 * stores a transcript — and `parseHistory` is what decides how many of them are
 * allowed through and in what shape.
 *
 * The one thing this route does that the others do not: it answers even when the
 * AI cannot. An exhausted quota or a missing key returns the offline answer with
 * a 200 rather than an error, because `offlineAnswer` is a real answer computed
 * from the practitioner's own rows — and a chat box that refuses to speak is a
 * dead feature, where a report screen with a fallback draft is not.
 */
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'No pudimos verificar tu sesión.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    question?: string
    history?: unknown
  }
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  const history = parseHistory(body.history)

  if (!question) {
    return Response.json({ error: 'Escribí una pregunta.' }, { status: 400 })
  }
  if (question.length > 500) {
    return Response.json({ error: 'La pregunta es muy larga.' }, { status: 400 })
  }

  const practitioner = await getPractitioner(user.id)
  const context = await gatherAssistantContext(
    user.id,
    practitioner.discipline,
    today(),
  )

  const fallback = offlineAnswer(context, question)

  try {
    await assertQuota(user.id, practitioner.plan, 'questions')
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      // Still an answer, and still the truth about why it is this one.
      return sseResponse(offline(fallback, quotaMessage(error.status)))
    }
    throw error
  }

  // Se anota antes de llamar, como todas. Si no llega nada se devuelve — ver
  // por qué en `src/server/ai-usage.ts`.
  const usageId = await recordUsage(user.id, 'questions')

  return sseResponse(
    generate(
      assistantSystemPrompt(context),
      assistantMessages(history, question),
      fallback,
      () => releaseUsage(usageId),
    ),
  )
}

async function* generate(
  instructions: string,
  messages: ChatMessage[],
  fallback: string,
  release: () => Promise<void>,
): AsyncGenerator<SseEvent> {
  let received = ''

  try {
    for await (const chunk of streamChat(instructions, messages)) {
      received += chunk
      yield { event: 'delta', data: chunk }
    }
  } catch (error) {
    console.error('[ai/asistente]', error)

    // Once tokens are on the wire, replacing them mid-sentence would be worse
    // than the truncation — and they were paid for, so the question stays
    // counted.
    if (received.trim()) {
      yield { event: 'error', data: 'Se cortó a mitad de camino.' }
      return
    }

    await release()

    yield { event: 'delta', data: fallback }
    yield {
      event: 'error',
      data:
        error instanceof AiUnavailableError
          ? error.message
          : 'Esto lo respondí yo con tus datos, sin la IA.',
    }
    return
  }

  if (!received.trim()) {
    await release()
    yield { event: 'delta', data: fallback }
  }

  yield { event: 'done', data: AI_MODEL }
}

/** The answer without an Anthropic call at all. */
async function* offline(answer: string, reason: string): AsyncGenerator<SseEvent> {
  yield { event: 'delta', data: answer }
  yield { event: 'error', data: reason }
}
