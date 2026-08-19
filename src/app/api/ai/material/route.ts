import { AiUnavailableError, AI_MODEL, streamCompletion } from '@/server/ai'
import { getUser } from '@/server/auth'
import {
  materialAdjustmentPrompt,
  materialInstructions,
  materialPrompt,
  MAX_REQUEST,
  offlineMaterial,
} from '@/server/material-prompt'
import { getMaterial } from '@/server/materials'
import { assertQuota, QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'

import { sseResponse, type SseEvent } from '../sse'

/**
 * Designs an activity from a sentence. v1's "Generar con IA".
 *
 * The same gates as every other AI route, in the same order, before a single
 * token is bought: the session first, then the monthly quota.
 *
 * It spends the `materials` allowance, which counts only rows with
 * `source = 'ai'` — writing a material by hand costs nothing and must never
 * consume an allowance that exists to cap spending. That is also why this is a
 * fourth kind rather than a share of `questions`: generating ten activities on a
 * Sunday should not leave a practitioner without the assistant on Monday.
 *
 * There is no patient here, and no patient id in the body. See
 * `src/server/material-prompt.ts` for why that is a property of the feature
 * rather than an omission.
 */
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'No pudimos verificar tu sesión.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    materialId?: string
    request?: string
    adjustment?: string
  }

  const asked = typeof body.request === 'string' ? body.request.trim() : ''
  const adjustment = typeof body.adjustment === 'string' ? body.adjustment.trim() : ''

  if (!body.materialId) {
    return Response.json({ error: 'Falta el material.' }, { status: 400 })
  }
  if (!adjustment && asked.length < 5) {
    return Response.json({ error: 'Contame qué querés trabajar.' }, { status: 400 })
  }
  if (adjustment && adjustment.length < 3) {
    return Response.json({ error: 'Contame qué querés cambiar.' }, { status: 400 })
  }
  if (asked.length > MAX_REQUEST * 2) {
    return Response.json({ error: 'El pedido es demasiado largo.' }, { status: 400 })
  }

  const [practitioner, material] = await Promise.all([
    getPractitioner(user.id),
    getMaterial(body.materialId),
  ])

  // Loaded through the user's session, so RLS is what proves the row is theirs.
  // A published material belonging to someone else reads cleanly and is still
  // not theirs to regenerate.
  if (!material || material.practitioner_id !== user.id) {
    return Response.json({ error: 'No encontramos ese material.' }, { status: 404 })
  }

  // Adjusting keeps what is already there when the model cannot be reached:
  // replacing an activity the practitioner already has with a generic one
  // because the network blinked would be a loss, not a fallback.
  const fallback = adjustment
    ? material.content
    : offlineMaterial({
        ageRange: material.age_range ?? 'la edad que elegiste',
        request: asked,
      })

  try {
    // `alreadyCounted`: the row exists before this route runs — it was created
    // with an offline activity so that an outage still leaves something usable —
    // so it is already in the month's count. Without this, regenerating the
    // material that used your last allowance would be refused. Adjusting an
    // existing one rides the same allowance, which is the same trade the report
    // editor makes: rewriting what you have is not a new document.
    await assertQuota(user.id, practitioner.plan, 'materials', { alreadyCounted: true })
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return sseResponse(offline(fallback, quotaMessage(error.status)))
    }
    throw error
  }

  return sseResponse(
    generate(
      materialInstructions(practitioner.discipline),
      adjustment
        ? materialAdjustmentPrompt({
            area: material.area,
            ageRange: material.age_range ?? 'sin especificar',
            content: material.content,
            adjustment,
          })
        : materialPrompt({
            area: material.area,
            ageRange: material.age_range ?? 'sin especificar',
            request: asked,
          }),
      fallback,
    ),
  )
}

/**
 * Streamed, unlike the session draft.
 *
 * An activity is five sections rather than three sentences, and it arrives in a
 * read-only preview the practitioner is deciding about — not under a cursor they
 * are already typing with. Watching it appear is better than watching a spinner,
 * which is the same reason report generation streams.
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
      yield { event: 'delta', data: chunk }
    }
  } catch (error) {
    console.error('[ai/material]', error)

    // Only fall back to the offline activity if nothing useful arrived. Half an
    // activity plus a whole second one underneath is worse than half an
    // activity.
    if (!received.trim()) yield { event: 'delta', data: fallback }
    yield {
      event: 'error',
      data:
        error instanceof AiUnavailableError
          ? error.message
          : 'Se cortó la generación. Revisá lo que quedó antes de guardarlo.',
    }
    return
  }

  if (!received.trim()) {
    yield { event: 'delta', data: fallback }
    yield { event: 'error', data: 'El modelo no devolvió nada; te dejo una actividad base.' }
    return
  }

  yield { event: 'done', data: AI_MODEL }
}

async function* offline(draft: string, reason: string): AsyncGenerator<SseEvent> {
  yield { event: 'delta', data: draft }
  yield { event: 'error', data: reason }
}
