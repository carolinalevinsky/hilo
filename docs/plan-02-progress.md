# Plan 02 — where the migration stands

**Companion to `docs/plan-02-migration.md`.** That file is the plan and does not
change. This one records what has actually been built, what is half-built, and
what a fresh session needs to know before touching any of it.

Last updated: 16 August 2026, M9 complete. The code is done.

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
| M8 — Materials, statistics, digest, assistant | **done** | `2599889` |
| M9 — Launch | **done, in code** | `b59144c` |

**All twelve defects in the plan's catalogue are retired**, #12 included: the
digest is batched, rotating, and tested.

Everything through M9 is committed, green on `lint` / `typecheck` / `test` /
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

10. **Check `git status` before every commit, and read what it says.** Twice
    during M8, `src/server/booking.ts` — 233 committed lines of M7 — was found
    replaced by a seven-line `export {}` stub in the working tree. Both times a
    second Claude Code session was running against this same checkout. The
    build is what caught it (`The module has no exports at all`); `git checkout
    HEAD -- src/server/booking.ts` is the fix. **Do not run two sessions in this
    directory at once.**

11. **Never `dangerouslySetInnerHTML`.** Reports, assessments and materials store
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

**Tests.** 127 passing. The RLS isolation test in `src/server/rls.test.ts` is
non-negotiable and **every new table gets a case in its `the clinical tables`
block.** Fixture helpers are in `src/test/supabase.ts`.

---

## M8 — what shipped

Three commits: `48a76f8` (materials, statistics, planning, digest), `7b07a07`
(the two missing tests, and the digest defects they exposed), `2599889` (the
assistant).

| File | What it is |
|---|---|
| `supabase/migrations/20260812023627_create_materials.sql` | `materials`. **The only non-standard policies in the schema**: read is shared-or-own, write is own-only. |
| `supabase/migrations/20260816190000_add_digest_sent_at.sql` | `practitioners.digest_sent_at`, so the digest batch rotates. |
| `supabase/migrations/20260816193000_create_assistant_questions.sql` | A row per question, so the assistant has a monthly quota to count. No question text — see the migration. |
| `scripts/extract-materials.mjs`, `supabase/seeds/materials.generated.sql` | v1's 45 curated materials, transcribed. Re-runnable, wired into `config.toml`. |
| `src/lib/material-areas.ts` | Areas and focuses per discipline (`legacy/index.html:2099`). |
| `src/lib/sse-client.ts` | The SSE reader, used by the report editor and the assistant. |
| `src/server/materials.ts` | CRUD + `bestMaterialFor`, v1's word-overlap matcher. |
| `src/server/statistics.ts` | All the numbers, computed. Nothing stored. |
| `src/server/planning.ts` | Next 7 days, each with its lowest-progress goal and a matching material. |
| `src/server/digest.ts` | **Defect #12.** Bounded, rotating, and it throws rather than reading a failed query as a quiet fortnight. |
| `src/server/assistant.ts` | "Preguntale a Hilo": context, prompt, and v1's offline `chatReply` kept as the fallback. |
| `src/app/api/digest/route.ts`, `vercel.json` | The cron, 11:00 on the 1st and the 15th. |
| `src/app/api/ai/asistente/route.ts` | Session, quota, pinned model, streamed — and the quota is *released* when the model produced nothing. |
| `src/app/(app)/materiales/`, `estadisticas/`, `planificacion/` | The three screens. |
| `src/components/assistant/ask-hilo.tsx` | The card on `/inicio`. |
| `eslint.config.mjs` | `src/server/digest.ts` is the fifth `SERVICE_DB_ALLOWED` entry — **a cron run has no user session.** |

Tests added: `digest.test.ts` (29), `assistant.test.ts` (13), the `materials`
block and the `assistant_questions` case in `rls.test.ts`. 127 passing.

### Decisions in here worth knowing before changing them

**The assistant sends the roster, not the session notes.** v1 sent the last
progress note of every patient on every question. The reports and assessments
still send notes, for one named patient, because the practitioner asked for a
document about that patient. `assistant.test.ts` asserts the shape of
`AssistantPatient` so that adding a note field means arguing with a test.

**The digest reports the month containing the day *before* the run.** The cron
fires on the 1st, when nobody has paid into the new month; reporting "this
month" told every practitioner that every patient owed them everything.

