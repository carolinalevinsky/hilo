import { AiUnavailableError, canDescribe, streamCompletion } from '@/server/ai'
import { getUser } from '@/server/auth'
import {
  fileDescriptionInstructions,
  fileDescriptionPrompt,
  parseFileDescription,
} from '@/server/material-prompt'
import { getMaterial, readMaterialFile } from '@/server/materials'
import { assertQuota, QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'

/**
 * Reads an uploaded material and writes what it is.
 *
 * The same gates as every other AI route, in the same order, before a token is
 * bought: the session, then the material through RLS, then the monthly quota.
 *
 * **This is the one route that sends a file to Anthropic.** Everywhere else only
 * text the practitioner typed leaves the server. The upload form says so above
 * the file field, before anything is chosen, and the privacy policy says it too
 * — a practitioner should not discover this from a changelog.
 *
 * It answers as JSON rather than SSE, unlike its neighbours: the reply is three
 * short fields that have to be split apart before they mean anything, so there
 * is nothing to show until it is complete.
 */
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'No pudimos verificar tu sesión.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { materialId?: string }
  if (!body.materialId) {
    return Response.json({ error: 'Falta el material.' }, { status: 400 })
  }

  const [practitioner, material] = await Promise.all([
    getPractitioner(user.id),
    getMaterial(body.materialId),
  ])

  if (!material || material.practitioner_id !== user.id) {
    return Response.json({ error: 'No encontramos ese material.' }, { status: 404 })
  }
  if (!material.file_path) {
    return Response.json({ error: 'Ese material no tiene archivo.' }, { status: 400 })
  }

  // HEIC is stored but cannot be read by the API. Saying which file it is beats
  // a generic failure — the practitioner can re-take the photo as JPG or just
  // write the description themselves.
  if (!canDescribe(material.file_type)) {
    return Response.json(
      {
        error:
          'Ese formato no lo puede leer la IA. Escribí la descripción a mano, o subí el archivo como PDF o JPG.',
      },
      { status: 422 },
    )
  }

  try {
    // `alreadyCounted`: the material row exists before this runs, so it is
    // already in the month's count. Same as regenerating one.
    await assertQuota(user.id, practitioner.plan, 'materials', { alreadyCounted: true })
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return Response.json({ error: quotaMessage(error.status) }, { status: 429 })
    }
    throw error
  }

  const file = await readMaterialFile(material.file_path)
  if (!file) {
    return Response.json({ error: 'No pudimos leer el archivo.' }, { status: 500 })
  }

  let answer = ''
  try {
    for await (const chunk of streamCompletion(
      fileDescriptionInstructions(practitioner.discipline),
      fileDescriptionPrompt(material.area),
      { mediaType: material.file_type, data: file.base64 },
    )) {
      answer += chunk
    }
  } catch (error) {
    console.error('[ai/material-archivo]', error)
    return Response.json(
      {
        error:
          error instanceof AiUnavailableError
            ? error.message
            : 'No pudimos leer el archivo con la IA. Escribí la descripción a mano.',
      },
      { status: 502 },
    )
  }

  if (!answer.trim()) {
    return Response.json(
      { error: 'La IA no devolvió nada. Escribí la descripción a mano.' },
      { status: 502 },
    )
  }

  return Response.json(parseFileDescription(answer))
}
