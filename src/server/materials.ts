import { z } from 'zod'

import type { Database } from '@/lib/database.types'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * The materials library.
 *
 * Rows with a NULL `practitioner_id` ship with Hilo and everyone sees them; rows
 * with an id belong to one practitioner. The policy handles the split, so
 * nothing here has to remember it — a plain select returns both.
 */

export type Material = Database['public']['Tables']['materials']['Row']

export const MATERIAL_KINDS = ['activity', 'game', 'worksheet', 'text', 'guide'] as const

export const MaterialInput = z.object({
  title: z.string().trim().min(2, 'Poné un título.').max(160),
  area: z.string().trim().min(1, 'Elegí un área.'),
  focus: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  kind: z.enum(MATERIAL_KINDS).default('activity'),
  objective: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  content: z.string().trim().min(10, 'Escribí la consigna o la actividad.'),
  ageRange: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
})

export type MaterialFilters = {
  discipline: string
  area?: string
  ageRange?: string
  search?: string
  /** Only what this practitioner wrote. */
  onlyMine?: boolean
}

export async function listMaterials(
  practitionerId: string,
  filters: MaterialFilters,
): Promise<Material[]> {
  const db = await getDb()

  let query = db.from('materials').select('*')

  if (filters.onlyMine) {
    query = query.eq('practitioner_id', practitionerId)
  } else {
    // Hilo's materials for this discipline, plus everything the practitioner
    // wrote. A shared material with no discipline suits everyone.
    query = query.or(
      `practitioner_id.eq.${practitionerId},discipline.eq.${filters.discipline},discipline.is.null`,
    )
  }

  if (filters.area) query = query.eq('area', filters.area)
  if (filters.ageRange) query = query.eq('age_range', filters.ageRange)
  if (filters.search?.trim()) {
    const term = filters.search.trim()
    query = query.or(`title.ilike.%${term}%,objective.ilike.%${term}%,focus.ilike.%${term}%`)
  }

  const { data, error } = await query.order('title')
  if (error) throw error
  return data
}

export async function getMaterial(materialId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('materials')
    .select('*')
    .eq('id', materialId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createMaterial(
  practitionerId: string,
  discipline: string,
  input: unknown,
) {
  const data = MaterialInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('materials')
    .insert({
      practitioner_id: practitionerId,
      discipline,
      title: data.title,
      area: data.area,
      focus: data.focus,
      kind: data.kind,
      objective: data.objective,
      content: data.content,
      age_range: data.ageRange,
    })
    .select()
    .single()

  if (error) throw error
  return row
}

export async function deleteMaterial(practitionerId: string, materialId: string) {
  const db = await getDb()

  const { error } = await db
    .from('materials')
    .delete()
    .eq('id', materialId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'delete', 'material', materialId)
}

/**
 * The material that best fits a goal, by word overlap with its title, focus and
 * objective.
 *
 * v1's `matchMaterial` (`legacy/index.html:1110`), and the same deliberately
 * simple approach: count how many words of four letters or more appear in the
 * material's text. It is not search, it is a nudge — "you set a goal about
 * conciencia fonológica, here is a bingo for it" — and being occasionally
 * unhelpful costs nothing because the practitioner is one click from the full
 * library.
 */
export function bestMaterialFor(goalTitle: string, materials: Material[]): Material | null {
  const words = normalise(goalTitle)
    .split(/\s+/)
    .filter((word) => word.length > 3)

  if (words.length === 0) return null

  let best: Material | null = null
  let bestScore = 0

  for (const material of materials) {
    const haystack = normalise(
      `${material.title} ${material.focus ?? ''} ${material.area} ${material.objective ?? ''}`,
    )
    const score = words.filter((word) => haystack.includes(word)).length
    if (score > bestScore) {
      bestScore = score
      best = material
    }
  }

  return bestScore > 0 ? best : null
}

/** Lowercase, accents stripped, so "fonológica" matches "fonologica". */
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}
