import { AiUnavailableError, AI_MODEL, streamCompletion } from '@/server/ai'
import { getUser } from '@/server/auth'
import { getPatient } from '@/server/patients'
import { assertQuota, QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'
import {
  MAX_TRANSCRIPT,
  offlineSessionNote,
  sessionNoteInstructions,
  sessionNotePrompt,
} from '@/server/session-notes'

import { sseResponse, type SseEvent } from '../sse'

/**
 * Turns what was said during a session into the session record.
 *
 * The same gates as the other three AI routes, in the same order, before a
 * single token is bought: the session, then ownership of the patient through
 * RLS, then the monthly quota.
 *
 * It spends the `questions` allowance rather than a fourth counter of its own.
 * A session draft is one short generation, the same size as an assistant answer,
 * and a new quota kind means a new table and a new number for a practitioner to
 * keep track of — for no difference they would ever notice.
 *
 * The body is text. No audio reaches this route; see `src/server/session-notes.ts`.
 */
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'No pudimos verificar tu sesión.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    patientId?: string
    transcript?: string
  }

  const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : ''

  if (!body.patientId) {
    return Response.json({ error: 'Falta el paciente.' }, { status: 400 })
  }
  if (transcript.length < 40) {
    return Response.json(
      { error: 'La grabación quedó muy corta para armar un registro.' },
      { status: 400 },
    )
  }
  if (transcript.length > MAX_TRANSCRIPT * 2) {
    return Response.json({ error: 'La grabación es demasiado larga.' }, { status: 400 })
  }

  const [practitioner, patient] = await Promise.all([
    getPractitioner(user.id),
    getPatient(user.id, body.patientId),
  ])

  // RLS would return nothing for someone else's patient; this turns that into an
  // answer rather than a crash further down.
  if (!patient) {
    return Response.json({ error: 'No encontramos ese paciente.' }, { status: 404 })
  }

  const fallback = offlineSessionNote(transcript)

  try {
    await assertQuota(user.id, practitioner.plan, 'questions')
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return sseResponse(offline(fallback, quotaMessage(error.status)))
    }
    throw error
  }

  return sseResponse(
    generate(
      sessionNoteInstructions(practitioner.discipline),
      sessionNotePrompt(patient.full_name, transcript),
      fallback,
    ),
  )
}

/**
 * Collected in full and sent once, where the other AI routes stream.
 *
 * Two reasons, and the first is a correctness one: the model answers
 * `NO_ALCANZA` when the recording was not enough to work with, and that can only
 * be recognised once the whole answer is in hand. Streaming it would put the
 * word `NO_ALCANZA` in the practitioner's field and then append a correction
 * underneath it.
 *
 * The second is that this lands in a `<textarea>` somebody is about to edit, not
 * on a page they are reading. Text arriving letter by letter under a cursor is
 * worse than a two-second wait — and a session record is two or three sentences,
 * so it is two seconds.
 */
async function* generate(
  instructions: string,
  prompt: string,
  fallback: string,
): AsyncGenerator<SseEvent> {
  let received = ''

  try {
    for await (const chunk of streamCompletion(instructions, prompt)) {
      received += chunk
    }
  } catch (error) {
    console.error('[ai/sesion]', error)

    yield { event: 'delta', data: fallback }
    yield {
      event: 'error',
      data:
        error instanceof AiUnavailableError
          ? `${error.message} Te dejo lo que dictaste, sin ordenar.`
          : 'Te dejo lo que dictaste, sin ordenar.',
    }
    return
  }

  const draft = received.trim()

  // The model's own way of saying the recording was not enough to work with.
  // Better the raw words than a paragraph invented to fill the field.
  if (!draft || draft === 'NO_ALCANZA') {
    yield { event: 'delta', data: fallback }
    yield {
      event: 'error',
      data: 'No alcanzó para armar el registro; te dejo lo que dictaste.',
    }
    return
  }

  yield { event: 'delta', data: draft }
  yield { event: 'done', data: AI_MODEL }
}

async function* offline(draft: string, reason: string): AsyncGenerator<SseEvent> {
  yield { event: 'delta', data: draft }
  yield { event: 'error', data: reason }
}
