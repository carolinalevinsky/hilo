/**
 * The informed consent a family signs from the "Antes de empezar" link.
 *
 * Hilo ships a model so that nobody has to start from a blank page, and each
 * practitioner can replace it with their own in Mi perfil. Either way the text
 * is filled in and **copied onto the link when it is created** — see
 * `patient_forms.consent_text` — so what a family signed stays exactly what
 * they read, whatever the model says next month.
 *
 * ─── What the model is, and is not ─────────────────────────────────────────
 *
 * It is written from the three laws that apply to every discipline Hilo
 * serves: consent recorded in the historia clínica and, for a minor, from
 * whoever is responsible for them with the child's view taken into account
 * (Ley 19.529); the historia belongs to the patient and they can have a copy
 * (Ley 18.335); personal data rights (Ley 18.331).
 *
 * It is **not** reviewed by a lawyer, and it does not include what each
 * professional body adds on top — the Coordinadora de Psicólogos' code of
 * ethics could not be read when this was written. Mi perfil says so next to
 * it, in words, rather than presenting it as finished.
 *
 * ─── Placeholders ──────────────────────────────────────────────────────────
 *
 * `{profesional}`, `{disciplina}` and `{paciente}`, in the model and in a
 * practitioner's own text. Anything else in braces is left alone: a typo in a
 * placeholder should read as a typo, not vanish.
 */

export const CONSENT_PLACEHOLDERS = ['{profesional}', '{disciplina}', '{paciente}'] as const

export const DEFAULT_CONSENT_TEMPLATE = `Autorizo a {profesional} ({disciplina}) a realizar la evaluación y el tratamiento de {paciente}.

Entiendo que:

• El trabajo consiste en entrevistas, evaluaciones y sesiones. La frecuencia y la duración se acuerdan con {profesional} y se pueden revisar en cualquier momento.

• Lo que se habla y se registra en las sesiones es confidencial. Sólo se comparte con mi autorización, o cuando la ley lo exige o hay un riesgo grave para {paciente} o para otras personas.

• {profesional} lleva una historia clínica con los datos, las evaluaciones y el registro de cada sesión. La historia clínica es de {paciente} y puedo pedir una copia (Ley N.º 18.335).

• Los datos se guardan en Hilo, la herramienta que usa {profesional}, y se tratan según la Ley N.º 18.331 de protección de datos personales. Puedo pedir acceder a ellos o corregirlos.

• Puedo retirar este consentimiento cuando quiera, avisándole a {profesional}. Eso no cambia lo que ya se hizo hasta ese momento.

• Puedo hacer todas las preguntas que necesite, antes de firmar y durante el tratamiento.

Si {paciente} es menor de edad, firmo como su madre, padre o responsable, y su opinión se va a tener en cuenta según su edad y su madurez (Ley N.º 19.529).`

/** The text as the family will read it, names filled in. */
export function fillConsent(
  template: string | null,
  values: { practitionerName: string; discipline: string; patientName: string },
): string {
  const text = template?.trim() ? template : DEFAULT_CONSENT_TEMPLATE
  return text
    .replaceAll('{profesional}', values.practitionerName)
    .replaceAll('{disciplina}', values.discipline)
    .replaceAll('{paciente}', values.patientName)
}
