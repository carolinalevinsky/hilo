import { z } from 'zod'

import { getDb } from './db'

/**
 * La foto del paciente, en Storage. Salió de `patients.ts`.
 */

// ─── Photo ──────────────────────────────────────────────────────────────────

const PHOTO_BUCKET = 'patient-photos'

const PhotoUpload = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'La foto tiene que ser JPG, PNG o WebP.',
  }),
  bytes: z
    .instanceof(ArrayBuffer)
    .refine((b) => b.byteLength > 0, 'El archivo llegó vacío.')
    .refine((b) => b.byteLength <= 3 * 1024 * 1024, 'La foto no puede pesar más de 3 MB.'),
})

/**
 * Stores the photo and records its path.
 *
 * The path is `<practitioner_id>/<patient_id>`, which is not a convention this
 * function is trusted to follow — the storage policy checks the first segment
 * against `auth.uid()` on every request.
 */
export async function savePatientPhoto(
  practitionerId: string,
  patientId: string,
  input: unknown,
) {
  const { contentType, bytes } = PhotoUpload.parse(input)
  const db = await getDb()

  const path = `${practitionerId}/${patientId}`

  const { error: uploadError } = await db.storage
    .from(PHOTO_BUCKET)
    .upload(path, bytes, { contentType, upsert: true })

  if (uploadError) throw uploadError

  const { error } = await db
    .from('patients')
    .update({ photo_path: path })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  return path
}

export async function removePatientPhoto(practitionerId: string, patientId: string) {
  const db = await getDb()
  const path = `${practitionerId}/${patientId}`

  await db.storage.from(PHOTO_BUCKET).remove([path])

  const { error } = await db
    .from('patients')
    .update({ photo_path: null })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
}

/**
 * A short-lived signed URL for a stored photo.
 *
 * The bucket is private, so there is no permanent URL to hand out. An hour is
 * long enough for a page to render and short enough that a link copied out of
 * the DOM stops working the same afternoon.
 */
export async function getPhotoUrl(photoPath: string | null): Promise<string | null> {
  if (!photoPath) return null

  const db = await getDb()
  const { data, error } = await db.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(photoPath, 60 * 60)

  if (error) return null
  return data.signedUrl
}
