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
 * ─── Why this parses instead of checking prefixes ──────────────────────────
 *
 * It used to be `startsWith('/') && !startsWith('//')`, which reads exactly
 * right and is wrong. `//ejemplo.com` was the form it was written to catch;
 * `/\ejemplo.com` is the one it let through, and a browser reads that as
 * another host too:
 *
 *     new URL('/\\ejemplo.com', 'https://app.hilo.uy')  →  https://ejemplo.com/
 *
 * That is the WHATWG URL parser, not a quirk: after the first slash, a
 * backslash puts it into "special authority ignore slashes" state and what
 * follows becomes the host. `/\/x`, `/\\x` and a tab or newline wedged in the
 * middle all do the same thing, and every one of them survives a prefix check
 * somebody would have to think of in advance.
 *
 * So the rule is no longer a shape to match. The value is parsed against a
 * base that cannot exist, and it is only returned if it stayed there. Anything
 * that reached out to another origin comes back as the fallback, and no future
 * spelling of "another origin" needs to be predicted.
 */

/**
 * A host no registry will ever resolve. `.invalid` is reserved by RFC 2606 for
 * exactly this, so a bug that let one of these escape would be inert.
 */
const NOWHERE = 'https://hilo.invalid'

export function internalPath(value: unknown, fallback: string): string {
  // Checked before parsing, not instead of it: a bare `pacientes` would resolve
  // relative to the base and come back looking internal.
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback

  let url: URL
  try {
    url = new URL(value, NOWHERE)
  } catch {
    return fallback
  }

  if (url.origin !== NOWHERE) return fallback

  // Rebuilt from the parsed parts rather than returned as it arrived, so what
  // ships is what was actually checked. `hash` is dropped: nothing in Hilo
  // navigates by fragment, and it is the one part that never reaches the server.
  return `${url.pathname}${url.search}`
}
