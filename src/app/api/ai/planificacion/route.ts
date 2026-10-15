import { areasFor } from '@/lib/material-areas'
import { AiUnavailableError } from '@/server/ai'
import { getUser } from '@/server/auth'
import { claimUsage, releaseUsage } from '@/server/ai-usage'
import { OfficeFileError } from '@/server/office-files'
import { readPlanningDocument } from '@/server/planning-import'
import { QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'

/**
 * Reads a plan and proposes the activities in it. See
 * `src/server/planning-import.ts`. Nothing is saved here.
 *
 * Session, then quota, before a token is bought. One `materials` unit per
 * document, however many activities come out of it: the cost is reading the
 * file, and charging per activity would punish exactly the practitioner with
 * the most work to bring in. It goes back when nothing came out.
 */
export const maxDuration = 300

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'Tenés que volver a entrar a Ombúa.' }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'Elegí un archivo.' }, { status: 400 })
  }

  const practitioner = await getPractitioner(user.id)

  let usageId: string | null
  try {
    usageId = await claimUsage(user.id, practitioner.plan, 'materials')
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return Response.json({ error: quotaMessage(error.status) }, { status: 429 })
    }
    throw error
  }

  try {
    const activities = await readPlanningDocument(
      practitioner.discipline,
      Object.keys(areasFor(practitioner.discipline)),
      { name: file.name, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()) },
    )

    if (activities.length === 0) {
      await releaseUsage(usageId)
      return Response.json(
        {
          error:
            'No encontramos actividades en ese documento. Si es una foto, probá con una más nítida.',
        },
        { status: 422 },
      )
    }

    return Response.json({ activities })
  } catch (error) {
    await releaseUsage(usageId)
    if (error instanceof OfficeFileError) {
      return Response.json({ error: error.message }, { status: 422 })
    }
    console.error('[ai/planificacion]', error)
    return Response.json(
      {
        error:
          error instanceof AiUnavailableError
            ? error.message
            : 'No pudimos leer la planificación con la IA. Probá de nuevo en un rato.',
      },
      { status: 502 },
    )
  }
}
