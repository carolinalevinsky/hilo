# Plan 02 — where the migration stands

**Companion to `docs/plan-02-migration.md`.** That file is the plan and does not
change. This one records what has actually been built, what is half-built, and
what a fresh session needs to know before touching any of it.

Last updated: 12 August 2026, mid-M8.

---

## Status at a glance

| Milestone | State | Commit |
|---|---|---|
| M1 — Auth and profile | **done** | `36f9a6c` |
| M2 — Patients | **done** | `5ac241f` |
| M3 — Clinical core | **done** | `0519a94` |
| M4 — Scheduling | **done** | `06e0f01` |
| M5 — Assessments, reports, AI | **done** | `94061ca` |
| M6 — Payments | **done** | `d49e6b6` |
| M7 — Public booking + notification | **done** | `31aa9ac` |
| M8 — Materials, statistics, digest | **in progress, uncommitted** | — |
| M9 — Launch | not started | — |

All twelve defects in the plan's catalogue are retired **except** #12, whose fix
(the batched digest) is written but not yet committed or tested.

Everything through M7 is committed, green on `lint` / `typecheck` / `test` /
`check:rls` / `check:secrets` / `check:migration` / `build`, and verified by
driving the running app in a browser rather than by reading the diff.

---

## Rules that were learned the hard way

A fresh session — or a subagent — must know these. Each one cost real debugging.

1. **Node runs inside Docker.** There is no Node on the host. Every command goes
   through `./dx`: `./dx npm run lint`, `./dx npx supabase …`. Running `npm`
   directly fails.

2. **`src/lib/` is for anything a Client Component needs.** Importing a *value*
   from `src/server/` into a `'use client'` file drags `db.ts` and
   `next/headers` into the browser bundle and the build fails. `import type` is
   fine (erased). This is why `src/lib/periods.ts` exists separately from
   `src/server/payments.ts`.

3. **Dropdown menu items must be forms, not `onSelect` handlers.** An
   `onSelect` that calls a Server Action sent no request at all and the menu
   silently did nothing. Every action in a menu is now a `<form action={…}>`
   wrapping a `DropdownMenuItem asChild`.

4. **`'use server'` files may only export async functions.** The `FormState`
   shape and `EMPTY_FORM_STATE` live in `src/lib/form-state.ts` for that reason.

5. **A migration must grant table privileges.** RLS policies and grants are two
   different gates. The first migration sets `alter default privileges … grant …
   to authenticated, service_role`, so new tables are covered — but a table that
   must be unreachable (`mp_accounts`) also has to `revoke`.

6. **Route handlers are never redirected by the proxy.** `src/proxy.ts` treats
   `/api/*` as public and each handler returns its own 401. Redirecting them
   turned an unauthorised POST into a 200 with an HTML body, and the booking form
   read that as success.

7. **A client fetch must check the body, not just the status.** Same incident.

8. **React: adjust state during render, not in an effect.** The lint rule
   `react-hooks/set-state-in-effect` blocks the effect version. The pattern used
   throughout is the "compare with last seen value during render" one — see
   `goal-list.tsx` and `payment-dialog.tsx`.

9. **`supabase/seed.sql` needs eight empty strings** in the `auth.users` insert
   (`confirmation_token`, `recovery_token`, …). GoTrue reads them into
   non-nullable fields and a NULL makes every sign-in fail with "invalid
   credentials" — a password error that has nothing to do with the password.

10. **Never `dangerouslySetInnerHTML`.** Reports, assessments and materials store
    **plain text**, rendered by `DocumentBody` (a short line ending in a colon is
    a heading; everything else is a paragraph). The one place that concatenates
    markup is `src/server/notifications.ts`, because email HTML has no
    alternative — and every interpolation there goes through `escapeHtml`, with
    a test proving it.

---

## Conventions this codebase now follows

Read a recently-touched file before writing a new one; the shapes are
consistent and deliberate.

**Structure.** `src/server/<concept>.ts` holds business logic and every query;
`practitionerId` is always the first argument and never read from a cookie
inside those functions. `src/app/**/actions.ts` are thin Server Actions.
Reads happen in Server Components, writes in Server Actions, and a route handler
exists only where something outside the app calls in (the two AI streams, the MP
webhook, the public booking POST, the digest cron).

**Prompt files are separate from persistence.** `report-prompt.ts` /
`reports.ts`, `assessment-prompt.ts` / `assessments.ts`. That is what makes the
prompt snapshot-testable without a database.

**Spanish.** Rioplatense, `vos`. Copy is transcribed from v1 wherever v1 had it —
it is warm and it was written by someone who knows the audience. Empty states
always say what goes there and offer the button.

**Visual language.** The v1 palette is in `globals.css`; patients carry one of
six accent colours, the same colour on every screen. `PageHeader` on every page,
`EmptyState` in every list, `Card` for every block. The document screens print —
`@media print` in `globals.css` is a real output, not decoration.

**Comments.** Explain *why*, especially where the code encodes a decision or a
v1 defect. Do not narrate what the code does.

**Tests.** 79 passing. The RLS isolation test in `src/server/rls.test.ts` is
non-negotiable and **every new table gets a case in its `the clinical tables`
block.** Fixture helpers are in `src/test/supabase.ts`.

---

## M8 — exactly where it stands

### Written and working (uncommitted)

