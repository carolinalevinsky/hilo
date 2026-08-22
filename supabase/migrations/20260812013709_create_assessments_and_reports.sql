-- M5 — Assessments and reports.
--
-- The two documents a practitioner signs. Everything else in Hilo exists partly
-- so that these can be written from the record rather than from memory.
--
-- Both carry `ai_model`. When the pinned model is later replaced, we need to be
-- able to say exactly which reports came from which version — these are
-- documents with a professional's name on them, and "which of these did the old
-- model write?" is a question that will eventually be asked.

create table assessments (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null references patients (id) on delete cascade,

  instrument      text not null,
  assessed_on     date not null default current_date,

  -- The one legitimate JSONB column in this schema. A WISC-V has six subscale
  -- scores, a Bender is qualitative prose, and a goniometry is degrees per
  -- joint. Modelling that relationally would be EAV, which is worse than a blob
  -- — and unlike v1's patient blob, nothing here is ever filtered or summed.
  results         jsonb not null default '{}'::jsonb,
  -- What the practitioner said about behaviour during the administration.
  observations    text,

  -- The written interpretation, as plain text.
  --
  -- Plan 02 sketched this as `analysis_html`. Plain text is the better call and
  -- the reason is the "never build HTML by string concatenation" rule in
  -- CLAUDE.md: an HTML column has to be rendered with `dangerouslySetInnerHTML`,
  -- and once one screen does that, model output and practitioner input both
  -- become a rendering path React no longer escapes.
  --
  -- The document has exactly two kinds of line — a heading ending in a colon and
  -- a paragraph — so the markup is generated at render time by React, and the
  -- database holds text nobody can inject anything into.
  analysis        text,
  ai_generated    boolean not null default false,
  ai_model        text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index assessments_practitioner_created_idx
  on assessments (practitioner_id, created_at desc);
create index assessments_patient_idx on assessments (patient_id, assessed_on desc);

create trigger assessments_touch_updated_at
  before update on assessments
  for each row execute function public.touch_updated_at();

alter table assessments enable row level security;

create policy "own_rows" on assessments
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));


create table reports (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null references patients (id) on delete cascade,

  -- Each recipient needs a genuinely different register, not a relabelled one.
  -- v1 got this right and the list is theirs (legacy/index.html:1735).
  recipient       text not null check (recipient in (
                    'school', 'family', 'health_insurer', 'anep',
                    'physician', 'patient'
                  )),
  title           text not null,
  issued_on       date not null default current_date,

  -- Plain text, for the same reason as `assessments.analysis` above.
  content         text,
  -- What the practitioner typed to steer this particular report. Kept so the
  -- same report can be regenerated later without retyping the brief.
  input_notes     text,

  ai_generated    boolean not null default false,
  ai_model        text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- The monthly quota is `count(*)` over this index rather than a counter column.
-- A counter is a second copy of the truth and it drifts; this query is instant.
create index reports_practitioner_created_idx
  on reports (practitioner_id, created_at desc);
create index reports_patient_idx on reports (patient_id, issued_on desc);

create trigger reports_touch_updated_at
  before update on reports
  for each row execute function public.touch_updated_at();

alter table reports enable row level security;

create policy "own_rows" on reports
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
