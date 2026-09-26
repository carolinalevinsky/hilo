import type { FormState } from '@/lib/form-state'

/**
 * What the invitation forms hand back, which is `FormState` plus the link.
 *
 * The link is here because of when it exists. Only the SHA-256 of the token is
 * stored, so the clear token lives for exactly one response — the one that
 * created or resent it. After that nobody, including us, can reconstruct it; the
 * only way to get a working link again is to resend, which mints a new one.
 *
 * So the screen has to offer it right there. That is not a nicety: it is the
 * whole recovery path for the case where Resend accepted the message and it
 * landed in spam, which is silent and common.
 *
 * It lives in its own module and not beside the actions because a `'use server'`
 * file may only export async functions — the same reason `FormState` is in
 * `@/lib/form-state`.
 */
export type InviteState = FormState & {
  /** The clear link, present only on the response that minted it. */
  link?: string
  /** False when Resend refused the message. The invitation exists either way. */
  emailed?: boolean
  /** Who the link is for, so the screen can say it without re-reading the list. */
  invitee?: string
}

export const EMPTY_INVITE_STATE: InviteState = { ok: false, message: null }
