import { z } from 'zod'

import { agreementFor } from '@/lib/grammatical-gender'
import { nameParts, type Alias } from '@/lib/pseudonyms'
import { today } from '@/lib/dates'

import { streamCompletion } from './ai'
import { readDocument } from './office-files'
import { parseDate } from './patient-import'
import { AGE_GROUPS, GUARDIAN_RELATIONSHIPS } from './patients'

/**
 * A new patient's form, filled in from a document the practitioner already has —
 * an intake sheet, a referral, last year's report, a photo of the notebook.
 *
 * **The practitioner types the name; the model reads everything else.** The
 * name is the one thing Ombúa promises not to send, so the model is never asked
 * for it. In a Word file it is also hidden from the text before it leaves, the
 * same way a report hides it (`src/lib/pseudonyms.ts`). A PDF or a photo cannot
 * be edited that way, and the screen says so before a file is chosen.
 *
 * Nothing is saved here. What comes back fills the form, and the practitioner
 * reads it and presses "Guardar" like any other alta.
 */

/** What the form receives: the field names it already uses, as strings. */
export type PatientDraft = Partial<
  Record<
    | 'dateOfBirth'
    | 'ageGroup'
    | 'school'
    | 'schoolLevel'
    | 'healthInsurer'
    | 'phone'
    | 'guardianName'
    | 'guardianRelationship'
    | 'guardianEmail'
    | 'referralReason'
    | 'startDate',
    string
  >
>

export function patientDocumentInstructions(discipline: string): string {
  return `Sos asistente de un/a profesional de ${discipline} en Uruguay. Recibís un documento que la profesional ya tenía sobre un paciente —una ficha de ingreso, una derivación, un informe anterior, una foto de su cuaderno— y sacás de ahí los datos para cargar la ficha del paciente en Ombúa.

Devolvés **sólo** un objeto JSON, sin texto antes ni después y sin markdown, con estas claves. Cada una es un texto, o null si el documento no lo dice:

{
  "fechaNacimiento": "AAAA-MM-DD",
  "poblacion": "niños" | "adolescentes" | "adultos",
  "centroEducativo": "nombre del colegio, escuela, liceo o jardín",
  "clase": "por ejemplo 3.º de escuela, nivel 5, 1.º de liceo",
  "mutualista": "mutualista o prestador de salud",
  "telefono": "teléfono de contacto",
  "responsable": "nombre del adulto responsable",
  "vinculo": "madre" | "padre" | "tutor" | "otro",
  "correoResponsable": "correo del responsable",
  "motivoConsulta": "el motivo de consulta o de derivación",
  "inicioTratamiento": "AAAA-MM-DD"
}

Reglas:
- **No inventes.** Si un dato no está escrito en el documento, va null. Un campo vacío lo completa la profesional; uno inventado termina en un informe firmado.
- **Nunca pongas el nombre del paciente** en ninguna clave. Si aparece, ignoralo. Puede venir tapado como [NOMBRE] o [NOMBRE COMPLETO]; dejalo así.
- Las fechas del documento son uruguayas: día, mes y año. Convertilas a AAAA-MM-DD. Si sólo está la edad, no calcules una fecha: dejá "fechaNacimiento" en null y usá la edad para "poblacion".
- "motivoConsulta": con las palabras del documento, resumido en una o dos oraciones si es largo. Sin diagnósticos que el documento no dé.
- Español rioplatense.`
}

export function patientDocumentPrompt(documentText: string | null): string {
  return documentText
    ? `El documento, pasado a texto:\n\n${documentText}\n\nSacá los datos de la ficha.`
    : 'Sacá los datos de la ficha del documento adjunto.'
}

const AGE_GROUP_WORDS: Record<string, (typeof AGE_GROUPS)[number]> = {
  ninos: 'children',
  ninas: 'children',
  adolescentes: 'adolescents',
  adultos: 'adults',
}

