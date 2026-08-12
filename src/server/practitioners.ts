import { z } from 'zod'

import { DISCIPLINE_IDS } from '@/lib/disciplines'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * The practitioner's own profile.
 *
 * One row per signed-up professional, keyed to `auth.users.id`. The row is
 * created by a trigger at sign-up (see the M1 migration), so nothing here
 * inserts — it only reads and updates.
 */

export type Practitioner = {
  id: string
  email: string
  full_name: string
  discipline: string
  plan: string
  slug: string | null
  phone: string | null
  onboarded_at: string | null
  created_at: string
}

/**
 * Reads the profile. Throws if it is missing, which would mean the sign-up
 * trigger did not run — a broken state worth failing loudly on rather than
 * rendering an empty shell around.
 */
export async function getPractitioner(practitionerId: string): Promise<Practitioner> {
  const db = await getDb()
  const { data, error } = await db
    .from('practitioners')
    .select('*')
    .eq('id', practitionerId)
    .single()

  if (error) throw error
  return data
}

export const ProfileUpdate = z.object({
  fullName: z.string().trim().min(2, 'Escribí tu nombre y apellido.'),
  discipline: z.enum(DISCIPLINE_IDS, { message: 'Elegí tu profesión.' }),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value ? value : null)),
})

export async function updatePractitioner(practitionerId: string, input: unknown) {
  const data = ProfileUpdate.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('practitioners')
    .update({
      full_name: data.fullName,
      discipline: data.discipline,
      phone: data.phone,
    })
    .eq('id', practitionerId)
    .select()
    .single()

  if (error) throw error

  await logAction(practitionerId, 'update', 'practitioner', practitionerId)
  return row
}

/**
 * Marks the two-step onboarding as finished. v1 showed the onboarding card
 * until the practitioner had both a patient and a session; a timestamp says the
 * same thing without recomputing it on every page load.
 */
export async function markOnboarded(practitionerId: string) {
  const db = await getDb()
  const { error } = await db
    .from('practitioners')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', practitionerId)
    .is('onboarded_at', null)

  if (error) throw error
}
