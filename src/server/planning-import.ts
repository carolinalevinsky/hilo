import { z } from 'zod'

import { AGE_RANGES } from '@/lib/material-areas'

import { streamCompletion } from './ai'
import { readDocument } from './office-files'
import { createMaterial, MATERIAL_KINDS, MaterialInput } from './materials'

/**
 * The plans a practitioner already wrote, brought into her library.
 *
 * Years of planning live in Word files and photos of notebooks, and each one is
 * mostly activities: what to do, with what, for what. Each activity becomes a
 * material — the thing Ombúa already knows how to suggest for a goal, add to a
 * session, adjust with AI and print. A plan written for one patient on one date
 * is not kept as such: the activities are what is worth having twice.
 *
 * Two steps, as with patients. The model reads the file and proposes the
 * activities; the practitioner unticks or corrects; only then is anything
 * saved. The file itself is not stored — what stays is the text she approved.
 */

/** Never more than this from one document. A longer one goes in parts. */
export const MAX_IMPORTED_ACTIVITIES = 30

export type ImportedActivity = {
  title: string
  area: string
  kind: (typeof MATERIAL_KINDS)[number]
  ageRange: string | null
  objective: string | null
  content: string
}

export function planningImportInstructions(discipline: string, areas: string[]): string {
  return `Sos asistente de un/a profesional de ${discipline} en Uruguay. Recibís una planificación que ella ya tenía hecha —un Word, un PDF o una foto de su cuaderno— y la pasás a su biblioteca de materiales de Ombúa: **una entrada por cada actividad** que aparece.

Devolvés **sólo** un arreglo JSON, sin texto antes ni después y sin markdown. Cada elemento:

{
  "titulo": "corto, menos de ocho palabras",
  "area": una de estas, exactamente como está escrita: ${areas.map((area) => `"${area}"`).join(', ')},
  "tipo": "activity" | "game" | "worksheet" | "text" | "guide",
  "edad": una de ${AGE_RANGES.map((range) => `"${range}"`).join(', ')}, o null si el documento no la dice,
  "objetivo": "para qué sirve, en una oración, o null",
  "actividad": "la actividad"
}

Cómo escribir "actividad":
- Con lo que escribió la profesional, ordenado. **No agregues pasos, materiales ni variantes que no están**: es su trabajo, no una sugerencia tuya.
- En secciones, cada una con un renglón corto que termina en dos puntos y el texto abajo. Usá las que tengan contenido: "Cómo se juega:", "Materiales:", "Consigna:", "Variantes:", "Qué observar:".
- Si una sección no está en el documento, no la escribas.

Reglas:
- **No inventes actividades.** Si el documento tiene tres, devolvés tres. Si no tiene ninguna —es una lista de pacientes, un informe, una foto que no se entiende—, devolvés [].
- Encabezados, fechas y datos de agenda del documento no son actividades.
- **Nada de pacientes.** La biblioteca es de actividades: si aparece el nombre de un niño o cualquier dato de un paciente, no lo copies.
- Como mucho ${MAX_IMPORTED_ACTIVITIES} actividades.
- Español rioplatense.`
}

export function planningImportPrompt(documentText: string | null): string {
  return documentText
    ? `La planificación, pasada a texto:\n\n${documentText}\n\nPasá cada actividad a la biblioteca.`
    : 'Pasá cada actividad de la planificación adjunta a la biblioteca.'
}

/**
 * The model's answer, as activities the review screen can show.
 *
 * Tolerant in what it reads and strict in what it keeps: an element with no
 * content is dropped, an area that is not one of hers becomes her first one
 * (the review screen lets her change it), and an age range that is not one of
 * Ombúa's is left empty rather than invented.
 */
export function parseImportedActivities(answer: string, areas: string[]): ImportedActivity[] {
  const json = answer.match(/\[[\s\S]*\]/)?.[0]
  if (!json) return []

  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []

  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
  const fallbackArea = areas[0] ?? 'General'

  return raw
    .flatMap((item): ImportedActivity[] => {
      if (!item || typeof item !== 'object') return []
      const entry = item as Record<string, unknown>
      const content = text(entry.actividad)
      if (content.length < 10) return []

      const area = text(entry.area)
      const kind = text(entry.tipo)
      const ageRange = text(entry.edad)

      return [
        {
          title: (text(entry.titulo) || content.split('\n')[0]!).slice(0, 160),
          area: areas.includes(area) ? area : fallbackArea,
          kind: (MATERIAL_KINDS as readonly string[]).includes(kind)
            ? (kind as ImportedActivity['kind'])
            : 'activity',
          ageRange: (AGE_RANGES as readonly string[]).includes(ageRange) ? ageRange : null,
          objective: text(entry.objetivo) || null,
          content: content.slice(0, 8_000),
        },
      ]
    })
    .slice(0, MAX_IMPORTED_ACTIVITIES)
}

/**
 * Reads the document and proposes the activities. Saves nothing.
 *
 * Throws `OfficeFileError` for a file it cannot open and `AiUnavailableError`
 * when the model does not answer. The quota is the route's business, before
 * this is called.
 */
export async function readPlanningDocument(
  discipline: string,
  areas: string[],
  file: { name: string; type: string; bytes: Uint8Array },
): Promise<ImportedActivity[]> {
  const document = readDocument(file)

  let answer = ''
  for await (const chunk of streamCompletion(
    planningImportInstructions(discipline, areas),
    planningImportPrompt(document.kind === 'text' ? document.text : null),
    document.kind === 'file' ? document.attachment : undefined,
    [],
    'import',
  )) {
    answer += chunk
  }

  return parseImportedActivities(answer, areas)
}

/**
 * Saves the activities the practitioner kept, as private materials of hers.
 *
 * `manual`, not `ai`: these are her own activities, which the model only
 * copied out. "Generado con IA" on them would be false, and they are already
 * paid for by the one unit reading the document cost.
 *
 * Everything is validated before the first row is written, so one bad entry
 * refuses the lot instead of leaving half a plan in the library.
 */
export async function importPlanningMaterials(
  practitionerId: string,
  discipline: string,
  input: unknown,
) {
  const items = z
    .array(z.unknown())
    .min(1, 'Elegí al menos una actividad.')
    .max(MAX_IMPORTED_ACTIVITIES)
    .parse(input)

  // Checked here, written from the original: `createMaterial` parses again,
  // and `MaterialInput`'s output is not valid input (`ownWork` comes out as a
  // boolean it does not accept back).
  const privateItems = items.map((item) => ({ ...(item as object), visibility: 'private' }))
  for (const item of privateItems) MaterialInput.parse(item)

  const created = []
  for (const item of privateItems) created.push(await createMaterial(practitionerId, discipline, item))
  return created
}
