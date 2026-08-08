# Hilo

Hilo is a tool for health and education professionals in Uruguay —
speech therapy, psychopedagogy, occupational therapy, psychology,
psychomotricity and kinesiology. They use it to keep patient records, plan
sessions, track therapeutic goals, write clinical reports, and get paid.

The data in this application is clinical. It is protected by Uruguayan law
(Ley N.º 18.331). Assume every mistake about who can read what is serious.

---

## Stack

| What | Choice |
|---|---|
| Framework | Next.js 16, App Router |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (copied into `src/components/ui/`, not a dependency) |
| Database, auth, storage | Supabase (Postgres) |
| AI | Anthropic API, `claude-opus-5` |
| Email | Resend |
| Hosting | Vercel |

---

## Language rule

**Code is English. The product is Spanish.**

English: file names, variables, functions, database columns, comments, commit
messages, and these docs.

Rioplatense Spanish (Uruguay): everything a user reads — buttons, labels, hints,
empty states, error messages, emails, and the AI prompts.

```tsx
// Good
export async function createPatient(practitionerId: string, input: unknown) { … }
<Button>Guardar paciente</Button>

// Bad
export async function crearPaciente(…) { … }
<Button>Save patient</Button>
```

Use `vos`, not `tú`: "Podés agregar un paciente", not "Puedes agregar un
paciente".

---

## Architecture

Three layers, and the boundaries between them are enforced by lint rules, not by
good intentions.

```
src/app/          Pages and Server Actions. Thin. No business logic.
src/components/   UI. Presentational.
src/server/       THE BACKEND. All business logic and every database query.
src/lib/          Dumb shared helpers — dates, formatting, env, generated types.
```

### `src/server/` is the backend

It is plain TypeScript. It does not import from `next/*`, so it could be lifted
into a separate service later without rewriting anything. The single exception
is `src/server/db.ts`, which owns the session cookie — that is the seam.

One file per business concept. No `repositories/`, no `services/`, no
interfaces, no dependency injection, no mappers. A function reads the database
and applies its rule in the same place. The generated database types already
describe the rows, so there is nothing to map between.

A file earns a split when it passes ~200 lines or mixes three concerns.
`reports.ts` and `payments.ts` are the two expected to get there. Split them
then, not before.

### How to add a feature

Two files. That is the whole pattern.

**1. The logic, in `src/server/`:**

```ts
// src/server/patients.ts
import { z } from 'zod'
import { getDb } from './db'

export const NewPatient = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().date(),
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

**2. The Server Action, in `src/app/`:**

```ts
// src/app/patients/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/server/auth'
import { createPatient } from '@/server/patients'

export async function createPatientAction(formData: FormData) {
  const user = await requireUser()
  await createPatient(user.id, Object.fromEntries(formData))
  revalidatePath('/patients')
}
```

Note `practitionerId` is always an explicit argument. It is never read from a
cookie inside a `src/server/` function. That is what makes the function testable
with any id and reusable outside a web request.

Reads happen in Server Components, straight from `src/server/`. Writes happen in
Server Actions. Neither needs an API route — add a route handler only when
something outside the app calls in (a webhook, a cron, a public form).

---

## How to change the database

Always in this order:

```bash
npm run db:start                                 # once per session (needs Docker)
npx supabase migration new add_patients_table    # creates an empty .sql file
# write the SQL in supabase/migrations/<timestamp>_add_patients_table.sql
npm run db:reset                                 # replays every migration
npm run db:types                                 # regenerates TypeScript types
```

**Never change the schema in the Supabase dashboard.** A change made there
exists in production and nowhere else. The next `db:reset` silently destroys it,
and the types stop matching reality.

**Never edit a migration that has already run in production.** Write a new one
that corrects it. Editing an applied migration produces a database whose real
state does not match its recorded history, and nothing detects that until
something breaks strangely.

`src/lib/database.types.ts` is generated. Never edit it by hand. It is the
reason there is no mapper layer: change the SQL, regenerate, and the compiler
points at every place that must change.

### Every new table needs these two things

```sql
alter table patients enable row level security;

create policy "own_rows" on patients
  for all
  using (practitioner_id = (select auth.uid()))
  with check (practitioner_id = (select auth.uid()));
