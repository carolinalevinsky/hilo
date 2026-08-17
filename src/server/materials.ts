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

export const MATERIAL_VISIBILITIES = ['private', 'public'] as const
export type MaterialVisibility = (typeof MATERIAL_VISIBILITIES)[number]

/** Where a material came from. Only 'ai' counts against the generation quota. */
export type MaterialSource = 'manual' | 'ai'

/**
 * Which of the three kinds of row this is, for the badge on the card.
 *
 * Order matters: your own published material is still yours, and reads "Tuyo"
 * rather than "De la comunidad" — you are looking at your own library.
 */
export function materialOrigin(
  material: Pick<Material, 'practitioner_id' | 'visibility'>,
  practitionerId: string,
): 'hilo' | 'mine' | 'community' {
  if (material.practitioner_id === null) return 'hilo'
  if (material.practitioner_id === practitionerId) return 'mine'
  return 'community'
}

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

  visibility: z.enum(MATERIAL_VISIBILITIES).default('private'),

  /**
   * The authorship declaration v1 asked for before publishing
   * (`legacy/index.html:832`), and the reason it is validated here rather than
   * only in the browser: a checkbox is a suggestion until the server refuses
   * without it. ARASAAC and the other open banks are non-commercial, and a test
   * manual is somebody's copyright — neither belongs in a shared library.
   */
  ownWork: z
    .union([z.literal('on'), z.literal('1'), z.literal(true)])
    .optional()
    .transform((value) => value !== undefined),
})
  .refine((data) => data.visibility === 'private' || data.ownWork, {
    message:
      'Para publicar en la comunidad, confirmá que el material es tuyo o que tenés permiso para compartirlo.',
    path: ['ownWork'],
  })

export type MaterialFilters = {
  discipline: string
  area?: string
  ageRange?: string
  search?: string
  /** Only what this practitioner wrote. */
  onlyMine?: boolean
  /** Only what other practitioners published. */
  onlyCommunity?: boolean
}

export async function listMaterials(
  practitionerId: string,
  filters: MaterialFilters,
): Promise<Material[]> {
  const db = await getDb()

  let query = db.from('materials').select('*')

  if (filters.onlyMine) {
    query = query.eq('practitioner_id', practitionerId)
  } else if (filters.onlyCommunity) {
    // Published by someone else. `neq` on a uuid column is null-unsafe in
    // Postgres — Hilo's own rows have a NULL author and `neq` would drop them
    // silently either way — so the two conditions are stated separately.
    query = query.eq('visibility', 'public').not('practitioner_id', 'is', null)
    query = query.neq('practitioner_id', practitionerId)
  } else {
    // Hilo's materials for this discipline, plus everything the practitioner
    // wrote, plus what the community published. A shared material with no
    // discipline suits everyone.
    query = query.or(
      `practitioner_id.eq.${practitionerId},discipline.eq.${filters.discipline},discipline.is.null,visibility.eq.public`,
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
  options: { source?: MaterialSource; authorName?: string } = {},
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
      visibility: data.visibility,
      source: options.source ?? 'manual',
      author_name: data.visibility === 'public' ? (options.authorName ?? null) : null,
    })
    .select()
    .single()

  if (error) throw error
  return row
}

/**
 * Edit a material you wrote.
 *
 * v1's material modal was `contenteditable` — you typed straight into the
 * document and nothing was ever saved, so every edit was lost on reload. This is
 * the same affordance made real, through a form.
 *
 * `.eq('practitioner_id', …)` alongside the RLS policy is deliberate belt and
 * braces: the policy already prevents writing someone else's row, and the filter
 * makes the intent readable at the call site rather than only in the schema.
 */
export async function updateMaterial(
  practitionerId: string,
  materialId: string,
  input: unknown,
  options: { authorName?: string } = {},
) {
  const data = MaterialInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('materials')
    .update({
      title: data.title,
      area: data.area,
      focus: data.focus,
      kind: data.kind,
      objective: data.objective,
      content: data.content,
      age_range: data.ageRange,
      visibility: data.visibility,
      // Unpublishing clears the byline; republishing sets it again from the
      // current name. Neither rewrites what other people already copied.
      author_name: data.visibility === 'public' ? (options.authorName ?? null) : null,
    })
    .eq('id', materialId)
    .eq('practitioner_id', practitionerId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!row) throw new Error('Ese material no es tuyo, o ya no existe.')
  return row
}

/**
 * Take a copy of a community material into your own library, to edit it.
 *
 * A copy rather than a reference: the point of taking it is to change it for the
 * child in front of you, and editing the original would rewrite it under
 * everyone else who took it too. The copy starts private and keeps
 * `copied_from`, so where it came from stays true.
 *
 * The read goes through RLS, which is what makes "a material you are allowed to
 * see" the only thing that can be copied — a private row belonging to someone
 * else returns nothing here, exactly as if it did not exist.
 */
export async function copyMaterial(
  practitionerId: string,
  discipline: string,
  materialId: string,
) {
  const db = await getDb()

  const original = await getMaterial(materialId)
  if (!original) throw new Error('Ese material no existe.')
  if (original.practitioner_id === practitionerId) {
    throw new Error('Ese material ya es tuyo.')
  }

  const { data: row, error } = await db
    .from('materials')
    .insert({
      practitioner_id: practitionerId,
      discipline,
      title: original.title,
      area: original.area,
      focus: original.focus,
      kind: original.kind,
      objective: original.objective,
      content: original.content,
      age_range: original.age_range,
      // Always private, whatever the original was. Copying is not republishing:
      // that is the author's decision about their own work, not yours.
      visibility: 'private',
      source: original.source,
      copied_from: original.id,
    })
    .select()
    .single()

  if (error) throw error
  await logAction(practitionerId, 'create', 'material', row.id)
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
