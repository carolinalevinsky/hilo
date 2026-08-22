/**
 * WhatsApp links.
 *
 * WhatsApp is how practitioners in Uruguay actually talk to families — v1 built
 * every "share" around it and that was a correct product decision, not a
 * shortcut.
 *
 * Nothing clinical goes through here. The message says who it is about and that
 * the practitioner is available; the content stays behind the login. A WhatsApp
 * message is an uncontrolled copy of whatever it contains, and under Ley
 * N.º 18.331 clinical data does not belong in one.
 */

/**
 * "099 123 456" → "59899123456".
 *
 * Uruguayan mobile numbers are written locally with a leading 0 that the
 * country code replaces. Ported from `legacy/index.html:1273`.
 */
export function whatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null

  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits) return null
  if (!digits.startsWith('598')) digits = `598${digits}`

  return digits
}

export function whatsappLink(phone: string | null | undefined, text: string): string {
  const number = whatsappNumber(phone)
  const query = `?text=${encodeURIComponent(text)}`
  return number ? `https://wa.me/${number}${query}` : `https://wa.me/${query}`
}

/** The first word of a name — how you address someone here. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}
