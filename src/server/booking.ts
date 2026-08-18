import { createHash } from 'node:crypto'

import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { env } from '@/lib/env'

import { getDb, getServiceDb } from './db'

/**
 * Public booking requests. **Defect #6.**
 *
 * v1 let the browser INSERT into `reservas` anonymously, with a caller-supplied
 * `prof_id`. This file is the replacement, and the third of the four places
 * allowed to use the service-role client — because the person filling in the
 * form has no session for RLS to check.
 *
 * Everything an anonymous visitor can reach is in the first half of this file
 * and it is deliberately tiny: look up a practitioner by slug, and write one row
 * whose shape is fully validated.
 */

export type BookingRequest = Database['public']['Tables']['booking_requests']['Row']

export type BookingRequestWithPatient = BookingRequest & {
  patients: { id: string; full_name: string } | null
}

export const PublicBooking = z.object({
  name: z.string().trim().min(2, 'Escribí el nombre.').max(120),
  phone: z
    .string()
    .trim()
    .min(6, 'Dejanos un teléfono para poder responderte.')
    .max(30),
  preferredWeekday: z
    .union([z.coerce.number().int().min(0).max(6), z.literal(''), z.null(), z.undefined()])
    .transform((value) => (value === '' || value === null || value === undefined ? null : value)),
  preferredTime: z
    .union([z.string().regex(/^\d{2}:\d{2}$/), z.literal(''), z.null(), z.undefined()])
    .transform((value) => (value ? value : null)),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
})

/**
 * The public face of a practitioner: three fields, from a slug.
 *
 * Goes through a `security definer` function rather than a select, because the
 * `practitioners` policy is `id = auth.uid()` and a visitor has no uid. The
 * function returns a name and a discipline and nothing else — loosening the
 * policy instead would have opened the whole row.
 */
export async function practitionerBySlug(slug: string) {
  const db = getServiceDb()
  const { data, error } = await db.rpc('practitioner_by_slug', { lookup_slug: slug })

  if (error) throw error
  return data?.[0] ?? null
}

/**
 * Records a booking request from the public form.
 *
 * `practitionerId` is resolved from the slug by the caller and never taken from
 * the submitted form. That is the whole of defect #6: in v1 the browser said
 * which practitioner the row belonged to.
 */
export async function createBookingRequest(
  practitionerId: string,
  input: unknown,
  submitterHash?: string,
) {
  const data = PublicBooking.parse(input)
  const db = getServiceDb()

  const { data: row, error } = await db
    .from('booking_requests')
    .insert({
      practitioner_id: practitionerId,
      name: data.name,
      phone: data.phone,
      preferred_weekday: data.preferredWeekday,
      preferred_time: data.preferredTime,
      note: data.note,
      submitter_hash: submitterHash ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return row
}

/**
 * Turns a sender's IP into the opaque token the rate limit counts by.
 *
 * Salted with the app's own secret so the hash cannot be reversed by trying the
 * four billion IPv4 addresses, and scoped per practitioner so one page's
 * counters say nothing about another's. **The IP is never stored** — a family's
 * address is personal data and a clinical records system has no reason to keep a
 * log of who visited a booking page.
 */
export function submitterHash(practitionerId: string, ip: string): string {
  return createHash('sha256')
    .update(`${env.CRON_SECRET}:${practitionerId}:${ip}`)
    .digest('hex')
    .slice(0, 32)
}

/**
 * The practitioner's email, for the booking notification.
 *
 * Service role, because there is no session here — the person who filled in the
 * form is not signed in, and `practitioner_by_slug` deliberately does not return
 * an email address to anything the public can reach.
 */
export async function practitionerEmail(practitionerId: string): Promise<string | null> {
  const db = getServiceDb()
  const { data } = await db
    .from('practitioners')
    .select('email')
    .eq('id', practitionerId)
    .maybeSingle()

  return data?.email ?? null
}

/** How many requests this sender has made in the last hour. */
export async function recentRequestCount(hash: string): Promise<number> {
  const db = getServiceDb()
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count, error } = await db
    .from('booking_requests')
    .select('id', { count: 'exact', head: true })
    .eq('submitter_hash', hash)
    .gte('created_at', since)

  if (error) throw error
  return count ?? 0
}

/**
 * How many a sender may submit in an hour.
 *
 * Not a full rate limiter and not pretending to be one: it counts rows, so it
 * cannot see requests that were rejected, and a determined spammer changes IP.
 * What it stops is the realistic case — a form submitted forty times by one
 * person or one script — without adding Redis and a dependency to a form that
 * receives a handful of entries a week.
 */
export const BOOKINGS_PER_HOUR = 5

// ─── The practitioner's inbox ───────────────────────────────────────────────

export async function listBookingRequests(
  practitionerId: string,
  status?: 'pending' | 'confirmed' | 'dismissed',
): Promise<BookingRequestWithPatient[]> {
  const db = await getDb()

  let query = db
    .from('booking_requests')
    .select('*, patients(id, full_name)')
    .eq('practitioner_id', practitionerId)

  if (status) query = query.eq('status', status)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// `countPendingBookings` used to live here, for the Agenda card that showed a
// number and a link to somewhere else. That card now renders the requests and
// answers them, so the count has no caller — and a query nobody runs is a thing
// to keep working for no reason.

export async function getBookingRequest(practitionerId: string, requestId: string) {
  const db = await getDb()

  const { data, error } = await db
    .from('booking_requests')
    .select('*')
    .eq('id', requestId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function dismissBookingRequest(practitionerId: string, requestId: string) {
  const db = await getDb()

  const { error } = await db
    .from('booking_requests')
    .update({ status: 'dismissed' })
    .eq('id', requestId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
}

export async function markBookingConfirmed(
  practitionerId: string,
  requestId: string,
  patientId: string,
) {
  const db = await getDb()

  const { error } = await db
    .from('booking_requests')
    .update({ status: 'confirmed', patient_id: patientId })
    .eq('id', requestId)
    .eq('practitioner_id', practitionerId)

  if (error) throw error
}
