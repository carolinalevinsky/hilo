/**
 * The short messages the sign-in screen can be sent with, as `?aviso=<code>`.
 *
 * A code rather than the message itself: `/confirmar` redirects here after a
 * link fails, and putting the wording in the URL would mean rendering whatever
 * text an address bar happened to contain.
 */
const NOTICES = {
  'enlace-vencido':
    'Ese enlace no funcionó: puede que haya vencido o que ya lo hayas usado. Pedí uno nuevo.',
} as const

export type AuthNotice = keyof typeof NOTICES

export function noticeFor(value: unknown): string | null {
  return typeof value === 'string' && value in NOTICES
    ? NOTICES[value as AuthNotice]
    : null
}
