/**
 * Small Spanish text helpers.
 *
 * They exist because the difference between "comprensión verbal, memoria de
 * trabajo" and "comprensión verbal y memoria de trabajo" is the difference
 * between a list and a sentence — and these strings end up in a document a
 * professional signs.
 */

/** "a, b y c" — the Spanish list, with no Oxford comma. */
export function joinEs(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

/** Capitalises the first letter and leaves the rest alone. */
export function capitalise(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}
