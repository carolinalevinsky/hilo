-- M4 — Scheduling.
--
-- Two tables, and the distinction between them is the whole point:
--
--   schedules     the rule.  "Tomás, Mondays at 09:00, every week."
--   appointments  the occurrence.  "Monday 17 August at 09:00, attended."
--
-- v1 had only the rule, and stored it as
-- `{"Lunes": [{h: "09:00", id: 1}]}` — a weekday name and a time, with no dates
-- anywhere. So last week did not exist, a cancellation had nowhere to live, and
-- "how many sessions did I actually hold in July?" was unanswerable.
--
-- An appointment is also not a session. The appointment is what was scheduled
-- and may be cancelled or missed; the session (M3) is the clinical record of
-- what happened. Keeping them apart is what makes "how many did she miss?" and
-- "how many can I bill?" different, answerable questions.


-- ─── schedules ─────────────────────────────────────────────────────────────

create table schedules (
  id                uuid primary key default gen_random_uuid(),
  practitioner_id   uuid not null references practitioners (id) on delete cascade,
  patient_id        uuid not null references patients (id) on delete cascade,

  -- 0 = Sunday, matching JavaScript's getDay(). The interface shows Monday
  -- first, which is a rendering decision and stays in the interface.
  weekday           integer not null check (weekday between 0 and 6),
  start_time        time not null,
  duration_minutes  integer not null default 45 check (duration_minutes between 5 and 480),

  frequency         text not null default 'weekly'
                      check (frequency in ('weekly', 'biweekly', 'monthly')),
  -- The anchor a biweekly or monthly rule counts from. Without it "every other
  -- Monday" has no way to say *which* Mondays.
  starts_on         date not null default current_date,
  ends_on           date,

  is_active         boolean not null default true,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index schedules_practitioner_idx on schedules (practitioner_id, weekday, start_time);
create index schedules_patient_idx on schedules (patient_id);

create trigger schedules_touch_updated_at
  before update on schedules
  for each row execute function public.touch_updated_at();

alter table schedules enable row level security;

create policy "own_rows" on schedules
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));


-- ─── appointments ──────────────────────────────────────────────────────────

create table appointments (
  id                uuid primary key default gen_random_uuid(),
  practitioner_id   uuid not null references practitioners (id) on delete cascade,
  patient_id        uuid not null references patients (id) on delete cascade,
  -- Null for a one-off. Set when the row was materialised from a rule, so
  -- turning the rule off can leave the past alone and clear only the future.
  schedule_id       uuid references schedules (id) on delete set null,

  scheduled_on      date not null,
  start_time        time not null,
  duration_minutes  integer not null default 45 check (duration_minutes between 5 and 480),

  status            text not null default 'scheduled'
                      check (status in ('scheduled', 'attended', 'cancelled', 'no_show')),
  source            text not null default 'manual'
                      check (source in ('schedule', 'manual', 'booking_request')),

  -- Set if the appointment was ever pushed to Google Calendar. Reserved for the
  -- day two-way sync exists; today the app only builds "add to calendar" links,
  -- which create nothing it could store an id for.
  gcal_event_id     text,
  note              text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- What makes materialising occurrences safe to re-run. Generating the next
  -- three weeks happens on every agenda load; without this it would happen
  -- again on every agenda load.
  unique (schedule_id, scheduled_on)
);

create index appointments_practitioner_date_idx
  on appointments (practitioner_id, scheduled_on, start_time);
create index appointments_patient_idx on appointments (patient_id, scheduled_on desc);

create trigger appointments_touch_updated_at
  before update on appointments
  for each row execute function public.touch_updated_at();

alter table appointments enable row level security;

create policy "own_rows" on appointments
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));


-- ─── The link back to sessions ─────────────────────────────────────────────
--
-- Deferred from M3 because `appointments` did not exist yet. Optional in both
-- directions: a session can be recorded without an appointment (someone came in
-- unscheduled), and an appointment can exist with no session (it was missed).

alter table sessions
  add column appointment_id uuid references appointments (id) on delete set null;

create index sessions_appointment_idx on sessions (appointment_id);
