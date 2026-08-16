'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { createMaterial, deleteMaterial } from '@/server/materials'
import { getPractitioner } from '@/server/practitioners'

export async function createMaterialAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  let material
  try {
    material = await createMaterial(user.id, practitioner.discipline, {
      title: formData.get('title'),
      area: formData.get('area'),
      focus: formData.get('focus'),
      kind: formData.get('kind') ?? 'activity',
      objective: formData.get('objective'),
      content: formData.get('content'),
      ageRange: formData.get('ageRange'),
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const issues = (error as { issues: { message: string }[] }).issues
      return formError(issues[0]?.message ?? 'Revisá los datos.')
    }
    return formError('No pudimos guardar el material. Probá de nuevo.')
  }

  revalidatePath('/materiales')
  redirect(`/materiales/${material.id}`)
}

export async function deleteMaterialAction(formData: FormData) {
  const user = await requireUser()

  await deleteMaterial(user.id, String(formData.get('materialId')))
  revalidatePath('/materiales')
  redirect('/materiales')
}
