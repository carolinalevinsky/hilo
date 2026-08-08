# Plan 02 — Migration

**Goal:** rebuild Hilo on the v2 architecture, carrying over everything the v1 prototype got right and none of what it got wrong.

**Prerequisite:** Plan 01 complete.

**Nature of the work:** this is a **rewrite, not a port.** There are no real users and no production data — v1 is a prototype with test rows — so nothing constrains us to v1's structure. **No file moves from `legacy/` into `src/`.** Text is transcribed; code is rewritten.

---

## 1. What carries over, and what does not

### Carries over — this is the valuable part

- **Visual design.** Palette, spacing, card and empty-state patterns, the hand-drawn SVG icon set, the whole visual language.
- **Spanish product copy.** Every label, hint, empty state, and error message. It is warm, clear, and written by someone who understands the audience. Reuse it verbatim.
- **The clinical AI prompts.** `legacy/api/ia.js` lines 6–24 are genuinely good: Rioplatense register, Ley 18.331 compliance, an explicit rule against inventing results, and per-recipient tone for family / school / health insurer / ANEP. Port the text as-is.
- **Product decisions.** Which assessment instruments belong to which discipline, which report recipients each profession needs, the two-step onboarding, the WhatsApp-first communication flow. These reflect real domain knowledge about therapy practice in Uruguay.
- **The email templates.** `legacy/api/aviso-reserva.js` and `legacy/api/resumen.js` contain finished, well-written HTML emails in the product's visual language. Port the markup and the Spanish copy. Rewrite the surrounding logic (see defects #10 and #11).
- **The notification product decisions**, which are good ones: notify on a new booking because that is when the practitioner can still act, and send a digest only when there is something to say (`legacy/api/resumen.js:60` — `if (!nRes && !atr.length) continue`). Silence when nothing is happening is why a notification gets read when something is.

### Worth saying explicitly

`aviso-reserva.js` and `resumen.js` are the first part of v1 built the right way: the `service_role` key is read from a server environment variable and never leaves the server. That is exactly the correction defect #1 needs. v2 keeps the pattern and fixes what surrounds it.

### Does not carry over

- Every line of JavaScript in `legacy/index.html`.
- The `data` JSONB blob schema.
- Runtime AI model resolution.
- Client-side plan enforcement.
- The demo fixture data interleaved with real app state.

---

## 2. Defect catalogue

Each defect found in v1, and where in this plan it stops being possible. Paths are relative to `legacy/` after Plan 01 Phase 1.

| # | Defect | v1 location | Fixed by |
|---|---|---|---|
| 1 | Mercado Pago access token readable from the browser | `index.html:2477` | `mp_accounts` has no SELECT policy; server-only reads. **M6** |
| 2 | `/api/ia` has no authentication or rate limit — anyone can drain the Anthropic key | `api/ia.js:71` | Session check + per-practitioner quota in the route handler. **M5** |
| 3 | Plan limits enforced in the browser | `index.html:2775` | `count(*)` server-side before the AI call. **M5** |
| 4 | Whole-patient overwrite on every save — last-write-wins data loss | `index.html:3069` | Normalised tables; row-level writes. **M2** |
| 5 | AI model chosen at runtime by regex over the account's model list | `api/ia.js:33-52` | Pinned model ID in code. **M5** |
| 6 | Anonymous browser INSERT into `reservas` with an arbitrary `prof_id` | `index.html:1628` | No anon policy; server route validates and rate-limits. **M7** |
| 7 | No Mercado Pago webhook — payment status is manual | absent | Signed webhook writes `payments`. **M6** |
| 8 | No versioned SQL; RLS configured by hand in the dashboard | absent | `supabase/migrations/` is the only schema source. **M1** |
| 9 | XSS surface from `innerHTML` + manual escaping across ~2,200 lines | throughout | React escapes by default. **All** |
| 10 | Fail-open auth: `if (SECRET) { validate }` — an unset env var disables the check entirely | `api/aviso-reserva.js:22`, `api/resumen.js:27` | Secrets validated at startup by `src/lib/env.ts`; missing secret = the app does not build. **M7** |
| 11 | Env vars read through fallback chains (`SB_SERVICE_KEY \|\| Superbase_service_role \|\| SUPABASE_SERVICE_ROLE`) | `api/resumen.js:12-13`, `api/aviso-reserva.js:11-12` | One canonical name per variable, Zod-validated. **M1** |
| 12 | The digest emails every practitioner serially inside one serverless invocation | `api/resumen.js:56-91` | Query only practitioners with something to report; send in bounded batches. **M8** |

