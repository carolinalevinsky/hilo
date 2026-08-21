/**
 * Turning what somebody typed into a `LIKE` pattern that means what they typed.
 *
 * `%` and `_` are wildcards to Postgres and `\` is its escape character, so a
 * search box that passes the term straight through quietly does the wrong thing:
 * typing `%` matches every row, and `_` matches any single character. Neither is
 * dangerous — RLS decides what exists — but neither is what anyone means when
 * they type it into a box labelled "buscar".
 */
export function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (character) => `\\${character}`)}%`
}

/**
 * The accents Postgres strips, character for character.
 *
 * This is deliberately a copy of the `translate()` in `public.unaccent_fallback`
 * and not the shorter `normalize('NFD')` trick. The term is compared against
 * `search_text`, a column the database generated with that exact function: if
 * the two normalisations disagree about a single character, the search silently
 * fails to find a row that is right there.
 *
 * NFD would strip *more* than the SQL does, which sounds harmless and is not.
 * Searching for a character SQL leaves alone would produce a term the column can
 * never match.
 *
 * If the SQL function ever changes, this changes with it. `search.test.ts`
 * compares the two against the real database so they cannot drift quietly.
 */
const CON_ACENTO = 'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ'
const SIN_ACENTO = 'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'

/**
 * Lowercased and unaccented, the way the `search_text` columns are.
 *
 * Both halves matter and in this order: the column is `lower(unaccent(...))`, so
 * a term that is unaccented but not lowercased still fails to match.
 */
export function normaliseTerm(term: string): string {
  let out = ''
  for (const character of term) {
    const index = CON_ACENTO.indexOf(character)
    out += index === -1 ? character : SIN_ACENTO[index]
  }
  return out.toLowerCase()
}

/** What goes into `.ilike('search_text', …)`: normalised first, then escaped. */
export function searchPattern(term: string): string {
  return likePattern(normaliseTerm(term))
}
