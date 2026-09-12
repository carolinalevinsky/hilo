-- "Antes de empezar": a link the family opens without an account.
--
-- Three things a practitioner used to do by hand in the first session — copy
-- the child's details, get the consent signed, ask how the child got here — the
-- family now does from a WhatsApp link before they arrive. Three tables and two
-- functions, and the shape of each is about who is allowed to write what.
--
-- ─── Who writes ────────────────────────────────────────────────────────────
--
-- The person filling the form has no session, so RLS has no uid to check. The
-- options were the service-role key (an eighth place, and a key that bypasses
-- every policy in the database) or two `security definer` functions that do one
-- thing each. The functions win for the same reason `practitioner_by_slug` did:
-- a function that takes a token and writes two rows cannot be talked into doing
-- anything else, and a service-role client can.
--
-- The token is 32 random bytes, sent in the link and never stored. Only its
-- SHA-256 is, so a copy of this table is not a copy of anybody's links.
--
-- ─── What the family never sees ────────────────────────────────────────────
--
-- `patient_form_by_token` returns the practitioner's name, the patient's first
-- name, the age group and the consent text. Nothing else from the ficha: a link
-- forwarded to the wrong chat must not show a date of birth, a school or a
-- reason for consultation. The family fills everything in from scratch.
--
-- The consent text does name the patient in full and the practitioner's
-- discipline — a consent has to say who it is for and what it authorises — so
-- whoever holds an open link can read that much. That is the price of the
-- consent being on the page at all, and it is bounded: once the form is sent
-- or the 14 days pass, the function still answers but the page shows only
-- that the link is closed, not the text.
--
-- ─── What the family's answers do ──────────────────────────────────────────
--
-- Nothing, until the practitioner looks at them. They land in
-- `intake_responses`, not in `patients`: what a parent types at eleven at night
-- is not the clinical record until the professional says so. "Pasar a la ficha"
-- (in `src/server/patient-forms.ts`) copies only into fields that are empty.
--
-- ─── The consent is evidence, not a form ───────────────────────────────────
--
-- `consents` stores the exact text that was signed, copied from the link at the
-- moment the link was created — not a reference to a template that can change
-- next week. The practitioner can read their consents and nothing else: there
-- is no insert, update or delete policy, so a signature cannot be edited or
-- removed from inside the app. Ley 19.529 asks that the consent be in the
-- historia clínica, and a record the author could quietly change would not be
-- worth much there.

-- The practitioner's own consent text. Null means Hilo's model
-- (`src/lib/consent-template.ts`), which is what almost everyone will use.
alter table practitioners
  add column consent_template text;


-- ─── The link ──────────────────────────────────────────────────────────────

create table patient_forms (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null,

  -- 'intake' is "Antes de empezar" (details + consent). 'scale' is a
  -- questionnaire the patient answers; `scale` says which one.
  kind            text not null check (kind in ('intake', 'scale')),
  scale           text check (scale in ('phq9', 'gad7')),

  token_hash      text not null unique,

  -- The consent as it will be shown and signed, names already filled in.
  -- Copied here when the link is made, so what the family reads is what gets
  -- stored — even if the practitioner edits the model afterwards.
  consent_text    text,

  expires_at      timestamptz not null,
  submitted_at    timestamptz,
  created_at      timestamptz not null default now(),

  constraint patient_forms_patient_same_practitioner
    foreign key (practitioner_id, patient_id)
    references patients (practitioner_id, id) on delete cascade,
  constraint patient_forms_scale_matches_kind
    check ((kind = 'scale') = (scale is not null)),
  constraint patient_forms_intake_has_consent
    check (kind <> 'intake' or consent_text is not null),
  -- So the answer tables can reference (practitioner_id, id) and inherit the
  -- same-practitioner guarantee.
  constraint patient_forms_practitioner_id_id_key unique (practitioner_id, id)
);

create index patient_forms_patient_idx on patient_forms (patient_id, created_at desc);
create index patient_forms_practitioner_created_idx on patient_forms (practitioner_id, created_at desc);

alter table patient_forms enable row level security;

create policy "own_rows" on patient_forms
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));

revoke all on table patient_forms from anon;


-- ─── What the family wrote ─────────────────────────────────────────────────
--
-- Columns, not a JSON blob: the ones that match the ficha are copied into it
-- one by one, and the rest are read as text on the ficha.

create table intake_responses (
  id                    uuid primary key default gen_random_uuid(),
  practitioner_id       uuid not null references practitioners (id) on delete cascade,
  patient_id            uuid not null,
  form_id               uuid not null unique,

  date_of_birth         date,
  school                text,
  school_level          text,
  health_insurer        text,
  phone                 text,
  guardian_name         text,
  guardian_relationship text check (guardian_relationship in ('mother', 'father', 'guardian', 'other')),
  guardian_email        text,

  -- In their words. Not copied anywhere: the practitioner reads them.
  reason                text,
  history               text,
  medication            text,
  other_professionals   text,

  submitted_at          timestamptz not null default now(),
  -- When the practitioner copied it into the ficha. Null means still to review.
  applied_at            timestamptz,

  constraint intake_responses_patient_same_practitioner
    foreign key (practitioner_id, patient_id)
    references patients (practitioner_id, id) on delete cascade,
  constraint intake_responses_form_same_practitioner
    foreign key (practitioner_id, form_id)
    references patient_forms (practitioner_id, id) on delete cascade
);

create index intake_responses_patient_idx on intake_responses (patient_id, submitted_at desc);