Defects 1 and 2 are the ones that would matter most if v1 had users. It has none, which is the only reason this is a plan rather than an incident.

**Defect 10 deserves a note because the shape of it recurs.** `if (WEBHOOK_SECRET) { validate }` means that when the environment variable is absent, the endpoint accepts anything: a caller supplies any `prof_id` and sends that practitioner an email whose body they control, and `/api/resumen` triggers a full send on demand. The consequences here are nil — the table holds test rows and one real inbox — but the pattern is the point. A guard conditional on its own configuration is not a guard. The correct shape inverts it: a missing secret is a fatal configuration error, checked once at startup (Plan 01, Phase 10), not a per-request `if` that silently degrades to open.

No fix is needed in v1. It goes to `legacy/` in Plan 01 Phase 1 and stops being deployed.

---

## 3. Data model

Design rules:

1. **Columns for anything filtered, sorted, or summed. JSONB only for heterogeneous data that is never queried.** The single legitimate JSONB use is `assessments.results` — a WISC-V has six subscale scores, a Bender is qualitative prose, and modelling that relationally would be EAV, which is worse than a blob.
2. **Events, not counters.** v1 stored `{n: 3, amount: 1500}` per month and overwrote it. We store one row per payment and compute totals.
3. **`practitioner_id` on every table, including children.** Denormalised deliberately — see section 4.
4. **Nothing is hard-deleted.** These are clinical records.

### Core

```sql
practitioners
  id                            uuid PK, references auth.users(id)
  email                         text not null
  full_name                     text not null
  discipline                    text not null   -- check constraint
  plan                          text not null default 'free'
  slug                          text unique     -- public booking link
  created_at                    timestamptz default now()

patients
  id                            uuid PK default gen_random_uuid()
  practitioner_id               uuid not null references practitioners(id)
  full_name                     text not null
  date_of_birth                 date
  age_group                     text            -- children | adolescents | adults
  school_level                  text
  school                        text
  health_insurer                text
  phone                         text
  referral_reason               text
  start_date                    date
  consent_signed_at             timestamptz
  color                         text
  photo_path                    text            -- Supabase Storage path
  session_fee                   numeric(10,2)
  billing_frequency             text            -- monthly | biweekly | weekly | per_session
  expected_sessions_per_month   integer
  archived_at                   timestamptz
  deleted_at                    timestamptz
  created_at, updated_at        timestamptz
```

`date_of_birth` replaces v1's free-text `"5 años"`. Age is derived, so it never goes stale and patients can be filtered and sorted by age.

### Clinical tracking — the core of the product

```sql
goals
  id, practitioner_id, patient_id
  title                         text not null
  progress                      integer         -- 0-100
  position                      integer
  is_active                     boolean default true

goal_progress
  id, goal_id
  recorded_on                   date not null
  value                         integer not null

sessions
  id, practitioner_id, patient_id
  appointment_id                uuid null references appointments(id)
  held_on                       date not null
  progress_note                 text            -- what the practitioner writes after each session
  private_note                  text

session_goals
  session_id, goal_id           -- composite PK
```

`goal_progress` is the time series v1 kept as a bare array (`h:[20,30,40,52,65]`). As its own table it supports real charts, per-period statistics, and audit.