const RELATIONSHIP_WORDS: Record<string, (typeof GUARDIAN_RELATIONSHIPS)[number]> = {
  madre: 'mother',
  padre: 'father',
  tutor: 'guardian',
  tutora: 'guardian',
  otro: 'other',
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/**
 * The model's answer, as form values.
 *
 * Every value is checked again here, because the model's word is not the last
 * one: a date that does not parse is dropped rather than shown, an e-mail that
 * is not one is dropped, and anything still holding a name placeholder is
 * dropped — better an empty field than "[NOMBRE]" in the school.
 */
export function parsePatientDraft(answer: string, todayIso = today()): PatientDraft {
  const json = answer.match(/\{[\s\S]*\}/)?.[0]
  if (!json) return {}

  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }

  const text = (key: string, max = 300) => {
    const value = raw[key]
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    if (!trimmed || /\[NOMBRE/.test(trimmed)) return undefined
    return trimmed.slice(0, max)
  }

  const draft: PatientDraft = {}

  const birth = text('fechaNacimiento')
  const birthDate = birth ? parseDate(birth, todayIso) : null
  if (birthDate && birthDate <= todayIso) draft.dateOfBirth = birthDate

  const group = text('poblacion')
  if (group && AGE_GROUP_WORDS[fold(group)]) draft.ageGroup = AGE_GROUP_WORDS[fold(group)]

  const school = text('centroEducativo')
  if (school) draft.school = school
  const level = text('clase')
  if (level) draft.schoolLevel = level
  const insurer = text('mutualista')
  if (insurer) draft.healthInsurer = insurer
  const phone = text('telefono', 60)
  if (phone) draft.phone = phone
  const guardian = text('responsable', 160)
  if (guardian) draft.guardianName = guardian

  const relationship = text('vinculo')
  if (relationship && RELATIONSHIP_WORDS[fold(relationship)]) {
    draft.guardianRelationship = RELATIONSHIP_WORDS[fold(relationship)]
  }

  // En minúsculas: un apellido del paciente adentro del correo
  // ("andrea.acosta@…") viaja tapado y vuelve escrito como nombre propio.
  const email = text('correoResponsable', 200)?.toLowerCase()
  if (email && z.email().safeParse(email).success) draft.guardianEmail = email

  const reason = text('motivoConsulta', 2_000)
  if (reason) draft.referralReason = reason

  const start = text('inicioTratamiento')
  const startDate = start ? parseDate(start, todayIso) : null
  if (startDate) draft.startDate = startDate

  return draft
}

/**
 * One marker per word of the name, each restored as itself.
 *
 * `patientAliases` covers the surname with "[NOMBRE]" and brings it back as the
 * first name, which is right for a report — the patient is "Tomás" throughout —
 * and wrong here, where the surname shows up in somebody else's name: the
 * mother "Laura Pérez" would come back as "Laura Tomás". Here each part goes
 * out as its own marker and comes back as what it was.
 */
export function documentAliases(patientName: string): Alias[] {
  const parts = nameParts(patientName)
  if (parts.length === 0) return []
  const agreement = agreementFor(null, patientName)
  const words = parts.slice(1)

  return [
    { token: '[NOMBRE COMPLETO]', restoreAs: parts[0]!, names: [parts[0]!], agreement },
    ...words.map((word, index) => ({
      token: index === 0 ? '[NOMBRE]' : `[APELLIDO${index === 1 ? '' : ` ${index}`}]`,
      restoreAs: word,
      names: [word],
      agreement,
    })),
  ]
}

/**
 * Reads the document and returns the draft.
 *
 * Throws `OfficeFileError` for a file it cannot open and `AiUnavailableError`
 * when the model does not answer; the route says each in its own words. The
 * quota is the route's business, before this is called.
 */
export async function readPatientDocument(
  discipline: string,
  patientName: string,
  file: { name: string; type: string; bytes: Uint8Array },
): Promise<PatientDraft> {
  const document = readDocument(file)
  const aliases = documentAliases(patientName)

  let answer = ''
  for await (const chunk of streamCompletion(
    patientDocumentInstructions(discipline),
    patientDocumentPrompt(document.kind === 'text' ? document.text : null),
    document.kind === 'file' ? document.attachment : undefined,
    aliases,
    'describe',
  )) {
    answer += chunk
  }

  // The model was told never to write the name; if it did anyway, the field
  // goes. The guardian may share a surname, not the whole name.
  const name = fold(patientName)
  const draft = parsePatientDraft(answer)
  for (const [key, value] of Object.entries(draft) as [keyof PatientDraft, string][]) {
    if (name && fold(value).includes(name)) delete draft[key]
  }
  return draft
}
