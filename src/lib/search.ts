/**
 * Turning what somebody typed into a `LIKE` pattern that means what they typed.
 *
 * `%` and `_` are wildcards to Postgres and `\` is its escape character, so a
 * search box that passes the term straight through quietly does the wrong thing:
 * typing `%` matches every row, and `_` matches any single character. Neither is
 * dangerous — RLS decides what exists — but neither is what anyone means when
 * they type it into a box labelled "buscar".
 *
 * This is only half the story where the value goes inside a PostgREST `or(…)`
 * filter, which parses commas and parentheses of its own. See `searchFilter` in
 * `src/server/materials.ts` for the second layer.
 */
export function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (character) => `\\${character}`)}%`
}