`session_goals` records which goals were worked in each session. It feeds both the statistics screen and the AI report context.

### Scheduling

```sql
schedules            -- the recurrence rule
  id, practitioner_id, patient_id
  weekday                       integer         -- 0-6
  start_time                    time
  frequency                     text            -- weekly | biweekly | monthly
  is_active                     boolean

appointments         -- the concrete occurrence
  id, practitioner_id, patient_id
  schedule_id                   uuid null references schedules(id)
  scheduled_on                  date not null
  start_time                    time not null
  status                        text            -- scheduled | attended | cancelled | no_show
  source                        text            -- schedule | manual | booking_request
  gcal_event_id                 text
```

**An appointment is not a session.** The appointment is what was scheduled and may be cancelled or missed; the session is the clinical record of what actually happened. v1 conflated them, which is why it cannot answer "how many did she miss?" or "how many did I actually bill?".

v1's agenda was `{"Lunes": [{h: "09:00", id: 1}]}` — no dates at all, so last week did not exist. `appointments.scheduled_on` is a real date. Materialise occurrences a few weeks ahead from the rule.

### Documents

```sql
assessments
  id, practitioner_id, patient_id
  instrument                    text not null   -- 'WISC-V', 'Bender', ...
  assessed_on                   date not null
  results                       jsonb           -- shape varies per instrument
  analysis_html                 text
  ai_generated                  boolean
  ai_model                      text

reports
  id, practitioner_id, patient_id
  recipient                     text not null   -- school | family | health_insurer | anep | physician | patient
  issued_on                     date not null
  content_html                  text
  input_notes                   text
  ai_generated                  boolean
  ai_model                      text
```

`ai_model` is stored per document. When a model is later replaced, we can tell exactly which reports were produced by which version — which matters for clinical records that a professional signed.

### Money

```sql
payments
  id, practitioner_id, patient_id
  paid_on                       date not null
  period                        text            -- 'YYYY-MM'
  amount                        numeric(10,2) not null
  method                        text            -- cash | transfer | mercadopago
  mp_payment_id                 text unique
  status                        text            -- pending | confirmed | failed

mp_accounts
  practitioner_id               uuid PK
  access_token                  text            -- NO SELECT POLICY. Server-only.
  payment_link                  text

booking_requests
  id, practitioner_id
  name, phone                   text not null
  preferred_weekday             integer
  preferred_time                time
  note                          text
  status                        text            -- pending | confirmed | dismissed
  created_at                    timestamptz
```

### Support

```sql
materials
  id
  practitioner_id               uuid null       -- null = shipped with Hilo
  category, title, content, age_range, discipline

audit_log
  id, practitioner_id
  action, entity, entity_id
  created_at
```

`audit_log` is ~20 lines of code and exists because this is health data under Ley 18.331. It is not enterprise ceremony.

### Conventions

- **Enums as `text` + `CHECK`, not Postgres enum types.** Adding a value to a PG enum is awkward inside a transaction; a `CHECK` changes with an `ALTER`. Less elegant, far easier to migrate.
- **Photos and generated PDFs go to Supabase Storage** (private buckets). The table stores a path. v1 put base64 photos inside the JSON blob.
- **Indexes** on every foreign key plus `(practitioner_id, created_at)` wherever a list is paginated.

---

## 4. Security model

### Denormalised `practitioner_id`

Every table carries `practitioner_id`, even children like `goal_progress` that could reach it through a join. This makes every RLS policy identical and one line long:

```sql
alter table sessions enable row level security;

create policy "own_rows" on sessions
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
```

Fifteen tables, one policy shape, nothing to get subtly wrong. The cost is keeping the column consistent, which the server always sets and a trigger validates.

**The `(select auth.uid())` wrapper is not stylistic.** Postgres caches a subquery result across the scan; a bare `auth.uid()` is re-evaluated per row. At a few hundred patients the difference is measurable.

### Client selection

