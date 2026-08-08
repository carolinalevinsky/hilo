#!/usr/bin/env node
/**
 * Fails the build if a secret-shaped environment variable carries the
 * NEXT_PUBLIC_ prefix.
 *
 * Why this exists: NEXT_PUBLIC_ is not a naming convention. It is the switch
 * that inlines a value into the JavaScript bundle every visitor downloads. One
 * misplaced prefix publishes a service-role key or an API key to the entire
 * internet — a single-character-class mistake with an unbounded blast radius,
 * and trivially detectable.
 *
 * With no human reviewer on this project, "someone would notice" is not
 * available. This is what notices.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'legacy', 'out', 'build', 'supabase'])
const SCAN_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|yml|yaml|env|example|local)$/

/** Genuinely public by design. RLS is what protects Supabase data, not this key. */
const ALLOWED = new Set(['NEXT_PUBLIC_SUPABASE_ANON_KEY'])

const SECRET_SHAPED = /NEXT_PUBLIC_[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL|PRIVATE)[A-Z0-9_]*/g

const findings = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!SCAN_EXT.test(entry) && !entry.startsWith('.env')) continue

    const lines = readFileSync(full, 'utf8').split('\n')
    lines.forEach((line, i) => {
      for (const match of line.matchAll(SECRET_SHAPED)) {
        if (ALLOWED.has(match[0])) continue
        findings.push({ file: relative(ROOT, full), line: i + 1, name: match[0] })
      }
    })
  }
}

walk(ROOT)

if (findings.length > 0) {
  console.error('\n✗ Secret-shaped variables exposed to the browser:\n')
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.name}`)
  }
  console.error(
    '\nThe NEXT_PUBLIC_ prefix ships this value to every visitor\'s browser.',
  )
  console.error('Remove the prefix and read the variable from src/lib/env.ts instead.')
  console.error(
    '\nIf this really is safe to publish, add it to ALLOWED in scripts/check-secrets.mjs',
  )
  console.error('and say why in the commit message.\n')
  process.exit(1)
}

console.log('✓ check:secrets — no secret-shaped variables are exposed to the browser')
