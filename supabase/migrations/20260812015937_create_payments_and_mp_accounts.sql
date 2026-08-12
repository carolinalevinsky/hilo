-- M6 — Payments.
--
-- Both of v1's remaining security defects die here, and they die in the schema
-- rather than in application code.


-- ─── payments ──────────────────────────────────────────────────────────────
--
-- Events, not counters.
--
-- v1 stored one record per patient per month — `{n: 3, monto: 1500}` — and
-- overwrote it. So "she paid twice in March" was a number that had replaced
-- another number, there was no date on anything, and a mistake could not be
-- traced because the previous value no longer existed.
--
-- Here every payment is a row. Totals are computed, which means they are always
-- consistent with the payments that produced them.

create table payments (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  patient_id      uuid not null references patients (id) on delete cascade,

  paid_on         date not null default current_date,
  -- 'YYYY-MM'. Which month the payment is *for*, which is not always the month
  -- it arrived in: a family paying March's fees in April is normal.
  period          text not null check (period ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  amount          numeric(10, 2) not null check (amount > 0),

  method          text not null default 'cash'
                    check (method in ('cash', 'transfer', 'mercadopago')),
  status          text not null default 'confirmed'
                    check (status in ('pending', 'confirmed', 'failed')),

  -- Mercado Pago's id for the payment. Unique, and that constraint is the whole
  -- idempotency story: MP retries a webhook until it gets a 2xx, so the same
  -- payment arrives several times and must be recorded once.
  mp_payment_id   text unique,
  note            text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index payments_practitioner_period_idx on payments (practitioner_id, period);
create index payments_patient_idx on payments (patient_id, paid_on desc);

create trigger payments_touch_updated_at
  before update on payments
  for each row execute function public.touch_updated_at();

alter table payments enable row level security;

create policy "own_rows" on payments
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));


-- ─── mp_accounts ───────────────────────────────────────────────────────────
--
-- **Defect #1, and the reason this table looks different from every other one.**
--
-- v1 read the practitioner's Mercado Pago access token straight from the browser
-- (`legacy/index.html:2477`) — a credential that can move money, sitting in a
-- JavaScript variable on a page. A comment in `legacy/api/mp-pago.js` claimed it
-- never left the server. It did.
--
-- The fix is not "be careful". It is that this table has **no policy at all**.
-- RLS is on and there is nothing to satisfy, so every request carrying a user
-- session — from the browser, from a Server Component, from anywhere — reads
-- zero rows. The only way in is the service-role client in
-- `src/server/mercadopago.ts`, which is one of the four files the lint rule
-- allows to import it.
--
-- `check:rls` requires every table to have RLS and at least one policy, so this
-- one exists purely to satisfy it, and it grants nothing: `using (false)`. That
-- is a deliberate, readable "no" rather than an omission someone could mistake
-- for an oversight and helpfully fix.

create table mp_accounts (
  practitioner_id uuid primary key references practitioners (id) on delete cascade,
  access_token    text not null,
  payment_link    text,
  connected_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger mp_accounts_touch_updated_at
  before update on mp_accounts
  for each row execute function public.touch_updated_at();

alter table mp_accounts enable row level security;

create policy "server_only" on mp_accounts
  for all
  using (false)
  with check (false);

-- Belt and braces, the same shape as `audit_log`: the grant goes too, so the
-- refusal happens one gate earlier and cannot be undone by someone adding a
-- policy without also noticing this line.
revoke all on table mp_accounts from authenticated, anon;
