# Plan 01 — Workspace & Standards

**Goal:** turn this repo into a workspace where a non-engineer can ask Claude for features and get code that is consistent, type-safe, and safe to deploy.

**Scope:** repository scaffolding, architectural guardrails, tooling, CI, and the skill set. **No product features.** Feature work is Plan 02.

**Prerequisite:** none. This plan can run start to finish before Plan 02 begins.

---

## 0. Principles

Four rules decide every choice in this plan. When something here seems arbitrary, it comes from one of these.

1. **Business logic never imports the framework.** Everything in `src/server/` is plain TypeScript. Next is one transport in front of it, not its home.
2. **A convention that relies on memory is not a convention.** Every rule that matters is enforced by a lint rule or a CI check. Everything else is a suggestion.
3. **Flat until it earns depth.** No layer, interface, or abstraction exists until a concrete problem demands it. We split a file when it gets hard to read, not preemptively.
4. **Code in English, product in Spanish.** Identifiers, comments, commits, and docs are English. UI copy, user-facing errors, and AI prompts are Rioplatense Spanish.

---

## 1. Repository layout

```
hilo/
├── CLAUDE.md                  project rules, loaded into every Claude session
├── .claude/
│   └── skills/                project-specific skills (section 8)
├── docs/
│   ├── plan-01-workspace.md   this file
│   └── plan-02-migration.md
├── .github/
│   └── workflows/ci.yml
├── src/
│   ├── app/                   Next.js: routes, pages, server actions
│   ├── components/            UI (shadcn/ui + our own)
│   ├── server/                THE BACKEND. Plain TypeScript. No next/* imports.
│   └── lib/                   dumb shared helpers (dates, formatting)
├── supabase/
│   ├── migrations/            versioned SQL — the only source of schema truth
│   └── config.toml
├── legacy/                    the v1 prototype, frozen
│   ├── README.md              "reference only, not maintained"
│   ├── index.html
│   ├── api/                   ia.js, mp-pago.js, aviso-reserva.js, resumen.js
│   ├── package.json
│   └── vercel.json
├── eslint.config.mjs
├── package.json
└── tsconfig.json
```

The new app **is** the repository root. `legacy/` is reference material, not a sibling project.

This is a deliberate choice against nesting v2 under a `hilo-v2/` prefix, and the reasoning is worth recording because the alternative looks tempting. A prefix would buy exactly one thing: keeping the v1 deployment alive while v2 is built. **v1 has no users and no real data** — it is a prototype with test rows — so that is worth very little. What the prefix costs is permanent and paid by the person least able to absorb it: remembering to `cd` before opening Claude, two Vercel projects to keep straight, two `CLAUDE.md` files, `working-directory` in CI, and "which app is broken?" as the first question in every incident.

With the app at the root, everything behaves the way every tutorial, every generator default, and every Claude session already expects. Nothing is lost either: `legacy/` keeps every file, and the `v1-prototype` tag makes v1 redeployable in minutes if it is ever wanted back.

---

## Phase 1 — Preserve v1

Nothing is deleted. The prototype is the source of truth for visual design, Spanish copy, the clinical AI prompts, and the email templates — all of which are good and expensive to recreate.

```bash
git checkout -b rewrite
git tag v1-prototype                 # recoverable from history forever
mkdir -p legacy
git mv index.html legacy/
git mv api legacy/api
git mv package.json legacy/package.json
git mv vercel.json legacy/vercel.json
```

**Do not forget `vercel.json`.** It is newer than the rest of v1 and easy to miss. Leaving it at the root would keep a Vercel cron firing at `/api/resumen`, which no longer exists — a scheduled 404 twice a month, and a confusing one to diagnose because nothing in `src/` mentions it. Moved into `legacy/`, it is inert: Vercel only reads a `vercel.json` at the root.

Write `legacy/README.md`:

> This is the Hilo v1 prototype — a single 343 KB `index.html` plus four Vercel
> serverless functions. **It is frozen and unmaintained.** It is kept as a
> reference for visual design, Spanish product copy, the clinical AI prompts,
> and the email templates, all of which carry over to v2. Do not import from it,
> do not run it as part of the app, and do not treat anything in it as current
> architecture. The known defects it contains are catalogued in
> `docs/plan-02-migration.md`.

