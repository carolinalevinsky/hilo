-- M1 — Auth and profile.
--
-- Two tables and the machinery that keeps them honest:
--
--   practitioners  one row per signed-up professional, keyed to auth.users
--   audit_log      an append-only trail, because this is health data under
--                  Ley N.º 18.331
--
-- Everything else in the schema hangs off `practitioners.id`, which is also
-- `auth.uid()`. That equality is what makes every later RLS policy one line
-- long.


-- ─── Table privileges ──────────────────────────────────────────────────────
--
-- Grants and Row Level Security are two different gates and both have to be
-- open. A grant says "this role may touch this table at all"; a policy says
-- "and only these rows". A table with a perfect policy and no grant returns
-- `42501 permission denied` to everyone, which is how the RLS test in
-- `src/server/rls.test.ts` caught this before any screen was built.
--
-- Setting it as a default privilege rather than repeating `grant` in fifteen
-- migrations means a new table is protected by RLS and reachable by the app
-- without anyone having to remember a second incantation. Migrations run as
-- `postgres`, which is the role this applies to.
--
-- `anon` is deliberately absent. The only thing an anonymous visitor does is
-- POST a booking request, and that goes through a route handler using the
-- service role (M7) — never a direct table write.

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;


-- ─── Shared helpers ────────────────────────────────────────────────────────

-- Keeps `updated_at` honest without the application having to remember.
-- `search_path = ''` is deliberate: a function that runs with the caller's
-- search_path can be tricked into resolving a name to an attacker's object.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- The `unaccent` extension lives in a schema the anon role cannot always
-- reach, and enabling it just for this is more surface than the job needs.
-- Uruguayan names use a small, closed set of accented characters.
create or replace function public.unaccent_fallback(input text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select translate(
    input,
    'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
    'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
  );
$$;

-- "Lucía Fernández" → "lucia-fernandez". Used for the public booking link, so
-- it must be URL-safe and stable enough to print on a card.
create or replace function public.slugify(input text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select trim(
    both '-' from
    regexp_replace(
      lower(public.unaccent_fallback(input)),
      '[^a-z0-9]+', '-', 'g'
    )
  );
$$;


-- ─── practitioners ─────────────────────────────────────────────────────────

create table practitioners (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text not null,
  -- Enums are text + check, never Postgres enum types: adding a value to a PG
  -- enum is awkward inside a transaction, a check changes with an alter.
  -- These are the six disciplines v1 shipped with (legacy/index.html:990).
  discipline    text not null check (discipline in (
                  'speech_therapy',
                  'psychopedagogy',
                  'occupational_therapy',
                  'psychology',
                  'psychomotricity',
                  'physiotherapy'
                )),
  plan          text not null default 'free' check (plan in ('free', 'pro')),
  slug          text unique,
  phone         text,
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger practitioners_touch_updated_at
  before update on practitioners
  for each row execute function public.touch_updated_at();

alter table practitioners enable row level security;

-- The one table whose policy keys on `id` rather than `practitioner_id`,
-- because here they are the same column.
create policy "own_rows" on practitioners
  for all
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));


-- ─── Practitioner row creation ─────────────────────────────────────────────
--
-- A trigger on auth.users, not application code after sign-up.
--
-- The reason is email confirmation: with confirmations on, `signUp` returns no
-- session, so there is no authenticated request in which the app could insert
-- the row. A trigger runs regardless, which means the profile exists before the
-- practitioner ever reaches a screen. It also cannot be skipped by a sign-up
-- that arrives through some other path later (an invite, an OAuth provider).
--
-- `full_name` and `discipline` arrive in the sign-up metadata. If either is
-- missing the insert fails loudly rather than creating a half-built profile.

create or replace function public.handle_new_practitioner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_slug text;
  final_slug text;
  suffix integer := 1;
begin
  base_slug := public.slugify(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  if base_slug = '' then
    base_slug := 'profesional';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.practitioners p where p.slug = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix;
  end loop;

  insert into public.practitioners (id, email, full_name, discipline, slug)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'discipline',
    final_slug
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_practitioner();


-- ─── audit_log ─────────────────────────────────────────────────────────────
--
-- ~20 lines of table because this is health data under Ley N.º 18.331, not
-- because audit logs are good practice in the abstract.
--
-- Writes go through the service role (src/server/audit.ts), so there is no
-- insert policy: a practitioner can read their own trail and cannot forge it.

create table audit_log (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  action          text not null,
  entity          text not null,
  entity_id       uuid,
  created_at      timestamptz not null default now()
);

create index audit_log_practitioner_created_idx
  on audit_log (practitioner_id, created_at desc);

alter table audit_log enable row level security;

create policy "own_rows_read" on audit_log
  for select
  using (practitioner_id = (select auth.uid()));

-- Belt and braces. The absence of an INSERT policy already stops a practitioner
-- writing here, but taking the grant away means the attempt is refused one gate
-- earlier and cannot be re-enabled by adding a policy without also noticing this
-- line.
revoke insert, update, delete on table audit_log from authenticated;
