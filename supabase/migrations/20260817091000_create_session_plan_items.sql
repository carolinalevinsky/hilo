-- The prepared next session: what a practitioner decided to work on, before
-- they work on it.
--
-- This is v1's "Planificar sesión" (`legacy/index.html:2855`), which was the
-- half of Planificación the rewrite dropped. v1 kept it as `p.plan`, an array
-- inside the patient's JSON blob — which is defect #4 from the migration notes,
-- the one where two open tabs overwrote each other's work. Rows instead.
--
-- A plan item is one of two things, and the check enforces that it is at least
-- one of them:
--
--   a goal to work on      title (and goal_id, when it came from a real goal)
--   a material to use      material_id
--
-- Most items are both: v1's "Agregar" on a suggested goal attached the material
-- it had matched.

create table session_plan_items (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null references patients (id) on delete cascade,

  -- The goal this came from, when it came from one. `set null` rather than
  -- cascade: retiring a goal should not silently empty the session you already
  -- planned around it — the title stays and you decide.
  goal_id         uuid references goals (id) on delete set null,
  -- Likewise for a material that gets deleted: the line stays, the link goes.
  material_id     uuid references materials (id) on delete set null,

  -- What to work on, in the practitioner's words. Copied from the goal at the
  -- time of adding rather than read through `goal_id`, so an item added from a
  -- goal still reads correctly after the goal is renamed or retired.
  title           text,

  -- Manual ordering. A session has an order and it is neither alphabetical nor
  -- chronological — it is warm-up first and the hard thing in the middle.
  position        integer not null default 0,

  created_at      timestamptz not null default now(),

  constraint session_plan_items_not_empty
    check (title is not null or material_id is not null)
);

-- The only query: everything planned for one patient, in order.
create index session_plan_items_patient_idx
  on session_plan_items (patient_id, position, created_at);

alter table session_plan_items enable row level security;

create policy "own_rows" on session_plan_items
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