| Situation | Client | RLS |
|---|---|---|
| Everything normal | Supabase client carrying the user's session | enforced |
| Read `mp_accounts.access_token` | service role | bypassed |
| Mercado Pago webhook | service role | bypassed |
| Insert a public booking request | service role | bypassed |
| Write `audit_log` | service role | bypassed |

**Four places. No others** — and this is enforced by lint rule 3 (Plan 01, Phase 4), not by convention. A fifth requires editing the allowlist in `eslint.config.mjs`, which makes it a deliberate, visible act rather than an ordinary import that nobody notices.

This layering is what makes RLS a real safety net rather than decoration: if a service function ever forgets its `practitioner_id` filter, Postgres still refuses to return another practitioner's rows.

### Public booking

The v1 flow had an anonymous browser insert into `reservas` with a caller-supplied `prof_id` — trivially spammable, and it exposed the practitioner's `auth.users.id` in the URL.

v2:
1. The link uses `practitioners.slug`, not a UUID.
2. The form POSTs to a route handler.
3. The handler validates the slug, rate-limits by IP, then inserts using the service role.
4. **`booking_requests` has no policy for the anonymous role at all.**

The attack surface is removed rather than mitigated.

---

## 5. AI integration

### Model

**Pin `claude-opus-5` in code.** No runtime resolution, ever. v1 listed the account's models and picked the first match for `/haiku/i`, which meant the quality of a clinical report a professional signs depended on what that list returned that day.

```ts
// src/server/ai.ts
const MODEL = 'claude-opus-5'
```

Pricing at the time of writing — **$5 per million input tokens, $25 per million output.** For comparison, `claude-sonnet-5` is $3/$15 and `claude-haiku-4-5` is $1/$5.

Reports are the product's core value: a document a licensed professional puts their name and signature on. The plan plans for Opus 5. **Choosing a cheaper tier is a business decision for Tomás, not a default to slide into** — and because `MODEL` is one constant, changing it later is a one-line edit plus an evaluation pass over saved reports.

### SDK, not raw fetch

v1 called `https://api.anthropic.com/v1/messages` with `fetch` by hand. Use the official SDK:

```bash
npm i @anthropic-ai/sdk
```

It brings typed responses, automatic retry on 429 and 5xx, and streaming helpers that would otherwise be hand-rolled.

### Streaming

Report generation is the one request most likely to hit a serverless timeout. The fix is not leaving Vercel — it is streaming.

Stream the response over SSE from a route handler and render tokens as they arrive. Two benefits: the HTTP timeout stops being the constraint, and the practitioner watches the report being written instead of staring at a spinner for thirty seconds.

Anything above roughly 16,000 `max_tokens` should stream as a rule.

### Notes specific to this model

- **Thinking is on by default on Opus 5.** Omitting the `thinking` parameter runs adaptive thinking. `max_tokens` caps thinking *plus* response text together, so it needs headroom — a value sized only for the report body will truncate.
- **Disabling thinking is only permitted at `effort` `high` or below.** Pairing `thinking: {type: 'disabled'}` with `xhigh` or `max` returns a 400.
- **Effort:** start at `high` (the default). Sweep `medium` and `low` against saved reports before assuming higher is better — on this model the lower levels are unusually strong, and effort is the main cost lever.
- **Handle `stop_reason: 'refusal'` before reading `content`.** Safety classifiers can decline a request and return HTTP 200 with an empty or partial `content`. Code that reads `content[0].text` unconditionally will crash. Clinical prompts are benign, but adjacent life-sciences vocabulary can trip a classifier.
- **Opt into server-side fallbacks** so a declined request is retried automatically instead of surfacing an error to the practitioner.
- **Prompt caching.** The clinical instruction block (`BASE_INSTRUCTIVO`, ~800 words) is identical on every request — exactly the shape caching is for. Put a cache breakpoint at the end of the system prompt and keep per-request content strictly after it. Cache reads cost about a tenth of the base input rate. The minimum cacheable prefix on Opus 5 is 512 tokens, which this comfortably exceeds.
- **Do not add "double-check your work" instructions.** This model self-verifies; explicit verification instructions cause redundant work. This inverts the usual prompting advice and is worth a note in `CLAUDE.md`.

