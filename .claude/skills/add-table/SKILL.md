---
name: add-table
description: Add or change a table in Hilo's database — migration, RLS policy, reset, regenerate types. Use for any schema change.
---

# Changing Hilo's database

Always in this order. Skipping a step produces a database that does not match
its own history.

```bash
npm run db:start                              # once per session, needs Docker
npx supabase migration new add_goals_table    # creates the empty .sql file
# write the SQL
npm run db:reset                              # replay every migration
npm run db:types                              # regenerate TypeScript types
```

## The migration

Every table that holds practitioner data follows the same shape:

```sql
create table goals (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  patient_id      uuid not null references patients(id) on delete cascade,
  title           text not null,
  progress        integer not null default 0 check (progress between 0 and 100),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index goals_practitioner_created_idx on goals (practitioner_id, created_at);
create index goals_patient_idx on goals (patient_id);

alter table goals enable row level security;

create policy "own_rows" on goals
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
```

### The parts that are not optional

**`practitioner_id` on every table, including children.** `goals` could reach the
practitioner through `patients`, but denormalising means every policy is the same
one line. Fifteen tables, one policy shape, nothing to get subtly wrong.

**`enable row level security` plus at least one policy.** `npm run check:rls`
fails the build without both. A table without RLS is the most likely way one
practitioner's clinical records become readable by another, and it happens by
omission.

**`(select auth.uid())`, not `auth.uid()`.** The subquery is evaluated once per
query; the bare call is evaluated once per row. At a few hundred patients the
difference is measurable.

**Indexes on every foreign key**, plus `(practitioner_id, created_at)` wherever a
list gets paginated.

## Conventions

- **Enums are `text` + `check`**, never Postgres enum types. Adding a value to a
  PG enum is awkward inside a transaction; a `check` changes with an `alter`.
- **Columns for anything filtered, sorted, or summed.** JSONB only for genuinely
  heterogeneous data that is never queried — in this schema that is
  `assessments.results` and nothing else. v1 kept whole patients in a JSON blob
  and lost data whenever two tabs were open.
- **Nothing is hard-deleted.** Use `deleted_at` / `archived_at`. These are
  clinical records.
- **Dates are `date`, timestamps are `timestamptz`.** Never store `"5 años"`.
- **Files go to Supabase Storage**, the table stores a path.

## Destructive changes

`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, and `DELETE` without a `WHERE` fail
`npm run check:migration` unless the file contains this exact line:

```sql
-- destructive: intentional
```

Before adding it: a Vercel rollback restores code, not data. A dropped column
stays dropped. Check that a Supabase backup exists.

**Never edit a migration that has already run in production.** Write a new one
that corrects it.

**Never change the schema in the Supabase dashboard.** It would exist in
production and in no migration file, and the next `db:reset` destroys it.

## Checklist

- [ ] Migration file created with `supabase migration new`
- [ ] `practitioner_id` column present
- [ ] RLS enabled + `own_rows` policy
- [ ] Indexes on foreign keys
- [ ] `npm run db:reset` succeeds
- [ ] `npm run db:types` regenerated
- [ ] `npm run check:rls` passes
