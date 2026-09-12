import { createHash, randomBytes } from 'node:crypto'

import { z } from 'zod'

import { fillConsent } from '@/lib/consent-template'
import type { Database } from '@/lib/database.types'
import { disciplineLabel } from '@/lib/disciplines'

import { logAction } from './audit'
import { getDb } from './db'
import { GUARDIAN_RELATIONSHIPS } from './patients'

/**
 * "Antes de empezar" — the link a family opens to fill in the details and sign
 * the consent before the first session.
 *
 * The schema and the reasons for its shape are in
 * `supabase/migrations/20260911165113_patient_forms.sql`. The short version:
 *
 *   The token travels in the link and is never stored; only its SHA-256 is.
 *   The family writes through two `security definer` functions that accept a
 *   token and nothing else — no service-role key, no loosened policy.
 *   What they send waits in `intake_responses` until the practitioner copies it
 *   into the ficha, and only into fields that are empty.
 *   A signed consent can be read and never edited: `consents` has no update or
 *   delete policy.
 */

export type IntakeResponse = Database['public']['Tables']['intake_responses']['Row']
export type Consent = Database['public']['Tables']['consents']['Row']

/** Long enough to reach a family that answers on the weekend; short enough
 *  that a link forwarded to the wrong chat stops working on its own. */
const LINK_LIFETIME_DAYS = 14

/** Who signs: the patient themselves, or one of the responsable relationships. */
export const SIGNER_RELATIONSHIPS = ['self', ...GUARDIAN_RELATIONSHIPS] as const

/** A refusal written to be read, shown as is. Anything else is logged. */
export class PatientFormError extends Error {}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

/** 32 random bytes in base64url are 43 characters. Anything else is not ours. */
export function looksLikeToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token)
}

/**
 * A new link secret: the token that goes in the URL, and its hash, which is
 * the only thing stored. Shared by every kind of link — see `scales.ts`.
 */
export function newLinkToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashToken(token) }
}

// ─── The practitioner's side ────────────────────────────────────────────────

/**
 * Makes a new link and returns its token — the only moment it exists in clear.
 *
 * Any unanswered intake link for the same patient is retired first. The
 * practitioner makes a new one because the old one was lost or went to the
 * wrong person, and in both cases the old one should stop working.
 */
