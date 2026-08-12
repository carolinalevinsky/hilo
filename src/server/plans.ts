import { getDb } from './db'

/**
 * Plan limits, and the quota check that runs before every call to Anthropic.
 *
 * v1 enforced this in the browser (`legacy/index.html:2775`), which anyone can
 * edit — and the endpoint behind it had no authentication at all
 * (`legacy/api/ia.js:71`), so a stranger who found the URL could drain the
 * Anthropic key. Both halves are fixed here: the count happens on the server,
 * and it happens *before* the expensive call.
 */

export const PLAN_LIMITS = {
  free: { label: 'Gratis', reports: 5, assessments: 10 },
  pro: { label: 'Pro', reports: 200, assessments: 400 },
} as const

export type PlanId = keyof typeof PLAN_LIMITS

/** The two things that cost an Anthropic call. */
export type QuotaKind = 'reports' | 'assessments'

const TABLE: Record<QuotaKind, 'reports' | 'assessments'> = {
  reports: 'reports',
  assessments: 'assessments',
}

export function planLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.free
}

function startOfMonth(): string {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

/**
 * How many of these this practitioner has created in the current calendar month.
 *
 * `count(*)` over an index, not a counter column. A counter is a second copy of
 * the truth that drifts — and the drift is always found at the worst moment,
 * when someone is either blocked from a report they paid for or handed one they
 * should not have been.
 */
export async function countThisMonth(
  practitionerId: string,
  kind: QuotaKind,
): Promise<number> {
  const db = await getDb()

  const { count, error } = await db
    .from(TABLE[kind])
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .gte('created_at', startOfMonth())

  if (error) throw error
  return count ?? 0
}

export type QuotaStatus = {
  kind: QuotaKind
  used: number
  limit: number
  remaining: number
  exceeded: boolean
}

export async function quota(
  practitionerId: string,
  plan: string,
  kind: QuotaKind,
): Promise<QuotaStatus> {
  const limit = planLimits(plan)[kind]
  const used = await countThisMonth(practitionerId, kind)

  return {
    kind,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    exceeded: used >= limit,
  }
}

export class QuotaExceededError extends Error {
  constructor(readonly status: QuotaStatus) {
    super('quota_exceeded')
    this.name = 'QuotaExceededError'
  }
}

/**
 * Throws if the practitioner is over their monthly allowance.
 *
 * **Call this before the Anthropic request, never after.** After is a bill for a
 * document nobody is allowed to keep.
 *
 * `alreadyCounted` is for regeneration. The document exists by the time the AI
 * route runs — it was created with an offline draft so that an outage still
 * leaves something to edit — so it is already in the count, and the practitioner
 * would otherwise be blocked from improving the very report that used their last
 * allowance. It lets someone re-run the model on a document they already own;
 * it does not let them create another one.
 */
export async function assertQuota(
  practitionerId: string,
  plan: string,
  kind: QuotaKind,
  { alreadyCounted = false } = {},
) {
  const status = await quota(practitionerId, plan, kind)
  const used = alreadyCounted ? Math.max(status.used - 1, 0) : status.used

  if (used >= status.limit) throw new QuotaExceededError(status)
  return status
}

export function quotaMessage(status: QuotaStatus): string {
  const what = status.kind === 'reports' ? 'informes' : 'evaluaciones'
  return `Con tu plan ya usaste los ${status.limit} ${what} de este mes. Se renueva el 1.º.`
}
