import {
  CustomInstructions,
  saveTemplate,
  TemplateName,
  type TemplateKind,
} from '@/server/prompt-templates'

/**
 * "Tus instrucciones" from a document form (P20): the text to use for this
 * document, and — when "Guardarlas para la próxima" is ticked — saved under the
 * name given. Shared by the report and the assessment actions, which is why it
 * is not in either.
 *
 * Returns a sentence instead of throwing for what the practitioner can fix
 * (too long, no name), so each action can put it under its own form.
 */
export async function readCustomInstructions(
  practitionerId: string,
  kind: TemplateKind,
  formData: FormData,
): Promise<{ text: string | null } | { message: string }> {
  const parsed = CustomInstructions.safeParse(String(formData.get('customInstructions') ?? ''))
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? 'Revisá tus instrucciones.' }
  }

  if (formData.get('saveTemplate') === '1' && parsed.data) {
    const name = TemplateName.safeParse(String(formData.get('templateName') ?? ''))
    if (!name.success) {
      return { message: name.error.issues[0]?.message ?? 'Poné un nombre para guardarlas.' }
    }
    await saveTemplate(practitionerId, kind, name.data, parsed.data)
  }

  return { text: parsed.data }
}
