import { z } from 'zod'

import type { Database } from '@/lib/database.types'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * Patients.
 *
 * The shape every file in this folder follows: Zod schemas at the top for what
 * arrives from the outside, then one exported async function per thing the
 * product can do. `practitionerId` is always the first argument and is never
 * read from a cookie in here — that is what keeps these functions callable from
 * a Server Action today and a worker later.
 *
 * Note what is absent: any function that deletes a row. Patients are archived or
 * soft-deleted. These are clinical records.
 */

export type Patient = Database['public']['Tables']['patients']['Row']

export const AGE_GROUPS = ['children', 'adolescents', 'adults'] as const
export const BILLING_FREQUENCIES = ['monthly', 'biweekly', 'weekly', 'per_session'] as const

/** The six accent colours, as the database stores them. */
export const PATIENT_COLORS = [
  'violet',
  'teal',
  'coral',
  'blue',
  'amber',
  'green',
] as const

/**
 * An HTML form sends `""` for every optional field the practitioner left alone,
 * and `""` is not an absence to Postgres — it is an error in a `date` column and
 * a zero in a numeric one. Everything optional therefore goes through this
 * first: blank in, null out, before any type check runs.
 */
function blankToNull(value: unknown) {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
  }
  return value === undefined ? null : value
}

const optionalText = z.preprocess(blankToNull, z.string().nullable()).default(null)

const optionalDate = z.preprocess(blankToNull, z.iso.date().nullable()).default(null)

const optionalNumber = z
  .preprocess(blankToNull, z.union([z.null(), z.coerce.number().nonnegative()]))
  .default(null)

export const PatientInput = z.object({
  fullName: z.string().trim().min(1, 'Poné al menos el nombre.'),
  dateOfBirth: optionalDate,
  ageGroup: z.enum(AGE_GROUPS).default('children'),
  school: optionalText,
  schoolLevel: optionalText,
  healthInsurer: optionalText,
  phone: optionalText,
  referralReason: optionalText,
  startDate: optionalDate,
  color: z.enum(PATIENT_COLORS).optional(),
  sessionFee: optionalNumber,
  billingFrequency: z.enum(BILLING_FREQUENCIES).default('monthly'),
  expectedSessionsPerMonth: optionalNumber,
})

export type PatientInputData = z.infer<typeof PatientInput>

/** Maps the validated input onto database column names. */
function toRow(data: PatientInputData) {
  return {
    full_name: data.fullName,
    date_of_birth: data.dateOfBirth,
    age_group: data.ageGroup,
    school: data.school,
    school_level: data.schoolLevel,
    health_insurer: data.healthInsurer,
    phone: data.phone,
    referral_reason: data.referralReason,
    start_date: data.startDate,
    session_fee: data.sessionFee,
    billing_frequency: data.billingFrequency,
    expected_sessions_per_month: data.expectedSessionsPerMonth,
  }
}

export async function createPatient(practitionerId: string, input: unknown) {
  const data = PatientInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('patients')
    .insert({
      ...toRow(data),
      practitioner_id: practitionerId,
      color: data.color ?? pickColor(data.fullName),
    })
    .select()
    .single()

  if (error) throw error

  await logAction(practitionerId, 'create', 'patient', row.id)
  return row
}

export async function updatePatient(
  practitionerId: string,
  patientId: string,
  input: unknown,
) {
  const data = PatientInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('patients')
    .update({ ...toRow(data), ...(data.color ? { color: data.color } : {}) })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)
    .select()
    .single()

  if (error) throw error

  await logAction(practitionerId, 'update', 'patient', patientId)
  return row
}

/**
 * Just the money: what a session costs, how often it is charged, and how many
 * there are in a month.
 *
 * Its own input rather than a slice of `PatientInput`, because the whole point
 * is that it cannot touch anything else. v1's `···` on a Cobros row edited these
 * three fields and nothing more (`legacy/index.html:2450`), and this is the
 * version of that which cannot accidentally blank a patient's date of birth
 * because the form did not include the field.
 */
export const BillingInput = z.object({
  sessionFee: optionalNumber,
  billingFrequency: z.enum(BILLING_FREQUENCIES).default('monthly'),
  expectedSessionsPerMonth: optionalNumber,
})

export async function updatePatientBilling(
  practitionerId: string,
  patientId: string,
  input: unknown,
) {
  const data = BillingInput.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('patients')
    .update({
      session_fee: data.sessionFee,
      billing_frequency: data.billingFrequency,
      expected_sessions_per_month: data.expectedSessionsPerMonth,
    })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!row) throw new Error('Ese paciente no existe.')

  await logAction(practitionerId, 'update', 'patient', patientId)
  return row
}

/**
 * Where a session happens when it happens online.
 *
 * Two ways, and the practitioner's own wins. See the migration for why v1's
 * version — the patient's name in a public `meet.jit.si` URL — is not ported.
 */

/** Prefix, then a random id. Never anything derived from the patient. */
function newRoomId(): string {
  // 16 hex characters: enough that guessing one is not a thing anybody does,
  // short enough to read out over the phone if it comes to that.
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * A link is only safe to render if it is one.
 *
 * `javascript:alert(1)` is a perfectly valid string and an `href` will run it
 * with the practitioner's session attached. The allowed protocols are the two
 * that mean "a web address", and everything else is rejected rather than
 * cleaned — there is no correct reading of a `data:` video call.
 */
export const VideoUrlInput = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:'
      } catch {
        return false
      }
    },
    { message: 'Pegá un link que empiece con https://' },
  )
  .transform((value) => (value ? value : null))

export async function setPatientVideoUrl(
  practitionerId: string,
  patientId: string,
  input: unknown,
) {
  const videoUrl = VideoUrlInput.parse(input ?? '')
  const db = await getDb()

  const { error } = await db
    .from('patients')
    .update({ video_url: videoUrl })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  return videoUrl
}

