-- "Primeros pasos", third step: "Mirá tus pagos".
--
-- The other two steps are read off what the practitioner saved — a patient, a
-- session plan. This one is only a visit: there is nothing to save on Pagos
-- until somebody owes something. So the visit itself is what gets written,
-- once, when the step's button opens the screen. Per account and not per
-- browser, for the same reason `onboarded_at` is: the phone and the laptop
-- are the same practitioner.
alter table practitioners
  add column payments_seen_at timestamptz;

-- `20260906120000` revoked the table-level UPDATE, so a new column is
-- unwritable from a session until it is granted by name. See
-- `20260930145300` for the one that was forgotten.
grant update (payments_seen_at) on table practitioners to authenticated;
