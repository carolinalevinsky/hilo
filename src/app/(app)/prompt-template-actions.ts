'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/server/auth'
import { deleteTemplate } from '@/server/prompt-templates'

/**
 * Deleting saved instructions (P20), from the report or the assessment form.
 *
 * Documents already written with them keep their own copy
 * (`custom_instructions`), so this changes nothing that was signed.
 */
export async function deleteTemplateAction(formData: FormData) {
  const user = await requireUser()

  await deleteTemplate(user.id, String(formData.get('templateId') ?? ''))
  revalidatePath('/informes/nuevo')
  revalidatePath('/evaluaciones/nueva')
}