**The digest batch rotates by `digest_sent_at`.** A cap with no order is not a
queue — it drops the same practitioners every fortnight, silently.

**`materials` must not join the `the clinical tables` list in `rls.test.ts`.**
That test asserts an unfiltered read returns nothing; materials correctly
returns the 45 shared rows.

## M9 — what shipped

Commit `b59144c`. Two of the plan's items were already done and were struck:
the **terms and privacy pages** (`src/app/(legal)/`) and the **seed data**
(`supabase/seed.sql`).

| File | What it is |
|---|---|
| `src/app/manifest.ts` | The PWA manifest, `start_url: /inicio`. |
| `scripts/make-icons.py` | Draws the four icons and writes the PNG chunks by hand — there is no image tooling on this machine and Node is Docker-only. Re-runnable; it reads each file back and asserts the header. |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | The white rounded square on `#6c5ce7`, matching the sidebar mark. The maskable one sits at 0.34 of the canvas so a circle crop does not clip it. |
| `src/components/install-prompt.tsx` | Replays Chrome's `beforeinstallprompt`. Remembers a refusal. Renders nothing on iOS. |
| `src/app/not-found.tsx`, `error.tsx`, `global-error.tsx`, `(app)/error.tsx` | The screens that did not exist. |
| `src/components/error-screen.tsx` | Their shared body, so the two boundaries cannot drift apart. |
| `src/app/robots.ts` | Landing page and the two legal pages only. |
| `docs/launch.md` | Everything that happens in a dashboard rather than in the repo. |

### Decisions in here worth knowing before changing them

**No service worker.** The manifest plus HTTPS is enough for Chrome to offer the
install. An offline cache of clinical data is a decision about where patient
records may be stored, and it is not one to make as a side effect of "make it
installable".

**The error screens render nothing from the error except `digest`.** A thrown
Postgres error carries the failing row, which in this product means a patient's
name. `digest` stays because there is no error tracking wired and without it a
bug report is "no me anduvo".

**`(app)/error.tsx` exists separately from `error.tsx`** so a failure inside the
shell keeps the sidebar and the bottom bar. Verified at runtime by requesting a
patient whose id is not a UUID, which makes Postgres throw for real.

**The proxy matcher must keep excluding `robots.txt` and
`manifest.webmanifest`.** They are generated routes, so the file-extension rule
does not catch them, and without the exclusion a signed-out request for either
gets an HTML redirect to `/entrar` — the manifest one silently makes Hilo
uninstallable.

**`/reservar/<slug>` is disallowed in `robots.ts` on purpose.** Public by design
is not the same as wanting to be indexed.

### What is left, and it is not code

`docs/launch.md`, steps 1 to 8: the production Supabase project, Resend's
domain, a real `ANTHROPIC_API_KEY`, the Mercado Pago webhook, the nine
environment variables in Vercel, and the domain. All of it needs accounts and
credentials.

**The one real gap:** every AI path has only ever run with the key absent, so
the offline fallback is well exercised and the streamed output against the real
model has never been seen. That is step 3 of the launch doc and it should happen
before anyone is invited.

**Also never built:** the Playwright critical-path test from §8 of the migration
plan (sign-up → patient → session → report). Everything else in that testing
table exists. It was not part of M9's scope and is the honest remaining gap in
the test strategy.

---

## Good candidates for a subagent

Work that is self-contained enough to hand off with a pointer to one or two
files as the pattern to copy:

Four were delegated across M8 and M9 and all four came back clean:
`digest.test.ts`, the `materials` RLS cases, the PWA manifest and icons, and the
error screens. Every one of those agents also surfaced something real in the
code around it — which is the argument for delegating work with a hard file
boundary and a verification command, rather than delegating whole features.

What made them work: an explicit list of files they were allowed to touch, the
name of an existing file to copy the shape from, and a command whose output they
had to paste back. What did not work: expecting them to notice that another
session was editing the same checkout — two of them reported it, neither could
do anything about it.

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
falls back to the offline draft and every assistant answer to `offlineAnswer`.
That is a useful default — it exercises the fallback path on every run — but it
means the streamed output has never been seen working against the real model.
**That is the single biggest untested thing in the project.** Before launch, set
a key and drive one report, one assessment analysis, and one assistant question
end to end.
