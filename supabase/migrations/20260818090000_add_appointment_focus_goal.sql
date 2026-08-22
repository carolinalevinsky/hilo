-- "Plan de la semana": which goal each session of this week is for.
--
-- v1's panel under the agenda grid (`legacy/index.html:1498`) let you pick the
-- objective for each session and tick it off. The picking worked; the keeping
-- did not — it lived in a `plan` object in memory, keyed by day and time, so
-- reloading the page threw away every choice and reset each row to the
-- lowest-scoring goal again.
--
-- One nullable column fixes that. NULL means "not decided yet", and the
-- interface falls back to the same suggestion v1 defaulted to — the goal that
-- has moved least — so the panel reads identically on first load and, unlike
-- v1, still reads that way after a refresh.
--
-- `on delete set null` rather than cascade: retiring a goal must not delete the
-- appointment that was going to work on it.

alter table appointments
  add column focus_goal_id uuid references goals (id) on delete set null;

-- No index: it is read as part of the appointment row, which is already fetched
-- by (practitioner_id, scheduled_on).
--
-- No policy change either. `appointments` and `goals` both carry
-- `practitioner_id` and both have the standard own-rows policy, so a row can
-- only ever point at a goal its owner can already see. The server function that
-- writes it re-reads the goal through the user's session anyway, so a tampered
-- form field addresses nothing.