That README is not decoration. Without it, a future Claude session reads `legacy/index.html` and treats it as live code.

### Two pieces of v1 infrastructure that outlive the folder

Both live in dashboards, not in git, so nothing here reminds anyone they exist:

- **The Supabase Database Webhook** on `reservas` that calls `/api/aviso-reserva`. Delete it — it now points at nothing. v2 does not replace it with another webhook; the booking route handler sends the email itself (Plan 02, section 6).
- **v1's Vercel environment variables** (`RESEND_API_KEY`, `SB_SERVICE_KEY`, `HILO_WEBHOOK_SECRET`, `CRON_SECRET`, `ANTHROPIC_API_KEY`). Copy the values somewhere before touching the project — v2 needs most of them in Phase 10, and a Resend key is easier to copy than to reissue.

**Done when:** `legacy/` holds the untouched v1, the `v1-prototype` tag exists, the repo root is otherwise empty of app files, and the Supabase webhook is deleted.

---

## Phase 2 — Scaffold

Use the official generator. Do not hand-build directories — the generator produces a `tsconfig.json`, ESLint config, and PostCSS setup that are correct and that we would get subtly wrong by hand.

```bash
npx create-next-app@latest . \
  --typescript --tailwind --eslint --app \
  --src-dir --import-alias "@/*"
```

Prompts vary by version; the flags above cover the load-bearing choices. Accept Turbopack if offered.

This runs *after* Phase 1 has cleared the root, so there is no `package.json` for it to collide with.

Then the UI kit:

```bash
npx shadcn@latest init
```

shadcn copies components into `src/components/ui/` rather than installing a dependency. That is the point: everything is editable, nothing is a black box, and there is no upgrade treadmill.

**Done when:** `npm run dev` serves the default page and `npm run build` passes.

---

## Phase 3 — Backend structure

Create the backend as a flat set of files, one per business concept:

```
src/server/
├── db.ts              Supabase client factories (user-scoped + service-role)
├── auth.ts            requireUser() — resolves the session, returns userId
├── practitioners.ts
├── patients.ts
├── goals.ts
├── sessions.ts
├── appointments.ts
├── assessments.ts
├── reports.ts
├── payments.ts
├── ai.ts              Anthropic client + prompt assembly
├── notifications.ts   transactional email (Resend)
└── mercadopago.ts
```

**No `repositories/`, no `domain/`, no interfaces, no dependency injection, no mappers.** A function reads the database and applies its rule in the same place. Types come from the Supabase schema (Phase 5), so there is nothing to map.

Each file follows one shape:

```ts
// src/server/patients.ts
import { z } from 'zod'
import { getDb } from './db'

export const NewPatient = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().date(),
  referralReason: z.string().optional(),
})

export async function createPatient(practitionerId: string, input: unknown) {
  const data = NewPatient.parse(input)
  const db = await getDb()
  const { data: row, error } = await db
    .from('patients')
    .insert({ ...data, practitioner_id: practitionerId })
    .select()
    .single()
  if (error) throw error
  return row
}
```

Note `practitionerId` is an explicit parameter. It is never read from a request, a cookie, or a global. That single choice is what keeps `src/server/` callable from a route handler today and from a worker or a Fastify service later.

**A file earns a split when it exceeds ~200 lines or mixes three concerns.** The two expected candidates are `reports.ts` (AI orchestration + clinical rules + persistence + PDF) and `payments.ts` (Mercado Pago + webhook + reconciliation). Split them then, not now.

**Done when:** the directory exists with stub files and `tsc --noEmit` passes.

---

## Phase 4 — Guardrails

Three lint rules. Each targets a failure that already happened in v1 or is near-certain. Nothing decorative.

**There is no human reviewer on this project.** Every rule below exists because it replaces a check a reviewer would otherwise perform. That is also why the third rule exists at all — with a reviewer, "use the service-role client sparingly" could be a convention. Without one, it has to be mechanical.

In `eslint.config.mjs`:

```js
{
  files: ['src/server/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['next', 'next/*'],
        message:
          'src/server/ is framework-agnostic. Pass what you need as an argument ' +
          '(e.g. userId) instead of reading it from the request.',
      }],
    }],
  },
},
{
  files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@supabase/*'],
        message:
          'Data access goes through src/server/. Direct client access is how v1 ' +
          'leaked a Mercado Pago token to the browser.',
      }],
    }],
  },
},
```