### Authentication and quota

The v1 endpoint was fully open. In v2, `/api/ai/*`:

1. Resolves the session — anonymous requests are rejected.
2. Counts the practitioner's reports for the current month.
3. Rejects if over the plan limit **before** calling Anthropic.

```sql
select count(*) from reports
where practitioner_id = $1
  and created_at >= date_trunc('month', now());
```

No usage-counter table. A counter is a second copy of the truth that can drift; this query is instant with the index in place.

---

## 6. Notifications

v1 grew two email features after this plan was first written. Both are good product ideas and both keep their behaviour in v2. What changes is where they run from.

Provider: **Resend**, already in use. One module, `src/server/notifications.ts`, exporting one function per email. Templates as plain template strings — email HTML has to survive Outlook, and a React email renderer is a dependency this project does not need to carry for two messages.

### Booking notification — the Supabase webhook goes away

v1 wires this as a *Database Webhook*: Supabase watches for an INSERT on `reservas` and POSTs to `/api/aviso-reserva`.

v2 does not need it. The booking form already POSTs to our own route handler (section 4), so the handler inserts the row and sends the email in the same function. One code path instead of two systems, and the email is testable.

That deletes a real liability, not just a hop. The webhook's configuration — URL, secret header, which table, which event — lives in the Supabase dashboard and exists nowhere in git. It cannot be reviewed, cannot be tested, is not restored by any rollback, and breaks silently the day the URL changes. A whole class of "why did the emails stop?" disappears with it.

### Digest — a real cron route

A new `vercel.json` at the repository root, replacing the one that moved into `legacy/`:

```json
{ "crons": [{ "path": "/api/digest", "schedule": "0 11 1,15 * *" }] }
```

The route lives at `src/app/api/digest/route.ts` — App Router serves it at `/api/digest`, the same URL shape v1 used. Nothing about the schedule or the concept changes.

Three fixes to the v1 implementation:

1. **`CRON_SECRET` is required.** Read through `src/lib/env.ts`; a missing value fails the build. No `if (secret)`.
2. **Query for the practitioners who have something to report**, rather than fetching every practitioner and every patient and filtering in JavaScript. v1 pulls the entire `pacientes` table into memory on every run.
3. **Send in bounded batches** with a cap per invocation. v1's serial loop works at five practitioners and times out well before five hundred.

### Where email must not go

Email is a notification channel, never a system of record. No clinical content — no patient names beyond what the practitioner already knows, no assessment results, no report bodies. Under Ley 18.331 an email is an uncontrolled copy of clinical data sitting in a third-party inbox forever.

v1 already respects this by accident: the digest sends patient *names* against a "possibly unpaid" list. That is borderline, and in v2 the digest sends counts and a link — the names live behind the login.

**Applies to:** M7 (booking notification), M8 (digest).

---

## 7. Milestones

Each milestone is independently shippable to a preview URL and reviewable by someone non-technical.

### M1 — Auth and profile
Tables `practitioners`, `audit_log`. Sign-up, sign-in, session middleware. `requireUser()` in `src/server/auth.ts`. RLS enabled with the standard policy. App shell: sidebar, mobile bottom nav, routing.

**Done:** a practitioner can register, sign in, see their name, and sign out.

### M2 — Patients
Tables `patients`. Full CRUD, list with search and filter, patient detail page, photo upload to Storage, soft delete, archive.

**Done:** patients can be created, edited, listed, and archived — and nothing is lost when two tabs are open. Directly retires defect #4.

### M3 — Clinical core
Tables `goals`, `goal_progress`, `sessions`, `session_goals`. Record a session, tag which goals were worked, update progress, render the progress chart.

