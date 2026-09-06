/**
 * How the Supabase session cookie is written.
 *
 * That cookie is not a session identifier. It holds the whole session — the
 * access token **and the refresh token** — chunked across `sb-<ref>-auth-token`,
 * `…-auth-token.0`, `…-auth-token.1`. Whoever reads it is signed in as that
 * practitioner until they revoke it, which for a refresh token means until
 * somebody thinks to.
 *
 * ─── Why this file exists at all ───────────────────────────────────────────
 *
 * `@supabase/ssr` has defaults, and they are written for the case this app does
 * not have — a Supabase client running in the browser, which needs to read the
 * cookie from JavaScript:
 *
 *     DEFAULT_COOKIE_OPTIONS = { path: "/", sameSite: "lax",
 *                                httpOnly: false, maxAge: 400 days }
 *
 * No `secure`, and `httpOnly: false`. Passing no `cookieOptions` accepts both.
 * That was the state of this app: the two cookies with the shortest lives and
 * the smallest blast radius — the recovery marker in `(auth)/recovery-cookie.ts`
 * and the OAuth `state` in `api/google/conectar/route.ts` — each set `httpOnly`
 * and `secure` by hand, and the one that is worth more than both together took
 * a library default nobody had read.
 *
 * Hilo has no browser Supabase client and cannot grow one by accident: rule 2 in
 * `eslint.config.mjs` refuses `@supabase/*` from `src/app/` and
 * `src/components/`. So nothing needs to read this from JavaScript, and
 * `httpOnly` costs nothing.
 *
 * ─── Why it is shared rather than written twice ────────────────────────────
 *
 * Two clients write this cookie — `getDb()` in `src/server/db.ts` and the token
 * refresh in `src/proxy.ts` — and if they disagree, the safe one is overwritten
 * by the other on the next request. A copy in each file is a copy that drifts.
 */
export const AUTH_COOKIE_OPTIONS = {
  /**
   * No script reads this. Without it, an XSS anywhere on the origin — or a
   * browser extension with permission to read cookies — is not a defaced page,
   * it is a refresh token in somebody else's hands.
   */
  httpOnly: true,

  /**
   * Never over plain HTTP. Off in development, where there is no certificate on
   * `localhost` and requiring one means no session at all.
   */
  secure: process.env.NODE_ENV === 'production',

  /**
   * `lax` and not `strict`: the links Hilo emails — confirming an account,
   * resetting a password — arrive from a mail client, and `strict` would drop
   * the cookie on that first navigation and sign the practitioner out exactly
   * when they were trying to get in.
   */
  sameSite: 'lax',

  path: '/',
} as const