Rule 3 — the service-role client is confined to the files that legitimately need it:

```js
{
  files: ['src/**/*.ts'],
  ignores: [
    'src/server/db.ts',
    'src/server/mercadopago.ts',
    'src/server/booking.ts',
    'src/server/audit.ts',
  ],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{
        name: '@/server/db',
        importNames: ['getServiceDb'],
        message:
          'The service-role client bypasses RLS entirely. It belongs in exactly four ' +
          'places (MP token read, MP webhook, public booking insert, audit log). ' +
          'If you need a fifth, add it to the allowlist in eslint.config.mjs and write ' +
          'down why in the commit message.',
      }],
    }],
  },
},
```

**Rule 1** keeps the backend portable. **Rule 2** makes it structurally impossible to repeat the worst v1 bug: `index.html:2477` read the practitioner's Mercado Pago access token straight from the browser. **Rule 3** stops RLS-bypassing access from spreading quietly — the allowlist is short enough that adding to it is a visible, deliberate act rather than an ordinary import.

`src/middleware.ts` is deliberately outside rule 2's glob — it needs `@supabase/ssr` to refresh the auth cookie, and it is the only file that does.

Also set in `tsconfig.json`:

```json
{ "strict": true, "noUncheckedIndexedAccess": true }
```

**Done when:** a deliberate `import { cookies } from 'next/headers'` inside `src/server/` fails `npm run lint`.

---

## Phase 5 — Database tooling

### First: v2 gets a fresh Supabase project

**Do not reuse v1's Supabase project** (`uepyfqibtocrekvnliyk`). Create a new one.

Reusing it would mean starting with `pacientes`, `profesionales`, `reservas`, and `mp_cuentas` already sitting in `public` — tables that were created by hand in the dashboard, that no migration file describes, and that v2 will never touch. Two consequences:

- **`check:rls` (Phase 9) breaks permanently.** It asserts that *every* table in `public` has RLS enabled and at least one policy. v1's hand-made tables would fail it forever, and the only way to get a green build would be to add exceptions — which turns the check into a list of things it is allowed to miss.
- **The schema stops being reproducible.** The whole point of Phase 5 is that `supabase db reset` rebuilds the database from migration files. Tables that exist only in production and in no migration break that guarantee on day one.

Dropping them by hand instead is possible, but a new project is free, takes two minutes, and cannot go wrong. v1's project stays as it is — there is nothing in it worth protecting and no reason to touch it.

### Then the local loop

```bash
npm i -D supabase
npx supabase init
npx supabase start          # local Postgres in Docker
```

Working loop, to be repeated for every schema change:

```bash
npx supabase migration new add_patients_table
# edit supabase/migrations/<timestamp>_add_patients_table.sql
npx supabase db reset       # replay all migrations from scratch
npm run db:types            # regenerate TypeScript types
```

Add to `package.json`:

```json
"db:types": "supabase gen types typescript --local > src/lib/database.types.ts"
```

**`src/lib/database.types.ts` is generated. Never edit it by hand.** It is the reason we need no mapper layer: change the SQL, regenerate, and the compiler shows every place that must change.

**Hard rule for `CLAUDE.md`:** schema changes happen in a migration file, never in the Supabase dashboard. A change made in the dashboard exists in production and nowhere else, and the next `db reset` silently destroys it.

**Done when:** `supabase db reset && npm run db:types` runs clean and produces a types file.

---

## Phase 6 — Design tokens

The v1 CSS holds a real palette and type scale that a marketer chose deliberately. Port it rather than accepting Tailwind defaults.

1. Read the `<style>` block in `legacy/index.html` (lines 27–497).
2. Extract the custom properties: `--violet`, `--teal`, `--coral`, `--blue`, `--amber`, `--green`, their `-s` soft variants, plus `--muted` and `--line`.
3. Define them as CSS variables in `src/app/globals.css` and map them into the Tailwind theme so they are available as `bg-violet`, `text-muted`, etc.
4. Keep Inter as the typeface — it is already the v1 choice.

**Done when:** a component using `bg-violet-soft text-violet` renders in the v1 colours.

