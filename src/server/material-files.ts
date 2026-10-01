import { z } from 'zod'

import { getDb } from './db'
import { MaterialError } from './materials'

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
  if (!row) throw new MaterialError('Ese material no es tuyo, o ya no existe.')
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
