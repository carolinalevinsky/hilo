-- M7 — Public booking requests. **Defect #6.**
--
-- v1's booking form did an anonymous INSERT straight from the browser into
-- `reservas`, with a caller-supplied `prof_id` (`legacy/index.html:1628`).
-- Trivially spammable, and the practitioner's `auth.users.id` was in the URL of
-- the link they handed to families.
--
-- v2 removes the attack surface rather than mitigating it:
--
--   1. The link uses `practitioners.slug`, not a UUID.
--   2. The form POSTs to our own route handler.
--   3. The handler validates the slug, rate-limits by IP, then inserts with the
--      service role.
--   4. **This table has no policy for `anon` at all.** There is no anonymous
--      write to rate-limit harder, because there is no anonymous write.
--
-- The practitioner reads and updates their own rows the ordinary way.

create table booking_requests (
  id                uuid primary key default gen_random_uuid(),
  practitioner_id   uuid not null references practitioners (id) on delete cascade,

  name              text not null,
  phone             text not null,
  -- What the family asked for, not an appointment. It becomes one only when the
  -- practitioner confirms it.
  preferred_weekday integer check (preferred_weekday between 0 and 6),
  preferred_time    time,
  note              text,

  status            text not null default 'pending'
                      check (status in ('pending', 'confirmed', 'dismissed')),

  -- A salted hash of the sender's IP, for the rate limit. **Not the IP.**
  --
  -- The counter needs to recognise "this sender again"; it does not need to know
  -- who they are. A family's IP address is personal data, and there is no reason
  -- for a clinical records system to keep a log of the addresses that visited a
  -- practitioner's booking page.
  submitter_hash    text,
  -- Set when confirming turns this into a patient, so the inbox can link to the
  -- record it produced.
  patient_id        uuid references patients (id) on delete set null,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index booking_requests_practitioner_idx
  on booking_requests (practitioner_id, status, created_at desc);

-- The rate-limit lookup: "how many from this sender in the last hour?"
create index booking_requests_rate_limit_idx
  on booking_requests (submitter_hash, created_at desc);

create trigger booking_requests_touch_updated_at
  before update on booking_requests
  for each row execute function public.touch_updated_at();

alter table booking_requests enable row level security;

-- The practitioner's own rows. `anon` gets nothing: the insert goes through the
-- route handler with the service role, which is one of the four allowed uses.
create policy "own_rows" on booking_requests
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));

revoke all on table booking_requests from anon;


-- ─── Finding a practitioner by slug, without exposing the rest ─────────────
--
-- The public booking page needs a name and a discipline from a slug. It cannot
-- read `practitioners` — that table's policy is `id = auth.uid()`, and an
-- anonymous visitor has no uid — and loosening the policy to allow it would open
-- the whole row, email included.
--
-- A `security definer` function is the narrow door: it returns three columns and
-- nothing else, for one slug at a time. `search_path = ''` matters more than
-- usual here, because this function runs with the definer's rights.

create or replace function public.practitioner_by_slug(lookup_slug text)
returns table (id uuid, full_name text, discipline text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name, p.discipline
  from public.practitioners p
  where p.slug = lookup_slug
  limit 1;
$$;

grant execute on function public.practitioner_by_slug(text) to anon, authenticated;
