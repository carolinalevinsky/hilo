'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
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
