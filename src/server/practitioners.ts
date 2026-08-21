import { z } from 'zod'

import { CALENDAR_PRIVACY } from '@/lib/calendar-privacy'
import type { Tables } from '@/lib/database.types'
import { DISCIPLINE_IDS } from '@/lib/disciplines'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * The practitioner's own profile.
 *
 * One row per signed-up professional, keyed to `auth.users.id`. The row is
 * created by a trigger at sign-up (see the M1 migration), so the normal path
 * never inserts here — it only reads and updates.
 *
 * `createProfile` at the bottom is the repair path, and it exists because the
 * trigger has one blind spot by construction: it fires `after insert on
 * auth.users`, so an account that already existed when the trigger was
 * installed never gets a row. That is not hypothetical — it is what happens to
 * every account carried over from v1, and to any user created through the admin
 * API or an invite.
 */

/**
 * La fila, como la describe la base.
 *
 * Estaba escrita a mano y repetía las nueve columnas. `getPractitioner` hace
 * `select('*')`, así que la lista era una copia que había que acordarse de
 * mantener — y no se mantuvo: al agregar `calendar_privacy` el dato llegaba en
 * la respuesta y el compilador decía que la propiedad no existía.
 *
 * Derivarla de los tipos generados es lo que `CLAUDE.md` da como razón para que
 * no haya capa de mapeo: se cambia el SQL, se regenera, y el compilador señala
 * cada lugar que hay que tocar. Una lista a mano rompe justamente eso.
 */
export type Practitioner = Tables<'practitioners'>

/**
 * Reads the profile. Throws if it is missing.
 *
 * Every screen inside the app shell can assume the profile exists, because the
 * shell checks with `findPractitioner` first and sends anyone without one to
 * `/completar-perfil`. By the time this runs, a missing row really is a broken
 * state worth failing loudly on.
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

/**
 * The same read, but a missing row is an answer rather than an exception.
 *
 * This is what the app shell calls. The difference matters: `.single()` treats
 * "no rows" as an error, and an error thrown from a layout renders the generic
 * "No pudimos cargar esta pantalla" screen on **every** route — including the
 * two buttons on that screen, which both lead back into the shell. Somebody in
 * that state cannot get anywhere, and nothing on screen says why.
 */
export async function findPractitioner(
  practitionerId: string,
): Promise<Practitioner | null> {
  const db = await getDb()
  const { data, error } = await db
    .from('practitioners')
    .select('*')
    .eq('id', practitionerId)
    .maybeSingle()

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
 * Cuánto de un paciente puede salir hacia Google Calendar.
 *
 * Va aparte de `updatePractitioner` porque no es un dato del perfil: es un
 * permiso sobre datos de terceros — los pacientes — que la profesional otorga.
 * Guardarlo con el mismo formulario que el teléfono lo volvería un campo más, y
 * es lo contrario de lo que se quiere: que sea una decisión visible.
 *
 * `z.enum` y no `z.string()`: la base tiene el `check`, pero rebotar acá da un
 * mensaje en castellano en vez de un error de Postgres, y deja el valor
 * inválido afuera antes de tocar la base.
 */
export const CalendarPrivacyUpdate = z.object({
  calendarPrivacy: z.enum(CALENDAR_PRIVACY, {
    message: 'Elegí una de las tres opciones.',
  }),
})

export async function updateCalendarPrivacy(practitionerId: string, input: unknown) {
  const data = CalendarPrivacyUpdate.parse(input)
  const db = await getDb()

  const { data: row, error } = await db
    .from('practitioners')
    .update({ calendar_privacy: data.calendarPrivacy })
    .eq('id', practitionerId)
    .select()
    .single()

  if (error) throw error

  // Queda en el registro de auditoría, como cualquier cambio sobre el perfil.
  // Este más que ninguno: es el que decide qué sale de Hilo hacia afuera.
  await logAction(practitionerId, 'update', 'practitioner', practitionerId)
  return row
}

/**
 * There is no `markOnboarded` here, on purpose.
 *
 * There was one, and it was never called from anywhere. Its comment said a
 * timestamp would save recomputing the onboarding state on every page load,
 * which would have been true if anything had written it. Dead code that
 * describes behaviour the product does not have is worse than no code: the next
 * person reads the comment, believes `onboarded_at` means something, and builds
 * on a column that is always null.
 *
 * "Primeros pasos" works out its three steps from counts instead. Two of them
 * are `head: true` counts that read an index, and the patient list is already
 * being fetched for the screen, so the whole thing costs one extra query while
 * the card is on screen and none afterwards.
 *
 * The `onboarded_at` column stays in the schema. Dropping it needs a migration
 * and it is not in anybody's way.
 */

// ─── The repair path ────────────────────────────────────────────────────────

export const NewProfile = z.object({
  fullName: z.string().trim().min(2, 'Escribí tu nombre y apellido.'),
  discipline: z.enum(DISCIPLINE_IDS, { message: 'Elegí tu profesión.' }),
})

/**
 * Builds the profile for an account that has none.
 *
 * **Not a second sign-up path.** The trigger still owns profile creation for
 * everyone who signs up; this only runs for an account the trigger could never
 * have seen, and `/completar-perfil` is the only thing that calls it.
 *
 * The slug is built by the database's own `slugify`, through RPC, rather than
 * by a copy of it in TypeScript. Two implementations of "how a name becomes a
 * URL" drift, and the day they disagree is the day one practitioner's booking
 * link stops matching the row it is supposed to find.
 *
 * The uniqueness loop mirrors the trigger's: append `-2`, `-3`, and so on. The
 * `slug` column carries a unique constraint, so the check-then-insert race ends
 * in a rejected insert rather than two identical links — which is why the retry
 * is driven by the insert failing, not by the lookup succeeding.
 */
export async function createProfile(
  practitionerId: string,
  email: string,
  input: unknown,
): Promise<Practitioner> {
  const data = NewProfile.parse(input)
  const db = await getDb()

  const { data: base } = await db.rpc('slugify', { input: data.fullName })
  const baseSlug = base && base.length > 0 ? base : 'profesional'

  // Bounded rather than `while (true)`: a loop that cannot end is worse than a
  // profile that fails to save and says so.
  for (let attempt = 1; attempt <= 20; attempt++) {
    const slug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`

    const { data: row, error } = await db
      .from('practitioners')
      .insert({
        id: practitionerId,
        email,
        full_name: data.fullName,
        discipline: data.discipline,
        slug,
      })
      .select()
      .single()

    if (!error) {
      await logAction(practitionerId, 'create', 'practitioner', practitionerId)
      return row
    }

    // 23505 is unique_violation. On the slug it means "taken, try the next one";
    // on the primary key it means the profile already exists, and retrying with
    // a different slug would loop twenty times to reach the same answer.
    if (error.code !== '23505' || !error.message.includes('slug')) throw error
  }

  throw new Error('No pudimos generar una dirección para tu perfil. Probá con otro nombre.')
}
