/**
 * A `fetch` for the Supabase client that survives PostgREST's stale clock.
 *
 * ─── What goes wrong ───────────────────────────────────────────────────────
 *
 * PostgREST checks a token's `iat` against a cached "now", and some of its
 * threads miss updates to that cache. A token Supabase Auth issued a moment ago
 * then looks like it comes from the future, and the query is refused with a 401:
 *
 *   {"code":"PGRST303","message":"JWT issued at future"}
 *
 * It lands on the first queries after a token is minted — which is signing in.
 * Inicio threw it into the error screen, and F5 made it go away, because by
 * then the cache had caught up. Upstream bug, fixed in PostgREST v14.17/v16.1;
 * hosted Supabase rolled back to 14.5 and offers no way to upgrade
 * (supabase discussion #48123), so the fix has to live on this side.
 *
 * ─── Why retrying is safe ──────────────────────────────────────────────────
 *
 * A request refused over its JWT never reached Postgres, so sending it again
 * cannot write twice — inserts included. Only PGRST303 is retried: an expired or
 * forged token (PGRST301, and the rest) is a real answer and returns at once.
 *
 * The waits grow and carry jitter. A fixed short wait tends to hit the same
 * stale thread again.
 */

const RETRY_DELAYS_MS = [200, 400, 800, 1600, 3200]

export function fetchSurvivingStaleClock(
  fetchImpl: typeof fetch = fetch,
  delays: readonly number[] = RETRY_DELAYS_MS,
  sleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
): typeof fetch {
  return async (input, init) => {
    let response = await fetchImpl(input, init)

    for (const delay of delays) {
      if (!(await isIssuedAtFuture(response))) return response
      await sleep(delay / 2 + Math.random() * (delay / 2))
      response = await fetchImpl(input, init)
    }

    return response
  }
}

async function isIssuedAtFuture(response: Response) {
  if (response.status !== 401) return false
  try {
    // A clone, so the caller can still read the body when this is not the case.
    const body = await response.clone().json()
    return body?.code === 'PGRST303'
  } catch {
    return false
  }
}
