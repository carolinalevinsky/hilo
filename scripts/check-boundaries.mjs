#!/usr/bin/env node
/**
 * Proves the three architectural lint rules actually fire.
 *
 * Why this exists: a lint rule that silently stops working is worse than no
 * rule, because everyone keeps believing they are protected. That is not
 * hypothetical here — the first version of eslint.config.mjs had all three
 * rules written out correctly and only ONE of them worked, because in flat
 * config a later block replaces the same rule from an earlier block instead of
 * merging with it. Everything looked right. Nothing was enforced.
 *
 * So: write files that deliberately break each rule, confirm ESLint rejects
 * them, delete them — and then confirm the one legitimate exception is still
 * allowed, by linting the real file that depends on it.
 *
 * Run this after any change to eslint.config.mjs.
 *
 * ─── Never write to a file that is not a probe ─────────────────────────────
 *
 * This script used to check the allowlist by overwriting the **real**
 * `src/server/booking.ts` with a two-line probe and then "restoring" it from a
 * hardcoded string in `cleanup()`. That string was the file's content in M7,
 * before booking was implemented — seven lines ending in `export {}`.
 *
 * So every run of `npm run check:boundaries` silently deleted 224 lines of
 * working code, and the deletion looked like it came from somewhere else
 * entirely: the file was fine through typecheck, tests and build, and gutted by
 * the time anyone looked, because this is the last check in the sequence. It was
 * blamed on a second editor open on the same repo, and it went out in a commit.
 *
 * A probe writes to a path that exists only to be a probe. If a check needs a
 * real file to have particular contents, it reads it — it does not author it.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const DIR = 'src/__boundary_probe__'

const MUST_FAIL = [
  {
    name: 'rule 1 — src/server/ may not import next/*',
    file: `${DIR}/server-probe.ts`,
    // Placed under src/server via a symlinked path is fragile; instead we write
    // into src/server directly and clean up.
    realPath: 'src/server/__probe.ts',
    code: "import { cookies } from 'next/headers'\nexport const probe = cookies\n",
  },
  {
    name: 'rule 2 — components may not import @supabase/*',
    realPath: 'src/components/__probe.tsx',
    code: "import { createClient } from '@supabase/supabase-js'\nexport const probe = createClient\n",
  },
  {
    name: 'rule 3 — app code may not import getServiceDb',
    realPath: 'src/app/__probe.ts',
    code: "import { getServiceDb } from '@/server/db'\nexport const probe = getServiceDb\n",
  },
]

/**
 * The allowlisted files, checked as they are.
 *
 * No probe and nothing written: `src/server/booking.ts` genuinely imports
 * `getServiceDb` — a family filling in a public booking form has no session for
 * RLS to check against — so linting it unmodified is a stronger test than a
 * stand-in would be. It proves the exception works for the actual file that
 * needs it.
 *
 * `expect` guards against the check going quietly vacuous. If booking.ts ever
 * stops importing `getServiceDb`, linting it would pass for the boring reason
 * and this check would report a green tick for a rule it was no longer
 * exercising.
 */
const MUST_PASS = [
  {
    name: 'the allowlist still works — booking.ts may import getServiceDb',
    realPath: 'src/server/booking.ts',
    expect: 'getServiceDb',
  },
]

function cleanup() {
  for (const probe of MUST_FAIL) {
    rmSync(probe.realPath, { force: true })
  }
  rmSync(DIR, { recursive: true, force: true })
}

function lint(file) {
  try {
    execFileSync('npx', ['eslint', '--format', 'json', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return []
  } catch (error) {
    const out = String(error.stdout ?? '')
    try {
      return JSON.parse(out).flatMap((r) => r.messages)
    } catch {
      console.error('Could not parse ESLint output:\n', out || error.message)
      process.exit(1)
    }
  }
}

mkdirSync(DIR, { recursive: true })
mkdirSync('src/components', { recursive: true })

let failed = false

try {
  for (const probe of MUST_FAIL) {
    writeFileSync(probe.realPath, probe.code)
  }

  for (const probe of MUST_FAIL) {
    const hits = lint(probe.realPath).filter((m) => m.ruleId === 'no-restricted-imports')
    if (hits.length === 0) {
      console.error(`✗ NOT ENFORCED: ${probe.name}`)
      console.error(`  ${probe.realPath} imports something forbidden and ESLint allowed it.`)
      failed = true
    } else {
      console.log(`✓ ${probe.name}`)
    }
  }

  for (const probe of MUST_PASS) {
    if (!readFileSync(probe.realPath, 'utf8').includes(probe.expect)) {
      console.error(`✗ VACUOUS: ${probe.name}`)
      console.error(
        `  ${probe.realPath} no longer contains "${probe.expect}", so linting it ` +
          'proves nothing about the allowlist. Point this check at a file that ' +
          'still needs the exception, or drop the entry from SERVICE_DB_ALLOWED.',
      )
      failed = true
      continue
    }

    const hits = lint(probe.realPath).filter((m) => m.ruleId === 'no-restricted-imports')
    if (hits.length > 0) {
      console.error(`✗ TOO STRICT: ${probe.name}`)
      console.error(`  ${hits[0].message}`)
      failed = true
    } else {
      console.log(`✓ ${probe.name}`)
    }
  }
} finally {
  cleanup()
}

if (failed) {
  console.error('\nThe architectural rules in eslint.config.mjs are not doing what they say.')
  console.error('Read the "trap worth knowing about" comment at the top of that file.\n')
  process.exit(1)
}

console.log('\n✓ check:boundaries — all three architectural rules are enforced')
