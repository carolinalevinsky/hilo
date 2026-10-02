import type { Material } from './materials'

/**
 * The material that best fits a goal, by word overlap with its title, focus and
 * objective.
 *
 * v1's `matchMaterial` (`legacy/index.html:1110`), and the same deliberately
 * simple approach: count how many words of four letters or more appear in the
 * material's text. It is not search, it is a nudge — "you set a goal about
 * conciencia fonológica, here is a bingo for it" — and being occasionally
 * unhelpful costs nothing because the practitioner is one click from the full
 * library.
 */
export function bestMaterialFor<T extends Pick<Material, 'title' | 'focus' | 'area' | 'objective'>>(
  goalTitle: string,
  materials: T[],
): T | null {
  return topMaterialsFor(goalTitle, materials, 1)[0] ?? null
}

/**
 * The same match, ranked, for the screens that offer a choice rather than an
 * answer.
 *
 * The planner used to show one material per goal with an "Agregar" beside it,
 * which asks a practitioner to accept a guess or start a search from scratch.
 * The scoring is unchanged — this is the same list `bestMaterialFor` was already
 * computing and throwing away all but the head of.
 *
 * Ties keep the order `materials` arrived in, which is the order the library
 * query chose; there is no meaningful second criterion and inventing one would
 * only make the ranking look more considered than it is.
 */
export function topMaterialsFor<
  T extends Pick<Material, 'title' | 'focus' | 'area' | 'objective'>,
>(goalTitle: string, materials: T[], limit: number): T[] {
  const words = normalise(goalTitle)
    .split(/\s+/)
    .filter((word) => word.length > 3)

  if (words.length === 0) return []

  const scored: { material: T; score: number }[] = []

  for (const material of materials) {
    const haystack = normalise(
      `${material.title} ${material.focus ?? ''} ${material.area} ${material.objective ?? ''}`,
    )
    const score = words.filter((word) => haystack.includes(word)).length
    if (score > 0) scored.push({ material, score })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.material)
}

/** Lowercase, accents stripped, so "fonológica" matches "fonologica". */
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}
