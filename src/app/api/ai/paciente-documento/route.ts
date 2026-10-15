import { AiUnavailableError } from '@/server/ai'
import { getUser } from '@/server/auth'
import { claimUsage, releaseUsage } from '@/server/ai-usage'
import { OfficeFileError } from '@/server/office-files'
import { readPatientDocument } from '@/server/patient-document'
import { QuotaExceededError, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'

/**
 * Fills a new patient's form from a document. See `src/server/patient-document.ts`.
 *
 * The same gates as every other AI route, in the same order, before a token is
 * bought: the session, then the monthly quota. It spends a `questions` unit —
 * reading a ficha is a short answer, like a question to the assistant, and
 * charging it to `materials` would make loading patients cost activities.
 *
 * The unit goes back when nothing useful came back: a file that could not be
 * opened, or a model that did not answer.
 */
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'Tenés que volver a entrar a Ombúa.' }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  const name = String(form?.get('fullName') ?? '').trim()

  if (name.length < 2) {
    return Response.json({ error: 'Escribí primero el nombre del paciente.' }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'Elegí un archivo.' }, { status: 400 })
  }

  const practitioner = await getPractitioner(user.id)

  let usageId: string | null
  try {
    usageId = await claimUsage(user.id, practitioner.plan, 'questions')
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return Response.json({ error: quotaMessage(error.status) }, { status: 429 })
    }
    throw error
  }

  try {
    const draft = await readPatientDocument(practitioner.discipline, name, {
      name: file.name,
      type: file.type,
      bytes: new Uint8Array(await file.arrayBuffer()),
    })

    if (Object.keys(draft).length === 0) {
      await releaseUsage(usageId)
      return Response.json(
        { error: 'No encontramos datos del paciente en ese documento. Completalos a mano.' },
        { status: 422 },
      )
    }

    return Response.json({ draft })
  } catch (error) {
    await releaseUsage(usageId)
    if (error instanceof OfficeFileError) {
      return Response.json({ error: error.message }, { status: 422 })
    }
    console.error('[ai/paciente-documento]', error)
    return Response.json(
      {
        error:
          error instanceof AiUnavailableError
            ? error.message
            : 'No pudimos leer el documento con la IA. Completá los datos a mano.',
      },
      { status: 502 },
    )
  }
}