| File | What it is |
|---|---|
| `supabase/migrations/20260812023627_create_materials.sql` | `materials` table. Non-standard policies: read is shared-or-own, write is own-only. |
| `scripts/extract-materials.mjs` | Transcribes v1's 45 curated materials from `legacy/index.html` into plain text. Re-runnable. |
| `supabase/seeds/materials.generated.sql` | Its output. Wired into `supabase/config.toml`'s `sql_paths`. |
| `src/lib/material-areas.ts` | Areas and focuses per discipline, transcribed from `legacy/index.html:2099`. |
| `src/server/materials.ts` | CRUD + `bestMaterialFor`, the word-overlap matcher ported from v1. |
| `src/server/statistics.ts` | All the numbers, computed. Nothing stored. |
| `src/server/planning.ts` | Next 7 days of sessions, each with its lowest-progress goal and a matching material. |
| `src/server/digest.ts` | Fortnightly digest recipients, batched. **Defect #12.** |
| `src/app/api/digest/route.ts` | The cron route. `CRON_SECRET` compared with no `if (SECRET)` branch. |
| `vercel.json` | `{"crons":[{"path":"/api/digest","schedule":"0 11 1,15 * *"}]}` |
| `src/app/(app)/materiales/` | List, `nuevo`, `[id]`, `actions.ts`. |
| `src/app/(app)/estadisticas/page.tsx` | The statistics screen. |
| `src/app/(app)/planificacion/page.tsx` | The planner. |
| `src/components/materials/material-form.tsx`, `src/components/print-button.tsx` | Supporting components. |
| `eslint.config.mjs` | `src/server/digest.ts` added to `SERVICE_DB_ALLOWED` — **a cron run has no user session.** This was the deliberate fifth entry the rule is designed to force. |
| `src/components/app-shell/nav-items.ts` | Planificación, Materiales, Estadísticas, Reservas added. |

`lint` and `typecheck` are green on all of it. `db:reset` applies the migration
and seeds the 45 materials.

### Still to do for M8

1. **`src/server/digest.test.ts`** — no test exists yet. Should cover: a
   practitioner with nothing to report is skipped entirely (v1's best instinct,
   `if (!nRes && !atr.length) continue`); the batch is capped at
   `DIGEST_BATCH_SIZE`; the outstanding-balance arithmetic matches
   `monthlyLedger`.
2. **RLS coverage for `materials`** — add it to the `the clinical tables` list in
   `src/server/rls.test.ts`, plus two cases the other tables do not need: a
   practitioner **can** read a shared row (`practitioner_id is null`), and
   **cannot** insert one (the `with check` is what stops someone publishing to
   every user).
3. **The in-app assistant** ("Preguntale a Hilo", v1's `askHilo`). Not started.
   It is the last piece of M8 and the most cuttable thing in the whole plan.
   Shape: a route handler like the two existing AI ones — session, quota,
   pinned model, streamed — over the practitioner's own patients and goals.
4. **Browser verification** of `/materiales`, `/estadisticas`, `/planificacion`.
   Nothing has been looked at yet. Sign in at `/entrar` with
   `lucia@hilo.test` / `hilo-de-prueba`.
5. **Full check run and commit.**

### Known loose end

`src/server/materials.ts`'s `deleteMaterial` logs the audit action with entity
`'patient'` because the `Entity` union in `src/server/audit.ts` has no
`'material'` member. Add it to the union and fix the call.

---

## M9 — not started

From the plan: PWA manifest and install prompt, mobile polish, error states, the
terms and privacy pages, seed data for demos, production Supabase, custom
domain.

Two of those are already done and can be struck: **the terms and privacy pages**
exist (`src/app/(legal)/`, transcribed from v1) and **seed data** exists
(`supabase/seed.sql` — a practitioner, three patients with real curves, sessions,
schedules, payments, and now 45 materials).

What genuinely remains:

- `manifest.webmanifest` + icons + install prompt.
- An `error.tsx` and a `not-found.tsx`. There are none, so an unexpected throw
  currently shows the Next.js default.
- A mobile pass. The layouts are responsive and were written mobile-first, but
  no screen has been opened at 375px width. `resize_window` to the `mobile`
  preset and walk the nav.
- Production Supabase project, environment variables, custom domain — all
  outside the codebase.

---

## Good candidates for a subagent

Work that is self-contained enough to hand off with a pointer to one or two
files as the pattern to copy:

- **`src/server/digest.test.ts`** — pattern: `src/server/notifications.test.ts`
  (mocks Resend) and `src/server/goals.progress.test.ts` (real database via
  `src/test/supabase.ts`).
- **The `materials` RLS cases** — pattern: the existing blocks in
  `src/server/rls.test.ts`.
- **`error.tsx` / `not-found.tsx`** — pattern: any page under `src/app/(app)/`
  for the visual language; copy must be Rioplatense and must not blame the user.
- **The PWA manifest and icons** — self-contained, touches nothing else.
- **The mobile pass** — needs the browser, not the codebase's history.

Work that should **not** be delegated, because it depends on decisions recorded
across many files: anything touching the clinical prompts, the service-role
allowlist, RLS policy shapes, or the report/assessment flow.

---

## How to verify anything

```bash
./dx npm run db:reset      # migrations + seed, from scratch
./dx npm run lint
./dx npm run typecheck
./dx npm run test
./dx npm run check:rls
./dx npm run build
```

The dev server is already running on port 3000 in a container. Sign in as
`lucia@hilo.test` / `hilo-de-prueba`; the practitioner's booking slug is
`lucia-fernandez`.

There is **no real `ANTHROPIC_API_KEY`** in `.env.local`, so every AI generation
falls back to the offline draft. That is a useful default — it exercises the
fallback path on every run — but it means the streamed output has never been seen
working against the real model.
