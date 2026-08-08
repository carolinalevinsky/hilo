import { z } from 'zod'

/**
 * Patients. Built in M2 (see docs/plan-02-migration.md).
 *
 * ─── The shape every file in this folder follows ───────────────────────────
 *
 * A Zod schema at the top describing what comes in from the outside, then one
 * exported async function per thing the product can do. The function takes
 * `practitionerId` explicitly, validates its input, talks to the database, and
 * returns a row. No classes, no interfaces, no repository, no mapper — the
 * generated database types already describe the rows, so there is nothing to
 * map between.
 *
 * Once the `patients` table exists (M2), `createPatient` looks exactly like
 * this:
 *
 *     import { getDb } from './db'
 *
 *     export async function createPatient(practitionerId: string, input: unknown) {
 *       const data = NewPatient.parse(input)
 *       const db = await getDb()
 *       const { data: row, error } = await db
 *         .from('patients')
 *         .insert({ ...data, practitioner_id: practitionerId })
 *         .select()
 *         .single()
 *       if (error) throw error
 *       return row
 *     }
 *
 * Note `practitionerId` is a parameter, never something read from a cookie
 * inside this function. That is what keeps this file callable from a Server
 * Action today and from a background worker later.
 */

export const NewPatient = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().date(),
  referralReason: z.string().optional(),
})

export type NewPatientInput = z.infer<typeof NewPatient>
