import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { disciplineAdjective, recipientTone, type RecipientId } from '@/lib/recipients'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * Reports: storing them, listing them, and titling them.
 *
 * The prompt assembly lives in `report-prompt.ts` and the quota in `plans.ts` —
 * this file only knows about rows.
 */

export type Report = Database['public']['Tables']['reports']['Row']

export type ReportWithPatient = Report & {
  patients: { id: string; full_name: string; color: string | null } | null
}

export const RECIPIENT_IDS = [
  'school',
  'family',
  'health_insurer',
  'anep',
  'physician',
  'patient',
] as const

export const NewReport = z.object({
  patientId: z.uuid('Elegí un paciente.'),
  recipient: z.enum(RECIPIENT_IDS, { message: 'Elegí para quién es el informe.' }),
  inputNotes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
})

/**
 * The title comes from the recipient, not from the practitioner. "Sugerencias de
 * adecuaciones curriculares (ANEP)" is what that document is called; making
 * someone type it every time is how it ends up called something else.
 */
export function titleFor(
  recipient: RecipientId,
  discipline: string,
  patientName: string,
): string {
  return recipientTone(recipient, {
    patientName,
    patientFirstName: patientName,
    age: '',
    disciplineAdjective: disciplineAdjective(discipline),
  }).title
}

export async function createReport(
  practitionerId: string,
  input: {
    patientId: string
    recipient: RecipientId
    title: string
    content: string
    inputNotes?: string | null
    aiGenerated: boolean
    aiModel?: string | null
  },
) {
  const db = await getDb()

  const { data, error } = await db
    .from('reports')
    .insert({
      practitioner_id: practitionerId,
      patient_id: input.patientId,
      recipient: input.recipient,
      title: input.title,
      content: input.content,
      input_notes: input.inputNotes ?? null,
      ai_generated: input.aiGenerated,
      // Stored per document. When the pinned model is replaced we need to be
      // able to say which reports came from which version.
      ai_model: input.aiModel ?? null,
    })
    .select()
    .single()

  if (error) throw error
  await logAction(practitionerId, 'generate', 'report', data.id)
  return data
}

export async function updateReportContent(
  practitionerId: string,
  reportId: string,
  content: string,
) {
  const db = await getDb()

  const { error } = await db
    .from('reports')
    .update({ content })
    .eq('id', reportId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'update', 'report', reportId)
}

export async function getReport(practitionerId: string, reportId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('reports')
    .select('*, patients(id, full_name, color, date_of_birth, school_level)')
    .eq('id', reportId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listReports(
  practitionerId: string,
  patientId?: string,
  limit = 100,
): Promise<ReportWithPatient[]> {
  const db = await getDb()

  let query = db
    .from('reports')
    .select('*, patients(id, full_name, color)')
    .eq('practitioner_id', practitionerId)

  if (patientId) query = query.eq('patient_id', patientId)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function deleteReport(practitionerId: string, reportId: string) {
  const db = await getDb()

  const { error } = await db
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
  await logAction(practitionerId, 'delete', 'report', reportId)
}
