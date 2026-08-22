-- Materials: publishing to the community, and where a material came from.
--
-- v1 had a "Visibilidad" selector with two options, "Privado · solo para mí" and
-- "Público · comunidad" (`legacy/index.html:823-836`). The public half never
-- worked: v1 kept everything in an array in memory, so a "published" material
-- lived until the tab was reloaded and nobody else ever saw it. This migration
-- is what makes that selector mean something.
--
-- **It is the only change in the whole parity pass that alters who can read
-- what**, so it is worth being slow about. Three kinds of row now exist:
--
--   practitioner_id IS NULL              shipped with Hilo, everyone reads it
--   yours, visibility 'private'          only you
--   another's, visibility 'public'       everyone reads it, only the author writes
--
-- Nothing clinical can arrive here by accident: a material is a worksheet, and
-- the only way a row is created is the form in `/materiales/nuevo`, which asks
-- for an activity and warns before publishing. There is no path from a patient
-- to this table.

alter table materials
  add column visibility text not null default 'private'
    check (visibility in ('private', 'public')),

  -- Where the text came from. v1 showed this as a badge ("Generado con IA"), and
  -- it is also what the AI quota counts: writing a material by hand must never
  -- consume a quota that exists to cap spending at Anthropic.
  add column source text not null default 'manual'
    check (source in ('manual', 'ai')),

  -- The author's display name, frozen at the moment of publishing.
  --
  -- Denormalised on purpose. A practitioner cannot read another practitioner's
  -- row — `practitioners` has the standard own-rows policy and that is correct —
  -- so a join would return nothing and the community library would show
  -- materials by nobody. Copying the name here also means changing your name
  -- later does not rewrite the byline on something you published in 2026.
  add column author_name text,

  -- Provenance for a material copied out of the community into your own
  -- library. Kept so "this started as someone else's" stays true, and set to
  -- NULL rather than cascading if the original is ever deleted.
  add column copied_from uuid references materials (id) on delete set null;

-- The community listing is "public, newest first", and it is the one query that
-- crosses practitioners.
create index materials_public_idx
  on materials (visibility, created_at desc)
  where visibility = 'public';

-- ─── The read policy ──────────────────────────────────────────────────────────
--
-- Replaced rather than added to: two overlapping SELECT policies OR together,
-- which works but leaves the real rule spread across two places where the next
-- person has to assemble it themselves.

drop policy "read_shared_and_own" on materials;

create policy "read_shared_own_and_published" on materials
  for select
  using (
    -- Shipped with Hilo. Kept as its own clause rather than by backfilling
    -- `visibility`, so these rows never depend on a column being remembered:
    -- `supabase/seeds/materials.generated.sql` inserts them without one.
    practitioner_id is null
    -- Your own, published or not.
    or practitioner_id = (select auth.uid())
    -- Published by another practitioner.
    or visibility = 'public'
  );

-- The write policies are unchanged and deliberately not widened: `write_own`,
-- `update_own` and `delete_own` all still require `practitioner_id =
-- (select auth.uid())`. Publishing makes a row readable by everyone; it does not
-- make it writable by anyone but its author. `src/server/rls.test.ts` asserts
-- both halves.
