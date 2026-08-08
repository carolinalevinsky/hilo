#!/usr/bin/env node
/**
 * Fails the build if any table in the `public` schema has Row Level Security
 * switched off, or has RLS on but no policy (which denies everything and is
 * almost always a mistake in progress).
 *
 * Why this exists: a new table without RLS is the single most likely way one
 * practitioner's clinical records become readable by another. It happens by
 * omission — nobody decides to skip RLS, they just forget the two lines. That
 * is exactly the class of mistake a human reviewer is supposed to catch, and a
 * query catches it better.
 *
 * Runs against the local Supabase database, so `supabase start` must be up.
 */
import { execFileSync } from 'node:child_process'

const DB_URL = process.env.SUPABASE_DB_URL
  ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

const QUERY = `
select c.relname as table_name,
       case when not c.relrowsecurity then 'RLS is off'
            else 'RLS is on but the table has no policy'
       end as problem
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and (not c.relrowsecurity
       or not exists (select 1 from pg_policy p where p.polrelid = c.oid))
order by c.relname;
`

let output
try {
  output = execFileSync(
    'psql',
    [DB_URL, '-At', '-F', '\t', '-c', QUERY],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  )
} catch (error) {
  console.error('\n✗ check:rls could not reach the database.\n')
  console.error('  Is the local stack running?  npm run db:start')
  console.error(`  Tried: ${DB_URL}\n`)
  console.error(String(error.stderr ?? error.message).trim())
  process.exit(1)
}

const rows = output.trim().split('\n').filter(Boolean)

if (rows.length > 0) {
  console.error('\n✗ Tables without Row Level Security protection:\n')
  for (const row of rows) {
    const [table, problem] = row.split('\t')
    console.error(`  ${table}  —  ${problem}`)
  }
  console.error('\nEvery table holding practitioner data needs both, in its migration:\n')
  console.error('  alter table <table> enable row level security;\n')
  console.error('  create policy "own_rows" on <table>')
  console.error('    for all')
  console.error('    using (practitioner_id = (select auth.uid()))')
  console.error('    with check (practitioner_id = (select auth.uid()));\n')
  console.error('The (select auth.uid()) wrapper is not stylistic — it lets Postgres')
  console.error('evaluate the check once per query instead of once per row.\n')
  process.exit(1)
}

console.log('✓ check:rls — every public table has RLS enabled and at least one policy')
