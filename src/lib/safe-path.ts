/**
 * Turns a path that came from outside into one it is safe to redirect to.
 *
 * Two places need this, and both take the destination from something a stranger
 * can write: `?volver=` on the sign-in screen, and `?next=` on the link inside
 * an email. Redirecting to whatever arrives is an open redirect — a URL on
 * Hilo's own domain that hands someone, freshly signed in, to a page that is not
 * Hilo. For a tool whose sign-in screen guards clinical records, that is a
 * credible way to phish a practitioner.
 *
 * `//ejemplo.com` is the form that gets missed: it passes a `startsWith('/')`
 * check and a browser reads it as a full URL on another host. So the rule is one
 * leading slash and not two.
 */
export function internalPath(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback
}