---

## Phase 7 — CLAUDE.md

The single most important file in this plan. It is loaded into every Claude session and is what makes the difference between "Claude wrote something plausible" and "Claude wrote something that fits this codebase."

Required sections:

- **Stack** — Next.js App Router, TypeScript, Tailwind, shadcn/ui, Supabase, Vercel.
- **Language rule** — code in English, product in Spanish (Rioplatense). With examples of both.
- **Architecture** — `src/server/` is the backend and does not import `next/*`; `src/app/` is thin; reads go through Server Components, writes through Server Actions.
- **How to add a feature** — the two-file pattern from Phase 3, with a real example from this codebase.
- **How to change the schema** — migration file, `db reset`, `db:types`. Never the dashboard.
- **Security invariants** — service-role client is used in exactly four places (MP token read, MP webhook, public booking insert, audit log). Every other query uses the user's session. RLS stays on. Secrets never carry the `NEXT_PUBLIC_` prefix.
- **Never do this** — a short list drawn from real v1 defects:
  - Never read data with `@supabase/*` from a component.
  - Never enforce a plan limit in the browser.
  - Never build HTML by string concatenation.
  - Never store patient data in a JSON blob column.
  - Never resolve the AI model at runtime — the model ID is pinned in code.
  - Never write `if (SECRET) { check }`. If the secret is missing, the endpoint must fail, not open. (v1: `api/aviso-reserva.js:22`, `api/resumen.js:27`.)
  - Never read an environment variable with a chain of fallback names. One name, and it throws at startup if absent.
- **Commands** — `dev`, `build`, `lint`, `typecheck`, `test`, `db:reset`, `db:types`.
- **`legacy/` is reference, not code** — read it for copy, colours, and prompts. Never import from it, never run it, never treat its patterns as this project's.

Write it for a reader who does not program. Short sentences, concrete examples, no jargon that is not defined on the spot.

**Done when:** `CLAUDE.md` exists and each "never do this" entry traces to a specific v1 defect.

---

## Phase 8 — Skills

Two categories, and the split matters: generic skills are maintained by people whose full-time job is maintaining them, and hand-writing our own versions would be strictly worse.

### 8a. Install (do not write these)

```bash
# Postgres, RLS, indexing, schema design — maintained by Supabase
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices

# Supabase surface: Auth, SSR, Storage, CLI, Edge Functions
npx skills add supabase/agent-skills --skill supabase

# 64 React/Next performance rules — maintained by Vercel Engineering
npx skills add https://github.com/vercel-labs/next-skills --skill react-best-practices

# Lets Claude find and install a skill when it hits a gap
npx skills add https://github.com/vercel-labs/skills --skill find-skills
```

Worth adding when tests begin: `webapp-testing` (Anthropic) and `test-driven-development` (Obra).

### 8b. Write (project-specific, ~40 lines each)

| Skill | Purpose |
|---|---|
| `add-feature` | The two-file pattern: function in `src/server/`, thin Server Action, `revalidatePath`. With a real example from this repo. |
| `add-table` | Migration + the one-line RLS policy + `db reset` + `db:types`, in that order. |
| `clinical-ai` | How to modify clinical prompts without breaking the Ley 18.331 constraints and the tone rules v1 already got right. |
| `add-screen` | Route + Server Component that reads via `src/server/` + shadcn layout conventions. |

Keep each one short and concrete. A skill that restates general good practice is noise; a skill that shows the exact shape of *this* codebase is signal.

**Done when:** the four external skills are installed and the four project skills exist.

---

## Phase 9 — CI: the only gate

**Decision: no human review. She merges alone.**

This is the decision that shapes everything in this phase. With a reviewer, CI catches the mechanical problems and a person catches the judgement ones. Without a reviewer, anything a person would have caught either becomes an automated check or it does not get caught at all.

So CI here is stricter than a normal project's, on purpose.

`.github/workflows/ci.yml`, on every push and PR:

```yaml
- npm ci
- npm run lint            # the three boundary rules
- npm run typecheck       # tsc --noEmit, strict
- npm run test            # unit + the RLS isolation test
- npm run check:secrets   # no NEXT_PUBLIC_ on secret-shaped names
- npm run check:rls       # every table has RLS on and at least one policy
- npm run check:migration # destructive SQL needs an explicit marker
- npm run build
```

