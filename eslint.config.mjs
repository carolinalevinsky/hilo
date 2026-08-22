import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/**
 * Three architectural rules.
 *
 * There is no human reviewer on this project — every change goes straight to
 * `main` once CI is green. So each rule below exists because it replaces a check
 * a reviewer would otherwise have to perform by reading the diff, and each one
 * traces to a defect that actually happened in v1.
 *
 * ─── A trap worth knowing about ────────────────────────────────────────────
 *
 * In ESLint flat config, when two config blocks both match a file and both set
 * the same rule, the LATER one REPLACES the earlier one — it does not merge.
 * Writing the three rules as three separate `no-restricted-imports` blocks
 * looks right and silently disables the first two.
 *
 * That is why the restrictions are composed from the shared constants below and
 * every block re-states everything that applies to it. Blocks are ordered
 * general → specific, and the last matching block is always complete.
 *
 * `npm run test:boundaries` proves all three still fire. Run it after touching
 * this file.
 */

const NEXT_IMPORTS = {
  group: ['next', 'next/*'],
  message:
    'src/server/ is framework-agnostic. Pass what you need as an argument ' +
    '(e.g. practitionerId) instead of reading it from the request. ' +
    'The one exception is src/server/db.ts, which owns the session cookie.',
}

const SUPABASE_IMPORTS = {
  group: ['@supabase/*'],
  message:
    'Data access goes through src/server/. Direct client access is how v1 ' +
    'leaked a Mercado Pago token to the browser (legacy/index.html:2477).',
}

const SERVICE_DB_IMPORT = {
  name: '@/server/db',
  importNames: ['getServiceDb'],
  message:
    'The service-role client bypasses RLS entirely. It belongs in the short list ' +
    'in SERVICE_DB_ALLOWED and nowhere else. Use getDb() instead — it carries the ' +
    'user session, and RLS protects the data. If you genuinely need another, add ' +
    'the file to SERVICE_DB_ALLOWED in eslint.config.mjs and say why in the ' +
    'commit message.',
}

/**
 * The only files allowed to bypass Row Level Security.
 *
 * Every entry needs a reason of the same shape: **there is no user session for
 * RLS to check against.** Not "it was easier", not "the policy was in the way".
 *
 * Adding to this list is meant to be a visible act, which is why the rule exists
 * at all — the risk is not one considered exception, it is the tenth unnoticed
 * one.
 */
const SERVICE_DB_ALLOWED = [
  'src/server/db.ts',          // defines it
  'src/server/mercadopago.ts', // MP token read (no policy) + webhook (no session)
  'src/server/booking.ts',     // a family filling in a public form has no session
  'src/server/audit.ts',       // a log the user can write is not a log
  'src/server/digest.ts',      // a cron run acts for every practitioner, as none
]

const restrict = (options) => ({
  'no-restricted-imports': ['error', options],
})

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ── Baseline: nothing anywhere may bypass RLS. ──────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: restrict({ paths: [SERVICE_DB_IMPORT] }),
  },

  // ── Rule 1: the backend does not know it runs inside Next.js. ──────────
  // Keeping framework coupling to one file is what makes "move this backend
  // elsewhere" a one-file rewrite instead of a migration.
  {
    files: ['src/server/**/*.ts'],
    ignores: SERVICE_DB_ALLOWED,
    rules: restrict({ patterns: [NEXT_IMPORTS], paths: [SERVICE_DB_IMPORT] }),
  },

  // The three service-role files: still no next/*, but getServiceDb is theirs.
  {
    files: SERVICE_DB_ALLOWED.filter((f) => f !== 'src/server/db.ts'),
    rules: restrict({ patterns: [NEXT_IMPORTS] }),
  },

  // src/server/db.ts owns both the session cookie and the service-role client.
  // It is the transport seam, and it is deliberately the only one.
  {
    files: ['src/server/db.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // ── Rule 2: the browser never talks to the database directly. ──────────
  // This makes the worst v1 bug structurally impossible: legacy/index.html:2477
  // read the practitioner's Mercado Pago access token straight from the browser,
  // despite a comment in legacy/api/mp-pago.js claiming it never left the server.
  //
  // src/proxy.ts is outside this glob on purpose — it needs @supabase/ssr to
  // refresh the auth cookie, and it is the only file that does. (`proxy` is what
  // Next.js 16 calls the file convention that used to be `middleware`.)
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: restrict({ patterns: [SUPABASE_IMPORTS], paths: [SERVICE_DB_IMPORT] }),
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'legacy/**',                 // frozen v1 — not our code, not our standards
    'supabase/**',               // migrations are SQL; .temp/ is Docker scratch
    'scripts/**',                // build-time Node scripts, not app code
    'src/lib/database.types.ts', // generated by `npm run db:types`
  ]),
])

export default eslintConfig
