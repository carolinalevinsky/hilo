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
 * them, confirm it still allows the legitimate exceptions, delete them.
 *
 * Run this after any change to eslint.config.mjs.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

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

const MUST_PASS = [
  {
    name: 'the allowlist still works — booking.ts may import getServiceDb',
    realPath: 'src/server/booking.ts',
    code:
      "import { getServiceDb } from './db'\n" +
      'export const probe = getServiceDb\n',
    restore:
      '/**\n' +
      ' * Public booking requests from anonymous visitors.\n' +
      ' *\n' +
      ' * Built in M7 (see docs/plan-02-migration.md).\n' +
      ' */\n' +
      '\n' +
      'export {}\n',
  },
]

const all = [...MUST_FAIL, ...MUST_PASS]

function cleanup() {
  for (const probe of all) {
    if (probe.restore) {
      writeFileSync(probe.realPath, probe.restore)
    } else {
      rmSync(probe.realPath, { force: true })
    }
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
  for (const probe of all) {
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
