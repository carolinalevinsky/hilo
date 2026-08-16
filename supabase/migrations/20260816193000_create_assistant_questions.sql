-- M8 — "Preguntale a Hilo": one row per question asked of the assistant.
--
-- This table exists to be counted. Every AI endpoint has to check a monthly
-- quota *before* it calls Anthropic — v1 checked it in the browser
-- (`legacy/index.html:2775`), behind an endpoint with no authentication at all,
-- so a stranger who found the URL could drain the key. Reports and assessments
-- are counted by counting their own rows; a question leaves nothing behind, so
-- it needs somewhere to be counted.
--
-- **The question text is deliberately not stored.** A practitioner asking "¿qué
-- trabajo con Tomás?" is writing something clinical about a named patient, and
-- keeping it here would be a second copy of clinical data whose only purpose is
-- arithmetic. A timestamp counts just as well.

create table assistant_questions (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  created_at      timestamptz not null default now()
);

-- The quota query is "how many this month, for this practitioner".
create index assistant_questions_by_month
  on assistant_questions (practitioner_id, created_at desc);

alter table assistant_questions enable row level security;

create policy "own_rows" on assistant_questions
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
