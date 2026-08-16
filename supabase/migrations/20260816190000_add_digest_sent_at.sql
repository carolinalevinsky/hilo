-- When this practitioner was last sent a fortnightly digest.
--
-- The digest runs from a cron with a hard cap per invocation, so that one run
-- cannot grow past the function's time limit as the number of accounts grows.
-- A cap alone is not enough: without an order, every run returns the same first
-- rows Postgres happens to hand back, and the practitioners past the cap are
-- never written to at all — the same ones, every fortnight, silently.
--
-- Ordering by this column, nulls first, is what makes "the ones this run did not
-- reach go out on the next one" true rather than a comment.
--
-- Null means never sent, which is where a new practitioner starts and therefore
-- the front of the queue.

alter table practitioners
  add column digest_sent_at timestamptz;

-- The cron writes this with the service role; a practitioner has no reason to
-- read or write it, but it lives on a row they already own, so the existing
-- policy covers it and no new one is needed.
comment on column practitioners.digest_sent_at is
  'Last fortnightly digest send. Ordered by, nulls first, to rotate the batch.';