alter table intake_responses enable row level security;

create policy "own_rows" on intake_responses
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));

revoke all on table intake_responses from anon;


-- ─── The signed consent ────────────────────────────────────────────────────

create table consents (
  id                  uuid primary key default gen_random_uuid(),
  practitioner_id     uuid not null references practitioners (id) on delete cascade,
  patient_id          uuid not null,
  form_id             uuid unique,

  consent_text        text not null,
  signer_name         text not null check (char_length(trim(signer_name)) between 3 and 200),
  -- 'self' when an adult signs for themselves.
  signer_relationship text not null
    check (signer_relationship in ('self', 'mother', 'father', 'guardian', 'other')),
  signed_at           timestamptz not null default now(),
  -- What the browser said it was. Weak evidence, but free, and it is what
  -- every e-signature tool keeps.
  user_agent          text,

  constraint consents_patient_same_practitioner
    foreign key (practitioner_id, patient_id)
    references patients (practitioner_id, id) on delete cascade,
  constraint consents_form_same_practitioner
    foreign key (practitioner_id, form_id)
    references patient_forms (practitioner_id, id) on delete set null (form_id)
);

create index consents_patient_idx on consents (patient_id, signed_at desc);

alter table consents enable row level security;

-- Read only. See "The consent is evidence" above.
create policy "own_rows_read" on consents
  for select
  using (practitioner_id = (select auth.uid()));

revoke all on table consents from anon;


-- ─── The two doors ─────────────────────────────────────────────────────────
--
-- `search_path = ''` because these run with the definer's rights: every name
-- inside is schema-qualified, so nothing a caller puts on their own path can be
-- picked up instead.

create or replace function public.patient_form_by_token(raw_token text)
returns table (
  kind               text,
  scale              text,
  practitioner_name  text,
  patient_first_name text,
  age_group          text,
  consent_text       text,
  state              text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    f.kind,
    f.scale,
    pr.full_name,
    split_part(trim(p.full_name), ' ', 1),
    p.age_group,
    f.consent_text,
    case
      when f.submitted_at is not null then 'submitted'
      when f.expires_at < now() then 'expired'
      else 'open'
    end
  from public.patient_forms f
  join public.patients p
    on p.id = f.patient_id and p.practitioner_id = f.practitioner_id
  join public.practitioners pr
    on pr.id = f.practitioner_id
  where f.token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and p.deleted_at is null
  limit 1;
$$;

grant execute on function public.patient_form_by_token(text) to anon, authenticated;


-- Returns 'ok', or why not: 'not_found', 'expired', 'submitted'. A bad value
-- (a relationship outside the list, a name too short) raises, and the app has
-- already validated those, so reaching it means someone bypassed the form.
-- The signature first and everything optional after, with `default null`: the
-- generated TypeScript types make a parameter optional only when it has a
-- default, and every one of these can legitimately be left blank.
create or replace function public.submit_intake(
  raw_token               text,
  p_signer_name           text,
  p_signer_relationship   text,
  p_date_of_birth         date default null,
  p_school                text default null,
  p_school_level          text default null,
  p_health_insurer        text default null,
  p_phone                 text default null,
  p_guardian_name         text default null,
  p_guardian_relationship text default null,
  p_guardian_email        text default null,
  p_reason                text default null,
  p_history               text default null,
  p_medication            text default null,
  p_other_professionals   text default null,
  p_user_agent            text default null
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  f public.patient_forms%rowtype;
begin
  -- `for update`: two taps on "Enviar" must not produce two signatures.
  select * into f
  from public.patient_forms
  where token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and kind = 'intake'
  for update;

  if not found then return 'not_found'; end if;
  if f.submitted_at is not null then return 'submitted'; end if;
  if f.expires_at < now() then return 'expired'; end if;

  -- `left(…)` on every free-text field: the form limits them too, but this is
  -- the door that is actually open to the internet.
  insert into public.intake_responses (
    practitioner_id, patient_id, form_id,
    date_of_birth, school, school_level, health_insurer, phone,
    guardian_name, guardian_relationship, guardian_email,
    reason, history, medication, other_professionals
  ) values (
    f.practitioner_id, f.patient_id, f.id,
    p_date_of_birth,
    nullif(left(trim(p_school), 200), ''),
    nullif(left(trim(p_school_level), 200), ''),
    nullif(left(trim(p_health_insurer), 200), ''),
    nullif(left(trim(p_phone), 60), ''),
    nullif(left(trim(p_guardian_name), 200), ''),
    nullif(p_guardian_relationship, ''),
    nullif(left(trim(p_guardian_email), 200), ''),
    nullif(left(trim(p_reason), 3000), ''),
    nullif(left(trim(p_history), 3000), ''),
    nullif(left(trim(p_medication), 1000), ''),
    nullif(left(trim(p_other_professionals), 1000), '')
  );

  insert into public.consents (
    practitioner_id, patient_id, form_id,
    consent_text, signer_name, signer_relationship, user_agent
  ) values (
    f.practitioner_id, f.patient_id, f.id,
    f.consent_text, left(trim(p_signer_name), 200), p_signer_relationship,
    left(p_user_agent, 400)
  );

  update public.patient_forms set submitted_at = now() where id = f.id;

  -- The date the ficha already showed, now with a signature behind it.
  update public.patients
     set consent_signed_at = now()
   where id = f.patient_id and practitioner_id = f.practitioner_id;

  return 'ok';
end;
$$;

grant execute on function public.submit_intake(
  text, text, text, date, text, text, text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;
