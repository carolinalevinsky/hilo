#!/usr/bin/env node
/**
 * Fails the build if a migration contains destructive SQL without saying so on
 * purpose.
 *
 * Why this exists: this does NOT prevent destructive migrations. Sometimes a
 * column really should go. It prevents *accidental* ones — the case where a
 * request like "clean up the patients table" produces a DROP COLUMN and it
 * sails through because nothing objected.
 *
 * To allow it, put this exact line anywhere in the migration file:
 *
 *     -- destructive: intentional
 *
 * Typing that line is the point. It turns an invisible action into a decision.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'supabase/migrations'
const MARKER = '-- destructive: intentional'

const PATTERNS = [
  { re: /\bdrop\s+table\b/i, what: 'DROP TABLE' },
  { re: /\bdrop\s+column\b/i, what: 'DROP COLUMN' },
  { re: /\bdrop\s+schema\b/i, what: 'DROP SCHEMA' },
  { re: /\btruncate\b/i, what: 'TRUNCATE' },
  { re: /\bdelete\s+from\s+(?!.*\bwhere\b)/i, what: 'DELETE without WHERE' },
]

let files = []
try {
  files = readdirSync(DIR).filter((f) => f.endsWith('.sql'))
} catch {
  console.log('✓ check:migration — no migrations yet')
  process.exit(0)
}

const findings = []

for (const file of files) {
  const path = join(DIR, file)
  const content = readFileSync(path, 'utf8')
  if (content.includes(MARKER)) continue

  content.split('\n').forEach((line, i) => {
    const code = line.split('--')[0] ?? ''
    for (const { re, what } of PATTERNS) {
      if (re.test(code)) {
        findings.push({ file: path, line: i + 1, what, text: line.trim() })
      }
    }
  })
}

if (findings.length > 0) {
  console.error('\n✗ Destructive SQL in a migration that does not declare it:\n')
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.what}`)
    console.error(`      ${f.text}`)
  }
  console.error(`\nIf this is deliberate, add this line to the migration file:\n`)
  console.error(`  ${MARKER}\n`)
  console.error('Before you do: dropping a column destroys data that a Vercel rollback')
  console.error('cannot bring back. Rolling back code does not roll back the database.')
  console.error('Check that a Supabase backup exists first.\n')
  process.exit(1)
}

console.log(`✓ check:migration — ${files.length} migration(s), no undeclared destructive SQL`)
