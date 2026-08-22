-- M3 — The clinical core.
--
-- Four tables that together are the smallest version of Hilo that is genuinely
-- useful: set goals for a patient, record what happened in each session, tag
-- which goals were worked, and watch the progress move.
--
--   goals          what we are working towards, and how far along it is
--   goal_progress  the same number over time — the chart
--   sessions       what actually happened, one row per session held
--   session_goals  which goals each session touched


-- ─── goals ─────────────────────────────────────────────────────────────────

create table goals (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null references patients (id) on delete cascade,

  title           text not null,
  progress        integer not null default 0 check (progress between 0 and 100),
  -- Manual ordering. A practitioner reads their goals in the order they think
  -- about them, which is neither alphabetical nor chronological.
  position        integer not null default 0,
  -- Goals are retired, not deleted. "We stopped working on this in April" is
  -- clinical history.
  is_active       boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index goals_practitioner_created_idx on goals (practitioner_id, created_at desc);
create index goals_patient_idx on goals (patient_id, position, created_at);

create trigger goals_touch_updated_at
  before update on goals
  for each row execute function public.touch_updated_at();

alter table goals enable row level security;

create policy "own_rows" on goals
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));


-- ─── goal_progress ─────────────────────────────────────────────────────────
--
-- v1 kept this as a bare array on the goal: `h:[20,30,40,52,65]`. Numbers with
-- no dates, so the chart's x-axis was "the order things happened in" and no
-- question about *when* could be answered.
--
-- One row per goal per day. Updating the same goal twice in an afternoon moves
-- that day's point rather than adding a second one — otherwise a practitioner
-- adjusting a slider produces a chart made of noise.

create table goal_progress (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null references patients (id) on delete cascade,
  goal_id         uuid not null references goals (id) on delete cascade,

  recorded_on     date not null default current_date,
  value           integer not null check (value between 0 and 100),

  created_at      timestamptz not null default now(),

  unique (goal_id, recorded_on)
);

create index goal_progress_goal_idx on goal_progress (goal_id, recorded_on);
create index goal_progress_practitioner_idx on goal_progress (practitioner_id, recorded_on desc);

alter table goal_progress enable row level security;

create policy "own_rows" on goal_progress
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));

-- The series is kept by a trigger rather than by the application.
--
-- This is data integrity, not business logic: the chart must equal the goal's
-- history, always, whichever code path moved the number. Leaving it to the
-- caller means the one place that forgets produces a chart that quietly lies
-- about a patient's progress.
create or replace function public.record_goal_progress()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.progress is not distinct from old.progress then
    return new;
  end if;

  insert into public.goal_progress (practitioner_id, patient_id, goal_id, value)
  values (new.practitioner_id, new.patient_id, new.id, new.progress)
  on conflict (goal_id, recorded_on) do update set value = excluded.value;

  return new;
end;
$$;

create trigger goals_record_progress
  after insert or update of progress on goals
  for each row execute function public.record_goal_progress();


-- ─── sessions ──────────────────────────────────────────────────────────────
--
-- What actually happened. Distinct from an appointment (M4), which is only what
-- was scheduled and may be cancelled or missed. v1 conflated the two, which is
-- why it could not answer "how many did she miss?".

create table sessions (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null references patients (id) on delete cascade,

  held_on         date not null default current_date,
  -- What the practitioner writes after the session. This is the text the AI
  -- reads when it drafts a report (M5), so it is the most valuable field in the
  -- database.
  progress_note   text,
  -- Not for a report and not for a family. A practitioner's own working notes.
  private_note    text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index sessions_practitioner_created_idx on sessions (practitioner_id, created_at desc);
create index sessions_patient_held_idx on sessions (patient_id, held_on desc);

create trigger sessions_touch_updated_at
  before update on sessions
  for each row execute function public.touch_updated_at();

alter table sessions enable row level security;

create policy "own_rows" on sessions
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));


-- ─── session_goals ─────────────────────────────────────────────────────────
--
-- Which goals were worked in each session. It feeds the statistics screen and,
-- more importantly, the context handed to the AI when it drafts a report: "in
-- the last twelve sessions we worked on X eight times" is exactly the sentence
-- a practitioner needs and never has time to compute.

create table session_goals (
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  session_id      uuid not null references sessions (id) on delete cascade,
  goal_id         uuid not null references goals (id) on delete cascade,

  primary key (session_id, goal_id)
);

create index session_goals_goal_idx on session_goals (goal_id);
create index session_goals_practitioner_idx on session_goals (practitioner_id);

alter table session_goals enable row level security;

create policy "own_rows" on session_goals
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
