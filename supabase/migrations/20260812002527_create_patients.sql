-- M2 — Patients.
--
-- This table is the direct answer to v1's worst data bug. v1 kept every patient
-- as one JSONB blob and rewrote the whole row on every save
-- (`legacy/index.html:3069`), so two open tabs meant the second save silently
-- erased the first one's work. Here every field is a column and every write
-- touches only what changed.
--
-- Two column choices carry real weight:
--
--   `date_of_birth date` replaces v1's free-text `"5 años"`. Age is derived, so
--   it never goes stale, and patients can actually be sorted and filtered by it.
--
--   `deleted_at` and `archived_at` instead of DELETE. These are clinical
--   records; nothing in Hilo is hard-deleted.

create table patients (
  id                          uuid primary key default gen_random_uuid(),
  practitioner_id             uuid not null references practitioners (id) on delete cascade,

  full_name                   text not null,
  date_of_birth               date,
  age_group                   text not null default 'children'
                                check (age_group in ('children', 'adolescents', 'adults')),

  -- Context. All optional: a practitioner should be able to create a patient
  -- with a name and nothing else, at the door, and fill the rest in later.
  school_level                text,
  school                      text,
  health_insurer              text,
  phone                       text,
  referral_reason             text,
  start_date                  date,
  consent_signed_at           timestamptz,

  -- One of the six accent colours (see src/lib/disciplines.ts). Purely visual,
  -- and the reason a list of twelve names is scannable.
  color                       text,
  -- A path inside the private `patient-photos` bucket, never a base64 blob.
  -- v1 put the encoded image inside the JSON row, which is how a patient record
  -- came to weigh 200 KB.
  photo_path                  text,

  session_fee                 numeric(10, 2),
  billing_frequency           text not null default 'monthly'
                                check (billing_frequency in (
                                  'monthly', 'biweekly', 'weekly', 'per_session'
                                )),
  expected_sessions_per_month integer check (expected_sessions_per_month between 0 and 62),

  archived_at                 timestamptz,
  deleted_at                  timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index patients_practitioner_created_idx
  on patients (practitioner_id, created_at desc);

-- The list is filtered to the live patients on every load, so the partial index
-- is the one that gets used.
create index patients_practitioner_active_idx
  on patients (practitioner_id, full_name)
  where deleted_at is null and archived_at is null;

create trigger patients_touch_updated_at
  before update on patients
  for each row execute function public.touch_updated_at();

alter table patients enable row level security;

create policy "own_rows" on patients
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));


-- ─── Photo storage ─────────────────────────────────────────────────────────
--
-- A private bucket. Every object lives under `<practitioner_id>/<patient_id>`,
-- and the policies below are what enforce that — the path prefix is not a
-- convention the application is trusted to follow, it is checked by Postgres on
-- every request.
--
-- Private means the URL alone grants nothing: the app hands out short-lived
-- signed URLs. A photograph of a child in therapy is not something to leave on a
-- public URL that stays valid forever and cannot be recalled.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-photos',
  'patient-photos',
  false,
  3 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "own_patient_photos_read" on storage.objects
  for select
  using (
    bucket_id = 'patient-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own_patient_photos_write" on storage.objects
  for insert
  with check (
    bucket_id = 'patient-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own_patient_photos_update" on storage.objects
  for update
  using (
    bucket_id = 'patient-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own_patient_photos_delete" on storage.objects
  for delete
  using (
    bucket_id = 'patient-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