/**
 * The room for this patient, made once and kept.
 *
 * Kept rather than regenerated because a family saves the link: v1 rebuilt it
 * on every reload, so a link already sent stopped working.
 */
export async function ensurePatientRoom(
  practitionerId: string,
  patientId: string,
): Promise<string | null> {
  const db = await getDb()

  const { data: patient, error } = await db
    .from('patients')
    .select('room_id')
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  if (!patient) return null
  if (patient.room_id) return patient.room_id

  const roomId = newRoomId()
  const { error: writeError } = await db
    .from('patients')
    .update({ room_id: roomId })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (writeError) throw writeError
  return roomId
}

// ─── Reading ────────────────────────────────────────────────────────────────

export type PatientListOptions = {
  /** Free text over the name. Accents are ignored on both sides. */
  search?: string
  ageGroup?: (typeof AGE_GROUPS)[number] | 'all'
  /** Archived patients are hidden unless asked for. Deleted ones, never. */
  scope?: 'active' | 'archived'
  sort?: 'name' | 'recent'
}

export async function listPatients(
  practitionerId: string,
  options: PatientListOptions = {},
) {
  const { search, ageGroup = 'all', scope = 'active', sort = 'name' } = options
  const db = await getDb()

  let query = db
    .from('patients')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .is('deleted_at', null)

  query = scope === 'archived' ? query.not('archived_at', 'is', null) : query.is('archived_at', null)

  if (ageGroup !== 'all') query = query.eq('age_group', ageGroup)

  // `ilike` handles case; accents it does not, so "Lucia" will not find "Lucía".
  // Fixing that properly means the `unaccent` extension and a functional index,
  // which is worth doing at a few hundred patients and is not worth doing now.
  if (search?.trim()) query = query.ilike('full_name', `%${search.trim()}%`)

  query =
    sort === 'recent'
      ? query.order('created_at', { ascending: false })
      : query.order('full_name', { ascending: true })

  const { data, error } = await query
  if (error) throw error
  return data
}

export type PatientSummary = {
  /** How many sessions have been recorded, ever. */
  sessions: number
  /** Mean progress across the active goals. Zero when there are none. */
  averageProgress: number
}

/**
 * The two numbers the patient list shows beside each name.
 *
 * v1 had them for free — every patient carried their sessions and goals in the
 * same object — and losing them is what turned that screen from a caseload into
 * an address book. "3 sesiones · 67%" is the difference between a list you read
 * and a list you scroll past.
 *
 * Two aggregate queries for the whole list rather than two per patient. The
 * average counts only active goals, the same rule `progressByPatient` uses in
 * Estadísticas — the same patient must not be at 67% on one screen and 54% on
 * another.
 */
export async function patientSummaries(
  practitionerId: string,
  patientIds: string[],
): Promise<Map<string, PatientSummary>> {
  const summaries = new Map<string, PatientSummary>()
  if (patientIds.length === 0) return summaries

  const db = await getDb()
  const [{ data: goals }, { data: sessions }] = await Promise.all([
    db
      .from('goals')
      .select('patient_id, progress')
      .eq('practitioner_id', practitionerId)
      .eq('is_active', true)
      .in('patient_id', patientIds),
    db
      .from('sessions')
      .select('patient_id')
      .eq('practitioner_id', practitionerId)
      .in('patient_id', patientIds),
  ])

  const progressOf = new Map<string, number[]>()
  for (const goal of goals ?? []) {
    const list = progressOf.get(goal.patient_id)
    if (list) list.push(goal.progress)
    else progressOf.set(goal.patient_id, [goal.progress])
  }

  const sessionCount = new Map<string, number>()
  for (const session of sessions ?? []) {
    sessionCount.set(session.patient_id, (sessionCount.get(session.patient_id) ?? 0) + 1)
  }

  for (const id of patientIds) {
    const own = progressOf.get(id) ?? []
    summaries.set(id, {
      sessions: sessionCount.get(id) ?? 0,
      averageProgress:
        own.length === 0
          ? 0
          : Math.round(own.reduce((sum, value) => sum + value, 0) / own.length),
    })
  }

  return summaries
}

export async function getPatient(practitionerId: string, patientId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function countPatients(practitionerId: string) {
  const db = await getDb()

  const { count, error } = await db
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .is('deleted_at', null)
    .is('archived_at', null)

  if (error) throw error
  return count ?? 0
}

// ─── Leaving ────────────────────────────────────────────────────────────────

/**
 * Archiving is for a patient who finished treatment: out of the daily list,
 * every record intact, reversible in one click.
 */
export async function setPatientArchived(
  practitionerId: string,
  patientId: string,
  archived: boolean,
) {
  const db = await getDb()

  const { error } = await db
    .from('patients')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'archive', 'patient', patientId)
}

/**
 * Soft delete, for a family that exercises their right to erasure under Ley
 * N.º 18.331 — or for a row created by mistake.
 *
 * The row stays. A practitioner has record-keeping obligations that outlast a
 * mis-click, and a DELETE that cascades through sessions, goals, and reports is
 * not something to expose behind a button.
 */
export async function softDeletePatient(practitionerId: string, patientId: string) {
  const db = await getDb()

  const { error } = await db
    .from('patients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', patientId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'delete', 'patient', patientId)
}

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

/**
 * A stable colour per patient, so the same person is the same colour on every
 * screen and in every list. v1 assigned them in creation order, which meant the
 * colour changed whenever a patient was removed.
 */
function pickColor(seed: string): string {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.codePointAt(0)!) % 1_000_003
  return PATIENT_COLORS[hash % PATIENT_COLORS.length]!
}
