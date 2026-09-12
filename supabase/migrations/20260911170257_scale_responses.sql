-- Questionnaires the patient answers from a link: PHQ-9 and GAD-7.
--
-- The link is the same `patient_forms` row as "Antes de empezar", with
-- kind = 'scale' and `scale` saying which one. What comes back lands here.
--
-- ─── Why the answers are an array ──────────────────────────────────────────
--
-- A questionnaire is a fixed list of items scored 0 to 3. Nine columns for one
-- scale and seven for the other would make two tables, or one table of mostly
-- nulls; an array of small integers is the item list as it is, and the checks
-- below hold it to the right length and range. The number that gets charted,
-- sorted and compared — the total — is a column.
--
-- ─── Item 9 ────────────────────────────────────────────────────────────────
--
-- PHQ-9's ninth item asks about thoughts of being better off dead or of
-- self-harm. Any answer above 0 is a flag the practitioner must see, whatever
-- the total. `self_harm_flag` is generated from the answers so no code path can
-- forget to set it, and `reviewed_at` records that the practitioner saw it.
--
-- ─── Who can change what ───────────────────────────────────────────────────
--
-- The answers are the patient's. The practitioner can read them and mark them
-- as reviewed — `update` is granted on `reviewed_at` alone — and nothing else:
-- no insert, no delete, no rewriting a score.

create table scale_responses (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null,
  form_id         uuid not null unique,

  scale           text not null check (scale in ('phq9', 'gad7')),
  answers         smallint[] not null,
  total           smallint not null,
  -- The last question of both: how difficult the problems made daily life.
  -- Not part of the score.
  difficulty      smallint check (difficulty between 0 and 3),

  self_harm_flag  boolean generated always as (scale = 'phq9' and answers[9] > 0) stored,

  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,

  constraint scale_responses_length check (
    (scale = 'phq9' and cardinality(answers) = 9) or
    (scale = 'gad7' and cardinality(answers) = 7)
  ),
  constraint scale_responses_range check (0 <= all (answers) and 3 >= all (answers)),
  constraint scale_responses_no_blank check (array_position(answers, null) is null),

  constraint scale_responses_patient_same_practitioner
    foreign key (practitioner_id, patient_id)
    references patients (practitioner_id, id) on delete cascade,
  constraint scale_responses_form_same_practitioner
    foreign key (practitioner_id, form_id)
    references patient_forms (practitioner_id, id) on delete cascade
);

create index scale_responses_patient_idx on scale_responses (patient_id, submitted_at desc);

alter table scale_responses enable row level security;

create policy "own_rows_read" on scale_responses
  for select
  using (practitioner_id = (select auth.uid()));

create policy "own_rows_review" on scale_responses
  for update
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));

revoke all on table scale_responses from anon;
revoke update on table scale_responses from authenticated;
grant update (reviewed_at) on table scale_responses to authenticated;


-- Returns 'ok', or why not: 'not_found', 'expired', 'submitted'. Wrong-length
-- or out-of-range answers raise on the checks above.
create or replace function public.submit_scale(
  raw_token    text,
  p_answers    smallint[],
  p_difficulty smallint default null
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
  select * into f
  from public.patient_forms
  where token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and kind = 'scale'
  for update;

  if not found then return 'not_found'; end if;
  if f.submitted_at is not null then return 'submitted'; end if;
  if f.expires_at < now() then return 'expired'; end if;

  insert into public.scale_responses (
    practitioner_id, patient_id, form_id, scale, answers, total, difficulty
  ) values (
    f.practitioner_id, f.patient_id, f.id, f.scale, p_answers,
    (select coalesce(sum(a), 0) from unnest(p_answers) as a),
    p_difficulty
  );

  update public.patient_forms set submitted_at = now() where id = f.id;
  return 'ok';
end;
$$;

grant execute on function public.submit_scale(text, smallint[], smallint) to anon, authenticated;