No `paths:` filter. A filtered workflow *skips* rather than fails, and in branch protection a skipped required check is indistinguishable from a passing one.

The last three commands are project-specific and are worth writing because each replaces a judgement call a reviewer would have made.

### `check:secrets`

Greps the repo for `NEXT_PUBLIC_` prefixed on anything matching `KEY|SECRET|TOKEN|PASSWORD`, minus a small allowlist (`NEXT_PUBLIC_SUPABASE_ANON_KEY` is genuinely public). Fails the build on a hit.

One misplaced prefix ships a secret to every browser that loads the site. It is a single-character-class mistake with an unbounded blast radius, and it is trivially detectable.

### `check:rls`

Against the local database, asserts that every table in the `public` schema has `rowsecurity = true` and at least one policy:

```sql
select c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and (not c.relrowsecurity
       or not exists (select 1 from pg_policy p where p.polrelid = c.oid));
```

Any row returned fails the build. A new table without RLS is the single most likely way clinical records leak between practitioners, and it happens by omission — exactly the kind of mistake a reviewer is meant to catch and a check catches better.

### `check:migration`

Scans new files in `supabase/migrations/` for `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, or `DELETE FROM` without a `WHERE`. Any hit fails unless the file contains the literal line:

```sql
-- destructive: intentional
```

This does not prevent destructive migrations. It prevents *accidental* ones — the case where a request like "clean up the patients table" produces a `DROP COLUMN` and it sails through because nothing objected. Forcing that comment turns an invisible action into a deliberate one.

### Pre-commit hook

husky + lint-staged running lint and typecheck on staged files. Seconds instead of minutes, and it means CI mostly confirms rather than discovers.

### Branch protection on `main`

- Require all CI checks green.
- Require branches be up to date before merging.
- **No required reviewers.**
- Disallow force-push and deletion.

**Done when:** a PR with a type error, a missing RLS policy, a mis-prefixed secret, or an unmarked `DROP COLUMN` is each blocked by CI.

---

## Phase 10 — Deployment

### The Vercel project

The existing Vercel project stays; it simply starts building a Next.js app instead of serving a static file. Root directory: the repository root — no configuration needed, which is why the app is not nested.

The first deploy after Phase 1 will look alarming for a moment: Vercel detects the framework change and the old `/api/*` functions disappear. That is correct. Nothing depends on them any more — the Supabase webhook that did was deleted in Phase 1.

### Environment variables

Several of these already exist on the project from v1 and can be reused. `RESEND_API_KEY` in particular is worth copying rather than reissuing.

| Variable | Exposure | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | v2's new project — not v1's |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | safe — RLS is what protects the data |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | bypasses RLS entirely |
| `ANTHROPIC_API_KEY` | **server only** | |
| `MP_WEBHOOK_SECRET` | **server only** | |
| `RESEND_API_KEY` | **server only** | transactional email |
| `MAIL_FROM` | server | e.g. `Hilo <avisos@hilo.uy>` |
| `CRON_SECRET` | **server only** | set by Vercel; the digest route must reject calls without it |

The `NEXT_PUBLIC_` prefix is not a naming style — it is the switch that puts a value into the JavaScript bundle the browser downloads. This distinction belongs in `CLAUDE.md` in exactly these words.

### One name per variable, validated at startup

v1 ended up reading `process.env.SB_SERVICE_KEY || process.env.Superbase_service_role || process.env.SUPABASE_SERVICE_ROLE`, because nobody was sure which name was actually set in Vercel. The chain does not fix the uncertainty — it hides it. A typo in all three resolves to `undefined`, and the failure surfaces later, somewhere unrelated.

v2 reads every variable through one file:

```ts
// src/lib/env.ts
import { z } from 'zod'

export const env = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  MP_WEBHOOK_SECRET: z.string().min(1),
}).parse(process.env)
```

A missing variable now fails the build with the variable's name in the message, instead of failing a cron job at 11:00 on the first of the month.

### Previews

Confirm preview deployments are on for every branch. This is the safety net that lets a non-engineer request changes without risk: every change gets a URL to look at before it reaches production.

**Done when:** a push to a branch produces a working preview URL.

---

## Phase 11 — Recovery

CI stops bad code from merging. It does nothing about bad code that merged anyway, or a schema change that was valid SQL and still the wrong idea. With no reviewer, the ability to undo is not a nice-to-have — it is the other half of the safety model.

### Instant rollback

Vercel keeps every previous deployment and can promote one back to production in a click. This is the first move whenever production breaks: **restore it, then debug.** Nobody diagnoses well under pressure with the site down.

Write it into `CLAUDE.md` as the literal first step of the runbook, with the URL of the deployments page.

### Database backups

Vercel rollback reverts code, not data. A migration that dropped a column stays dropped.

- Enable daily backups on the Supabase project.
- On any paid tier, enable point-in-time recovery. For clinical records under Ley 18.331, the cost is not the interesting variable.
- Restore the backup into a *new* project first, verify it, then swap. Never restore over a live database while trying to fix it.

### Migrations are forward-only

Never edit a migration that has run in production. Write a new one that corrects it.

Editing an applied migration produces a database whose real state does not match its recorded history — and every later `db reset` diverges from production in a way nothing detects until something breaks strangely. This belongs in `CLAUDE.md` as a hard rule.

### The runbook

A short `docs/when-things-break.md`, written for someone who does not program:

| Symptom | First move |
| --- | --- |
| The site is down or badly broken | Roll back in Vercel. Then investigate. |
| A change looks wrong but the site works | Revert the commit, push. CI redeploys. |
| Data looks wrong or missing | **Change nothing.** Restore a backup into a new project and compare. |
| CI is red and the message is unclear | Paste the whole failure into Claude. The checks are written to explain themselves. |
| Something is on fire and none of this fits | Call Tomás. |

Four rows and an escape hatch. The value is that when something breaks she has a first move that is written down, instead of improvising while stressed.

**Done when:** a rollback has been performed once as a drill, backups are on, and the runbook exists.

---

## Definition of done

- [ ] `legacy/` holds the frozen v1 — including `vercel.json` — with its README; `v1-prototype` tag exists
- [ ] The Supabase Database Webhook on `reservas` is deleted; v1's env var values are saved somewhere
- [ ] `npm run dev` and `npm run build` both work
- [ ] v2 runs on a **fresh** Supabase project, not v1's
- [ ] `src/server/` exists, flat, with the three lint rules enforcing its boundaries
- [ ] A deliberate boundary violation fails `npm run lint`
- [ ] `supabase db reset && npm run db:types` runs clean
- [ ] v1 colours available as Tailwind tokens
- [ ] `CLAUDE.md` written, in plain language, with "never do this" tied to real defects
- [ ] 4 external skills installed, 4 project skills written
- [ ] CI blocks each of: type error, missing RLS policy, mis-prefixed secret, unmarked `DROP COLUMN`
- [ ] Pre-commit hook runs; `main` protected, no required reviewers
- [ ] Preview deployments produce a URL per branch
- [ ] Every env var read through `src/lib/env.ts` — no fallback chains
- [ ] Backups on, one rollback drill performed, runbook written

---

## The bet this plan makes

She merges alone. There is no reviewer, and the plan does not pretend otherwise or try to smuggle one in.

That is a real constraint, and it moves the safety somewhere else. Instead of a person reading diffs, the project relies on four things:

1. **Structural impossibility.** The worst v1 bugs cannot recur — not because someone would notice, but because the import fails to lint. Data access cannot reach the browser. RLS-bypassing access cannot spread past four files.
2. **Checks that replace judgement calls.** RLS coverage, secret prefixes, and destructive migrations are the three things a reviewer would actually have caught. All three are now automated, and all three explain themselves when they fail.
3. **Preview URLs.** She reviews her own work by looking at it running, which for someone from marketing is a far better review than reading a diff would be.
4. **Cheap undo.** Rollback and backups mean a mistake that gets through costs minutes, not a weekend.

The honest limitation: none of this catches a *design* mistake. Code that is well-typed, passes every check, and solves the wrong problem will ship. That is the cost of no reviewer, and it is not one more lint rule away.

The mitigation is not a gate — it is that `CLAUDE.md` and the four project skills are good enough that the default output is already shaped correctly. That is why Phases 7 and 8 deserve real time and are not paperwork. On this project they are the design review.