export async function createIntakeLink(practitionerId: string, patientId: string) {
  const db = await getDb()

  const [practitionerResult, patientResult] = await Promise.all([
    db
      .from('practitioners')
      .select('full_name, discipline, consent_template')
      .eq('id', practitionerId)
      .single(),
    db
      .from('patients')
      .select('full_name')
      .eq('id', patientId)
      .eq('practitioner_id', practitionerId)
      .is('deleted_at', null)
      .maybeSingle(),
  ])
  if (practitionerResult.error) throw practitionerResult.error
  if (patientResult.error) throw patientResult.error
  const practitioner = practitionerResult.data
  const patient = patientResult.data
  if (!patient) throw new PatientFormError('No encontramos ese paciente.')

  const now = new Date()
  const { error: retireError } = await db
    .from('patient_forms')
    .update({ expires_at: now.toISOString() })
    .eq('practitioner_id', practitionerId)
    .eq('patient_id', patientId)
    .eq('kind', 'intake')
    .is('submitted_at', null)
    .gt('expires_at', now.toISOString())
  if (retireError) throw retireError

  const { token, hash } = newLinkToken()
  const expiresAt = new Date(now.getTime() + LINK_LIFETIME_DAYS * 24 * 60 * 60 * 1000)

  const { data: row, error } = await db
    .from('patient_forms')
    .insert({
      practitioner_id: practitionerId,
      patient_id: patientId,
      kind: 'intake',
      token_hash: hash,
      consent_text: fillConsent(practitioner.consent_template, {
        practitionerName: practitioner.full_name,
        discipline: disciplineLabel(practitioner.discipline),
        patientName: patient.full_name,
      }),
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()
  if (error) throw error

  await logAction(practitionerId, 'create', 'patient_form', row.id)
  return token
}

/**
 * What the ficha shows about "Antes de empezar": a link still waiting, the
 * latest answers, the latest signature. Any of the three can be missing.
 */
export async function intakeStatus(practitionerId: string, patientId: string) {
  const db = await getDb()
  const now = new Date().toISOString()

  const [open, response, consent] = await Promise.all([
    db
      .from('patient_forms')
      .select('created_at, expires_at')
      .eq('practitioner_id', practitionerId)
      .eq('patient_id', patientId)
      .eq('kind', 'intake')
      .is('submitted_at', null)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('intake_responses')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .eq('patient_id', patientId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('consents')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .eq('patient_id', patientId)
      .order('signed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  if (open.error) throw open.error
  if (response.error) throw response.error
  if (consent.error) throw consent.error

  return {
    openLinkSince: open.data?.created_at ?? null,
    response: response.data,
    consent: consent.data,
  }
}

/** The fields the family's answers can fill in on the ficha. Same names in both tables. */
const COPIED_TO_FICHA = [
  'date_of_birth',
  'school',
  'school_level',
  'health_insurer',
  'phone',
  'guardian_name',
  'guardian_relationship',
  'guardian_email',
] as const

/**
 * "Pasar a la ficha": copies the family's answers into the patient, **only
 * where the ficha is empty**, and marks the answers as reviewed.
 *
 * Only empty fields, because what the practitioner already wrote is the record
 * and a parent's form is a source. Overwriting a date of birth the practitioner
 * checked against the cédula with one typed on a phone at night would be the
 * wrong way round. The free-text answers — why they consult, history,
 * medication — are not copied at all: they stay on the ficha as the family
 * wrote them.
 *
 * Returns the fields that were filled, so the screen can say which.
 */
export async function applyIntakeResponse(practitionerId: string, responseId: string) {
  const db = await getDb()

  const { data: response, error } = await db
    .from('intake_responses')
    .select('*')
    .eq('id', responseId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()
  if (error) throw error
  if (!response) throw new PatientFormError('No encontramos esas respuestas.')
  if (response.applied_at) return []

  const { data: patient, error: patientError } = await db
    .from('patients')
    .select(COPIED_TO_FICHA.join(', '))
    .eq('id', response.patient_id)
    .eq('practitioner_id', practitionerId)
    .single<Pick<IntakeResponse, (typeof COPIED_TO_FICHA)[number]>>()
  if (patientError) throw patientError

  const update: Database['public']['Tables']['patients']['Update'] = {}
  const filled: string[] = []
  for (const field of COPIED_TO_FICHA) {
    const answer = response[field]
    if (answer && !patient[field]) {
      ;(update as Record<string, string>)[field] = answer
      filled.push(field)
    }
  }

  if (filled.length > 0) {
    const { error: updateError } = await db
      .from('patients')
      .update(update)
      .eq('id', response.patient_id)
      .eq('practitioner_id', practitionerId)
    if (updateError) throw updateError
    await logAction(practitionerId, 'update', 'patient', response.patient_id)
  }

  const { error: markError } = await db
    .from('intake_responses')
    .update({ applied_at: new Date().toISOString() })
    .eq('id', responseId)
    .eq('practitioner_id', practitionerId)
  if (markError) throw markError

  return filled
}

export const ConsentTemplateInput = z.object({
  template: z
    .preprocess(
      blankToNull,
      z.string().trim().max(8000, 'El texto es demasiado largo: hasta 8000 caracteres.').nullable(),
    )
    .default(null),
})

/** Null goes back to Hilo's model. */
export async function updateConsentTemplate(practitionerId: string, input: unknown) {
  const { template } = ConsentTemplateInput.parse(input)
  const db = await getDb()

  const { error } = await db
    .from('practitioners')
    .update({ consent_template: template })
    .eq('id', practitionerId)
  if (error) throw error

  await logAction(practitionerId, 'update', 'practitioner', practitionerId)
}

// ─── The family's side ──────────────────────────────────────────────────────

export type PublicForm = {
  kind: 'intake' | 'scale'
  scale: string | null
  practitionerName: string
  patientFirstName: string
  ageGroup: string
  consentText: string | null
  state: 'open' | 'expired' | 'submitted'
}

/**
 * What the page behind a link may show. Runs with whatever session there is —
 * none, for a family — because the function it calls is open to `anon` and
 * returns nothing from the ficha. See the migration.
 */
export async function formByToken(token: string): Promise<PublicForm | null> {
  if (!looksLikeToken(token)) return null

  const db = await getDb()
  const { data, error } = await db.rpc('patient_form_by_token', { raw_token: token })
  if (error) throw error

  const row = data?.[0]
  if (!row) return null

  return {
    kind: row.kind === 'scale' ? 'scale' : 'intake',
    scale: row.scale,
    practitionerName: row.practitioner_name,
    patientFirstName: row.patient_first_name,
    ageGroup: row.age_group,
    consentText: row.consent_text,
    state: row.state === 'submitted' ? 'submitted' : row.state === 'expired' ? 'expired' : 'open',
  }
}

function blankToNull(value: unknown) {
  if (typeof value !== 'string') return value ?? null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const text = (max: number) =>
  z
    .preprocess(blankToNull, z.string().max(max, `Hasta ${max} caracteres.`).nullable())
    .default(null)

export const IntakeInput = z.object({
  dateOfBirth: z
    .preprocess(blankToNull, z.iso.date('Revisá la fecha de nacimiento.').nullable())
    .default(null),
  school: text(200),
  schoolLevel: text(200),
  healthInsurer: text(200),
  phone: text(60),
  guardianName: text(200),
  guardianRelationship: z
    .preprocess(blankToNull, z.enum(GUARDIAN_RELATIONSHIPS).nullable())
    .default(null),
  guardianEmail: z
    .preprocess(blankToNull, z.email('Revisá el correo.').nullable())
    .default(null),
  reason: text(3000),
  history: text(3000),
  medication: text(1000),
  otherProfessionals: text(1000),
  signerName: z
    .string('Escribí tu nombre y apellido para firmar.')
    .trim()
    .min(3, 'Escribí tu nombre y apellido para firmar.')
    .max(200),
  signerRelationship: z.enum(SIGNER_RELATIONSHIPS, 'Contanos quién firma.'),
  accepted: z.literal('on', 'Para enviar tenés que aceptar el consentimiento.'),
})

export type SubmitResult = 'ok' | 'not_found' | 'expired' | 'submitted'

/**
 * Sends the family's answers and signature. Validated here first, so the
 * messages are sentences; the database function checks the token, the dates
 * and the lengths again, because it is the door that is actually open.
 */
export async function submitIntake(
  token: string,
  input: unknown,
  userAgent: string | null,
): Promise<SubmitResult> {
  if (!looksLikeToken(token)) return 'not_found'
  const data = IntakeInput.parse(input)
  const db = await getDb()

  const { data: result, error } = await db.rpc('submit_intake', {
    raw_token: token,
    p_signer_name: data.signerName,
    p_signer_relationship: data.signerRelationship,
    p_date_of_birth: data.dateOfBirth ?? undefined,
    p_school: data.school ?? undefined,
    p_school_level: data.schoolLevel ?? undefined,
    p_health_insurer: data.healthInsurer ?? undefined,
    p_phone: data.phone ?? undefined,
    p_guardian_name: data.guardianName ?? undefined,
    p_guardian_relationship: data.guardianRelationship ?? undefined,
    p_guardian_email: data.guardianEmail ?? undefined,
    p_reason: data.reason ?? undefined,
    p_history: data.history ?? undefined,
    p_medication: data.medication ?? undefined,
    p_other_professionals: data.otherProfessionals ?? undefined,
    p_user_agent: userAgent?.slice(0, 400) ?? undefined,
  })
  if (error) throw error

  return result === 'ok' || result === 'expired' || result === 'submitted' ? result : 'not_found'
}
