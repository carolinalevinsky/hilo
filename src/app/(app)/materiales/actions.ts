'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { offlineMaterial } from '@/server/material-prompt'
import {
  copyMaterial,
  createMaterial,
  deleteMaterial,
  updateMaterial,
} from '@/server/materials'
import { getPractitioner } from '@/server/practitioners'

/** Zod's first message, or a sentence a practitioner can act on. */
function toFormError(error: unknown, fallback: string): FormState {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: { message: string }[] }).issues
    return formError(issues[0]?.message ?? 'Revisá los datos.')
  }
  if (error instanceof Error && error.message) return formError(error.message)
  return formError(fallback)
}

/**
 * A placeholder title from the request, cut at a word.
 *
 * v1 sliced at a fixed 42 characters and left things like "…de pala" in the
 * library. Cutting at the last space before the limit costs one line and is the
 * difference between a placeholder and a typo.
 */
function titleFrom(request: string): string {
  const capitalised = request.charAt(0).toUpperCase() + request.slice(1)
  if (capitalised.length <= 60) return capitalised

  const cut = capitalised.slice(0, 60)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 30 ? cut.slice(0, lastSpace) : cut).replace(/[\s:,;.]+$/, '')}…`
}

function readForm(formData: FormData) {
  return {
    title: formData.get('title'),
    area: formData.get('area'),
    focus: formData.get('focus'),
    kind: formData.get('kind') ?? 'activity',
    objective: formData.get('objective'),
    content: formData.get('content'),
    ageRange: formData.get('ageRange'),
    visibility: formData.get('visibility') ?? 'private',
    ownWork: formData.get('ownWork') ?? undefined,
  }
}

export async function createMaterialAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  let material
  try {
    material = await createMaterial(user.id, practitioner.discipline, readForm(formData), {
      authorName: practitioner.full_name,
    })
  } catch (error) {
    return toFormError(error, 'No pudimos guardar el material. Probá de nuevo.')
  }

  revalidatePath('/materiales')
  redirect(`/materiales/${material.id}`)
}

export async function updateMaterialAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)
  const materialId = String(formData.get('materialId'))

  try {
    await updateMaterial(user.id, materialId, readForm(formData), {
      authorName: practitioner.full_name,
    })
  } catch (error) {
    return toFormError(error, 'No pudimos guardar los cambios. Probá de nuevo.')
  }

  revalidatePath('/materiales')
  revalidatePath(`/materiales/${materialId}`)
  redirect(`/materiales/${materialId}`)
}

/**
 * "Generar con IA": creates the row, then hands off to the streaming route.
 *
 * Same two-step as a report, and for the same reason. The material is saved
 * first with an offline activity in it, so a practitioner who asked for
 * something two minutes before a session gets something usable even if Anthropic
 * is down — and so the monthly count includes a generation whether or not the
 * model answered. Counting only what gets saved at the end would let someone
 * generate fifty activities, keep none, and pay for all of them.
 */
export async function generateMaterialAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  const asked = String(formData.get('request') ?? '').trim()
  if (asked.length < 5) return formError('Contame qué querés trabajar.')

  const ageRange = String(formData.get('ageRange') ?? '').trim()
  let material
  try {
    material = await createMaterial(
      user.id,
      practitioner.discipline,
      {
        // v1 titled it with the request itself, trimmed. It is a placeholder
        // that says what you asked for, and the edit form is one screen away.
        title: titleFrom(asked),
        area: formData.get('area'),
        focus: null,
        kind: 'activity',
        objective: asked,
        content: offlineMaterial({ ageRange: ageRange || 'cualquier edad', request: asked }),
        ageRange,
        visibility: 'private',
      },
      { source: 'ai' },
    )
  } catch (error) {
    return toFormError(error, 'No pudimos generar el material. Probá de nuevo.')
  }

  revalidatePath('/materiales')
  redirect(
    `/materiales/${material.id}/editar?generar=${encodeURIComponent(asked.slice(0, 300))}`,
  )
}

export async function copyMaterialAction(formData: FormData) {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  const copy = await copyMaterial(
    user.id,
    practitioner.discipline,
    String(formData.get('materialId')),
  )

  revalidatePath('/materiales')
  // Straight to the copy's own edit form: you copy something in order to change
  // it, and landing on a read-only view of a duplicate is a dead end.
  redirect(`/materiales/${copy.id}/editar`)
}

export async function deleteMaterialAction(formData: FormData) {
  const user = await requireUser()

  await deleteMaterial(user.id, String(formData.get('materialId')))
  revalidatePath('/materiales')
  redirect('/materiales')
}