**Done:** the full loop — create patient, set goals, record sessions, watch progress move. **This is the smallest version of Hilo that is genuinely useful.**

### M4 — Scheduling
Tables `schedules`, `appointments`. Weekly grid with real dates, recurrence rules, one-off appointments, attendance status, Google Calendar sync.

**Done:** a week can be scheduled and past weeks can be reviewed.

### M5 — Assessments, reports, AI
Tables `assessments`, `reports`. Instrument catalogue per discipline, dynamic score entry form, AI report generation with SSE streaming, per-recipient prompt variants, PDF export.

Retires defects #2, #3, #5.

**Done:** a report is generated with streamed AI output, is editable, exports to PDF, and cannot be generated past the plan limit or without a session.

### M6 — Payments
Tables `payments`, `mp_accounts`. Monthly ledger, payment records, Mercado Pago checkout link generation, signed webhook.

Retires defects #1, #7. **Both security fixes land here — this milestone should not be deferred behind cosmetic work.**

**Done:** a payment link can be sent, and the webhook marks it confirmed without manual intervention.

### M7 — Public booking and its notification
Table `booking_requests`. Slug-based public page, rate-limited server insert, practitioner inbox, one-click conversion into a patient plus appointment. `src/server/notifications.ts` with the booking email sent inline by the same route handler that writes the row — no Supabase Database Webhook.

Retires defects #6 and #10.

**Done:** a family requests a slot from a public link, the practitioner gets the email within seconds, confirms it, and a patient record appears. Sending the email is covered by a test, which it never could have been as a webhook.

### M8 — Materials, statistics, assistant, digest
Table `materials`. Library filtered by discipline and age, session planner, statistics screen, the in-app assistant. The fortnightly digest as a cron route (section 6), sending counts and a link rather than patient names.

Retires defect #12.

**Done:** parity with v1's remaining screens, and the digest fires on schedule with the cron secret enforced.

### M9 — Launch
PWA manifest and install prompt, mobile polish, empty and error states, the terms and privacy pages, seed data for demos, production Supabase, custom domain.

**Done:** real practitioners can be invited.

---

## 8. Testing

Proportionate, not exhaustive.

| Layer | Approach |
|---|---|
| `src/server/` business rules | Vitest unit tests against a local Supabase |
| RLS policies | Integration test: practitioner A must not read practitioner B's rows. **Non-negotiable.** |
| Payments | Webhook signature verification and idempotency |
| AI | Snapshot the prompt assembly, not the model output |
| Notifications | Assert the send is called with the right recipient and that no clinical field appears in the body |
| Critical paths | Playwright: sign-up → patient → session → report |

The RLS test is the one that must exist from M1. It is the check that turns "we enabled RLS" into "we verified RLS works," and it is the difference between a claim and a fact when the data is clinical.

---

## 9. Cutover

There is no data migration — there is no data. Before running this, confirm that is still true by looking at v1's `pacientes` table rather than by remembering. If something has accumulated that is worth keeping, it is a one-off script from the `data` JSONB into the normalised tables, not a change to any of this.

1. Verify every milestone on preview URLs.
2. Run migrations against v2's production Supabase project.
3. Seed the global `materials` rows.
4. Point the domain at the v2 deployment.
5. Merge `rewrite` into `main`, tag `v2.0.0`.
6. `legacy/` stays in the repository as reference. Pause v1's old Supabase project rather than deleting it — pausing is reversible and free.

---

## 10. Sequencing note

M1 → M2 → M3 is a strict chain; nothing useful exists before M3 completes.

After that, **M5 and M6 are the two that matter most and should not slip.** M5 is the product's differentiator — AI-assisted clinical reports are the reason someone would pay for Hilo. M6 carries the two real security fixes.

M4, M7, and M8 are genuinely reorderable. If time gets tight, M8 is the one to cut: the materials library and the assistant are nice, but a practitioner with patients, sessions, goals, reports, and payments has a working product.