```

Every table carries `practitioner_id` — even child tables that could reach it
through a join. That denormalisation is deliberate: it makes every policy
identical and one line long.

The `(select auth.uid())` wrapper is not stylistic. Postgres evaluates a
subquery once per query and a bare `auth.uid()` once per row.

`npm run check:rls` fails the build if any table is missing either piece.

---

## Security invariants

**The service-role key bypasses Row Level Security completely.** It is used in
exactly four places:

1. `src/server/mercadopago.ts` — reading a practitioner's MP access token
2. `src/server/mercadopago.ts` — the payment webhook
3. `src/server/booking.ts` — inserting a public booking request
4. `src/server/audit.ts` — writing the audit log

Everywhere else uses `getDb()`, which carries the user's session. A lint rule
enforces this; a fifth place requires editing the allowlist in
`eslint.config.mjs`.

**`NEXT_PUBLIC_` is not a naming style.** It is the switch that puts a value
into the JavaScript bundle every visitor downloads. Never put it on a key,
secret, token, or password. `npm run check:secrets` fails the build if you do.

**All environment variables are read through `src/lib/env.ts`**, which validates
them at startup. Never read `process.env` directly, and never write a fallback
chain like `process.env.A || process.env.B`.

---

## Never do this

Each of these happened in v1. The file references point into `legacy/`.

| Never | Why | Where it happened |
|---|---|---|
| Read data with `@supabase/*` from a component | This is how v1 leaked a Mercado Pago access token to the browser | `legacy/index.html:2477` |
| Enforce a plan limit in the browser | Anyone can edit browser code. Limits are checked on the server, before the expensive call | `legacy/index.html:2775` |
| Build HTML by string concatenation | Manual escaping fails eventually. React escapes by default | throughout `legacy/index.html` |
| Store patient data in a JSON blob column | v1 overwrote the whole patient row on every save, so two open tabs lost data | `legacy/index.html:3069` |
| Choose the AI model at runtime | v1 asked the account for a model list and took the first match. The quality of a signed clinical report depended on what that list returned that day | `legacy/api/ia.js:33-52` |
| Write `if (SECRET) { check }` | If the variable is unset, the check disappears and the endpoint is open. A guard conditional on its own configuration is not a guard | `legacy/api/aviso-reserva.js:22` |
| Read an env var with fallback names | A typo in all of them resolves to `undefined` in silence and fails weeks later | `legacy/api/resumen.js:12` |
| Put clinical content in an email | An email is an uncontrolled copy of clinical data living in a third-party inbox forever. Send counts and a link | `legacy/api/resumen.js:65` |
| Leave an endpoint unauthenticated | v1's `/api/ia` had no auth at all — anyone could drain the Anthropic key | `legacy/api/ia.js:71` |

---

## AI

The model is pinned in `src/server/ai.ts`:

```ts
const MODEL = 'claude-opus-5'
```

Never resolve it at runtime. Changing it is a deliberate one-line edit followed
by a review of saved reports.

Notes specific to this model:

- **Thinking is on by default.** `max_tokens` caps thinking *plus* response text
  together, so it needs headroom above the report length.
- **Stream anything above ~16,000 `max_tokens`.** Report generation is the
  request most likely to hit a serverless timeout, and streaming also lets the
  practitioner watch the report being written instead of staring at a spinner.
- **Handle `stop_reason: 'refusal'` before reading `content`.** A declined
  request still returns HTTP 200, with empty or partial content. Code that reads
  `content[0].text` unconditionally will crash.
- **Do not add "double-check your work" instructions.** This model self-verifies;
  telling it to verify causes redundant work. This is the opposite of the usual
  advice.
- **Cache the clinical instruction block.** It is identical on every request.

Every AI endpoint checks the session and the monthly quota *before* calling
Anthropic.

The clinical prompt in `legacy/api/ia.js` lines 6–24 is good and was carefully
written. Port it as-is. Its rules — never invent results, interpret scores
rather than repeat them, no closed diagnoses, the professional signs — are
clinical requirements, not style preferences.

---

## Commands

```bash
npm run dev               # local dev server
npm run build             # production build
npm run lint              # the three architectural rules
npm run typecheck         # tsc --noEmit
npm run test              # unit tests, including the RLS isolation test

npm run db:start          # start local Postgres (needs Docker)
npm run db:reset          # replay all migrations from scratch
npm run db:types          # regenerate src/lib/database.types.ts

npm run check:boundaries  # proves the three lint rules actually fire
npm run check:secrets     # no secrets exposed to the browser
npm run check:rls         # every table has RLS and a policy
npm run check:migration   # destructive SQL must be declared
```

All of these run in CI on every push. CI is the only gate on this project —
there is no human reviewer — so a red check is a real stop, not a formality.

---

## When something breaks

The first move is always in `docs/when-things-break.md`. The short version:
**if production is broken, roll back in Vercel first, then investigate.** Nobody
diagnoses well with the site down.

---

## `legacy/` is reference, not code

`legacy/` holds the v1 prototype: one 343 KB `index.html` and four serverless
functions. It is frozen.

Read it for: colours, Spanish copy, the clinical AI prompts, the email
templates, and domain knowledge about which assessment instruments belong to
which discipline.

Never import from it, never run it, and never treat its patterns as this
project's. Its twelve known defects are catalogued in
`docs/plan-02-migration.md`.
