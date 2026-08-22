import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { searchPattern } from '@/lib/search'

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

export type MaterialSummary = Pick<
  Material,
  | 'id'
  | 'practitioner_id'
  | 'discipline'
  | 'title'
  | 'area'
  | 'focus'
  | 'kind'
  | 'objective'
  | 'age_range'
  | 'visibility'
  | 'source'
  | 'author_name'
>

const SUMMARY_COLUMNS =
  'id, practitioner_id, discipline, title, area, focus, kind, objective, age_range, visibility, source, author_name'

export async function listMaterials(
  practitionerId: string,
  filters: MaterialFilters,
): Promise<MaterialSummary[]> {
  const db = await getDb()

  let query = db.from('materials').select(SUMMARY_COLUMNS)

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
  // Una sola columna, y el valor va como argumento en vez de concatenado dentro
  // de un `or(...)`. Eso es lo que hace desaparecer la clase de error que produjo
  // el 500 al escribir una coma: ya no hay filtro que armar con texto.
  if (filters.search?.trim()) {
    query = query.ilike('search_text', searchPattern(filters.search.trim()))
  }

  const { data, error } = await query.order('title')
  if (error) throw error
  return data
}

// ─── The attached file ──────────────────────────────────────────────────────

const FILE_BUCKET = 'material-files'

/**
 * What can be uploaded, and what the bucket accepts. Kept in step with the
 * `allowed_mime_types` in the migration — Storage would reject a mismatch
 * anyway, but with an error nobody can read.
 */
export const MATERIAL_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const MaterialFileUpload = z.object({
  contentType: z.enum(MATERIAL_FILE_TYPES, {
    message: 'El archivo tiene que ser un PDF o una imagen.',
  }),
  bytes: z
    .instanceof(ArrayBuffer)
    .refine((b) => b.byteLength > 0, 'El archivo llegó vacío.')
    .refine(
      (b) => b.byteLength <= 10 * 1024 * 1024,
      'El archivo no puede pesar más de 10 MB.',
    ),
})

/**
 * Attaches a file to a material you own.
 *
 * The path is `<practitioner_id>/<material_id>`, and the Storage policies check
 * that first segment rather than trusting this function to build it correctly.
 * `upsert` because replacing the scan of a worksheet is a normal thing to do and
 * should not leave the old one behind.
 */
export async function saveMaterialFile(
  practitionerId: string,
  materialId: string,
  input: unknown,
) {
  const { contentType, bytes } = MaterialFileUpload.parse(input)
  const db = await getDb()

  const path = `${practitionerId}/${materialId}`

  const { error: uploadError } = await db.storage
    .from(FILE_BUCKET)
    .upload(path, bytes, { contentType, upsert: true })

  if (uploadError) throw uploadError

  const { data: row, error } = await db
    .from('materials')
    .update({ file_path: path, file_type: contentType })
    .eq('id', materialId)
    .eq('practitioner_id', practitionerId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!row) throw new Error('Ese material no es tuyo, o ya no existe.')
  return row
}

/**
 * A short-lived URL for the attached file.
 *
 * Signed rather than public: a photo taken in a consulting room can have a
 * child's name on the page, and a URL that never expires cannot be recalled.
 * The Storage policy decides whether this succeeds — for a community material it
 * does, for somebody else's private one it does not.
 */
export type MaterialFileLinks = {
  /** Opens in place — what the preview embeds. */
  url: string
  /** Saves to disk under a readable name. */
  downloadUrl: string
}

export async function getMaterialFileUrl(
  filePath: string | null,
  /** Becomes the saved filename. The material's title, usually. */
  downloadName = 'material',
): Promise<MaterialFileLinks | null> {
  if (!filePath) return null

  const db = await getDb()

  // Two signed URLs from one call each, because they differ only in what the
  // storage server puts in `Content-Disposition`. The `download` flag is what
  // actually forces a save — the HTML `download` attribute is **ignored on a
  // cross-origin link**, and these URLs point at Supabase, not at the app. A
  // button labelled "Descargar" that opens a tab instead is a small lie, and
  // this is the only way to stop it telling one.
  const [inline, attachment] = await Promise.all([
    db.storage.from(FILE_BUCKET).createSignedUrl(filePath, 60 * 60),
    db.storage.from(FILE_BUCKET).createSignedUrl(filePath, 60 * 60, {
      download: downloadName,
    }),
  ])

  if (inline.error || !inline.data) return null

  return {
    url: inline.data.signedUrl,
    downloadUrl: attachment.data?.signedUrl ?? inline.data.signedUrl,
  }
}

/**
 * A filename someone will recognise in their downloads folder.
 *
 * The extension comes from the stored mime type rather than from the original
 * name, which is not kept: a file saved as `material.pdf` opens, and one saved
 * with no extension makes the operating system ask what to do with it.
 */
export function materialFileName(title: string, fileType: string | null): string {
  const slug =
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'material'

  const extension =
    {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
    }[fileType ?? ''] ?? 'archivo'

  return `${slug}.${extension}`
}

/** The bytes themselves, base64, for handing to the model. */
export async function readMaterialFile(
  filePath: string,
): Promise<{ base64: string } | null> {
  const db = await getDb()

  const { data, error } = await db.storage.from(FILE_BUCKET).download(filePath)
  if (error || !data) return null

  const buffer = Buffer.from(await data.arrayBuffer())
  return { base64: buffer.toString('base64') }
}

/**
 * How many materials this practitioner can see, without loading any of them.
 *
 * Only "Primeros pasos" asks, and only until it is finished — but a new
 * practitioner's most useful fact on day one is that the library is already
 * full, and reading eleven whole rows including their `content` to print one
 * number would be a strange way to say so.
 */
export async function countMaterials(
  practitionerId: string,
  discipline: string,
): Promise<number> {
  const db = await getDb()

  const { count, error } = await db
    .from('materials')
    .select('id', { count: 'exact', head: true })
    .or(
      `practitioner_id.eq.${practitionerId},discipline.eq.${discipline},discipline.is.null,visibility.eq.public`,
    )

  if (error) throw error
  return count ?? 0
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
 * Marks a material as one the model wrote part of, which is what puts it in the
 * month's count.
 *
 * It exists for the uploaded file that gets described. Generating a material
 * from a sentence sets `source` at insert time, but an upload is a file the
 * practitioner already owned — that alone costs nothing and must not spend an
 * allowance. It becomes an AI material at the moment somebody asks Hilo to read
 * it, which is the moment the file is sent to Anthropic, and that is where this
 * is called from.
 *
 * Idempotent on purpose: re-reading the same file is a correction, not a second
 * material, and the route only calls this the first time.
 */
export async function markMaterialAiWritten(practitionerId: string, materialId: string) {
  const db = await getDb()

  const { error } = await db
    .from('materials')
    .update({ source: 'ai' })
    .eq('id', materialId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
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
export function bestMaterialFor<T extends Pick<Material, 'title' | 'focus' | 'area' | 'objective'>>(
  goalTitle: string,
  materials: T[],
): T | null {
  const words = normalise(goalTitle)
    .split(/\s+/)
    .filter((word) => word.length > 3)

  if (words.length === 0) return null

  let best: T | null = null
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
