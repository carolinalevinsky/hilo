-- M8 — The materials library.
--
-- Two kinds of row in one table, told apart by `practitioner_id`:
--
--   NULL      shipped with Hilo, visible to every practitioner. Curated
--             content, not user data.
--   a uuid    written by that practitioner, visible only to them.
--
-- The read policy is deliberately discipline-blind. Filtering the library down
-- to a psychopedagogist's areas is a *product* decision and it lives in
-- `listMaterials`; writing it into the policy would read like a privacy boundary
-- and it is not one — there is nothing private about a shared worksheet.
--
-- That NULL is why this table's policy is the only one in the schema that is not
-- the standard one-liner, and it is worth being explicit about: the read policy
-- is deliberately permissive for the shared rows, and the write policy is not.
-- A practitioner can read Hilo's materials and their own; they can only create,
-- edit, or delete their own.

create table materials (
  id              uuid primary key default gen_random_uuid(),
  -- NULL means "shipped with Hilo".
  practitioner_id uuid references practitioners (id) on delete cascade,

  title           text not null,
  -- Which discipline it belongs to. NULL means it suits everyone.
  discipline      text,
  -- The two levels v1 used: a broad area and a specific focus within it
  -- (legacy/index.html:2099). "Lectura" › "Conciencia fonológica".
  area            text not null,
  focus           text,

  kind            text not null default 'activity'
                    check (kind in ('activity', 'game', 'worksheet', 'text', 'guide')),
  -- What the activity is for, in the practitioner's words. Also what the search
  -- matches against when suggesting a material for a goal.
  objective       text,
  -- Plain text with the same "Heading:" convention as a clinical document, so
  -- one renderer covers both and nothing here needs dangerouslySetInnerHTML.
  content         text not null,

  -- Rough age band, e.g. '6-7'. Text rather than a range type because it is
  -- displayed far more often than it is filtered on.
  age_range       text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index materials_discipline_idx on materials (discipline, area);
create index materials_practitioner_idx on materials (practitioner_id, created_at desc);

create trigger materials_touch_updated_at
  before update on materials
  for each row execute function public.touch_updated_at();

alter table materials enable row level security;

-- Read: Hilo's materials, plus your own.
create policy "read_shared_and_own" on materials
  for select
  using (practitioner_id is null or practitioner_id = (select auth.uid()));

-- Write: only your own. The `with check` is what stops a practitioner from
-- creating a row with a NULL practitioner_id and publishing it to everyone.
create policy "write_own" on materials
  for insert
  with check (practitioner_id = (select auth.uid()));

create policy "update_own" on materials
  for update
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));

create policy "delete_own" on materials
  for delete
  using (practitioner_id = (select auth.uid()));
