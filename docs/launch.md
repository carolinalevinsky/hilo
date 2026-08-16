# Poner Hilo en producción

Everything in this file happens **outside the repository**, in the Supabase,
Vercel, Resend and Mercado Pago dashboards. The code is finished; this is the
list of things that only exist once and that nobody remembers a year later.

Work through it in order. Steps 1 to 4 can be done days ahead; step 8 is the one
that makes Hilo live.

---

## 1. The Supabase project

Create a project in the **South America (São Paulo)** region — it is the closest
one to Uruguay and the round trip shows up on every page load.

Write down, from *Project Settings → API*:

| Value | Goes into |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` secret key | `SUPABASE_SERVICE_ROLE_KEY` |

The `service_role` key **bypasses Row Level Security completely**. It goes in
Vercel's environment variables and nowhere else — never in a file, never in a
message, never with the `NEXT_PUBLIC_` prefix. If it ever leaks, rotate it in
*Project Settings → API → Reset* before doing anything else.

### Run the migrations

```bash
./dx npx supabase link --project-ref <the project ref>
./dx npx supabase db push
```

`db push` replays `supabase/migrations/` in order against production. Seeding is
opt-in (`--include-seed`), so **do not pass that flag**: `supabase/config.toml`
points it at `seed.sql`, which creates a fake practitioner and three fake
patients for local demos and must never exist in production.

### Seed the shared materials

The 45 curated materials are the one thing production *does* need from the seeds
directory — the rows with a NULL `practitioner_id`. Load that file on its own,
not through `db push`:

```bash
psql "<the connection string>" -f supabase/seeds/materials.generated.sql
```

Check it took: `select count(*) from materials where practitioner_id is null;`
should return 45.

### Auth settings

In *Authentication → URL Configuration*:

- **Site URL**: `https://<the real domain>`
- **Redirect URLs**: the same, plus the Vercel preview pattern if previews are
  used.

`supabase/config.toml` sets these for local development only. The production
values live in the dashboard and are not in the repo — this is the one place
where "never change the schema in the dashboard" does not apply, because these
are not schema.

Email confirmations are **off** (`enable_confirmations = false`). That is a
deliberate choice for a tool where the practitioner signs up and starts working
in the same minute. If that changes, the sign-up flow in
`src/app/(auth)/crear-cuenta/` has to grow a "revisá tu correo" step first.

---

## 2. Resend

1. Add and verify the sending domain (DNS: SPF, DKIM).
2. Create an API key → `RESEND_API_KEY`.
3. Set `MAIL_FROM` to something a practitioner would recognise, e.g.
   `Hilo <hola@hilo.uy>`. It appears in the booking notification and the
   fortnightly digest.

Until the domain is verified, Resend only delivers to the address that owns the
account. A booking notification that silently goes nowhere looks exactly like a
booking that never arrived.

**No clinical content is ever in an email** — the digest sends counts and a
link, the booking notification sends what a family typed into a public form.
`src/server/notifications.test.ts` is the test that keeps it that way.

---

## 3. Anthropic

An API key with billing enabled → `ANTHROPIC_API_KEY`.

The model is pinned in `src/server/ai.ts` (`claude-opus-5`) and must stay
pinned. v1 asked the account which models existed and took the first match, so
the quality of a signed clinical report depended on what that list happened to
return that day.

**Before inviting anyone, generate one report, one assessment analysis and one
assistant answer against the real key and read them.** Everything in this
repository has only ever run with the key absent, which exercises the offline
fallback on every request — a genuinely useful default, and the reason the
streamed output has never been seen working.

---

## 4. Mercado Pago

Each practitioner connects their **own** Mercado Pago account; Hilo never holds
money. What the deployment needs is:

- `MP_WEBHOOK_SECRET` — the signing secret from the Mercado Pago application,
  used to verify every webhook (`src/server/mercadopago.ts`). A payment
  notification that cannot be verified is discarded.
- The webhook URL registered in the Mercado Pago application:
  `https://<the real domain>/api/mercadopago/webhook`

The access token of each practitioner lives in `mp_accounts`, a table with a
`using (false)` policy and no grants — unreachable by any signed-in user,
readable only by the service role. That is defect #1 from v1, where the token
was read straight from the browser.

---

## 5. Vercel

Import the repository, branch `rewrite` (or `main` after the merge in step 8).

Set all nine environment variables in *Settings → Environment Variables*, for
Production **and** Preview:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
MAIL_FROM
CRON_SECRET
MP_WEBHOOK_SECRET
```

`src/lib/env.ts` validates every one of them at startup, so a missing variable
fails the build and names itself. That is the intended behaviour — a deploy that
starts without `CRON_SECRET` is worse than a deploy that does not start.

`NEXT_PUBLIC_APP_URL` must be the real address, not the `*.vercel.app` one: it
is what goes into the links inside emails and into the booking link a
practitioner hands to a family, both built outside a request where there are no
headers to derive it from.

`CRON_SECRET` is set by Vercel automatically when a cron exists, but set it
explicitly anyway — `vercel.json` schedules `/api/digest` for 11:00 on the 1st
and the 15th, and the route compares the header against it with no branch that
passes when it is missing.

---

## 6. The domain

Point it at the Vercel deployment, then go back and update:

- `NEXT_PUBLIC_APP_URL` in Vercel
- Site URL and Redirect URLs in Supabase
- The webhook URL in Mercado Pago

Three places, and forgetting the second one means sign-in redirects to the old
address without any error to explain it.

---

## 7. Check it before anyone else does

With the real domain live, and signed out:

```bash
curl -s https://<domain>/robots.txt          # disallow everything but the landing and legal pages
curl -s https://<domain>/manifest.webmanifest # the PWA manifest, not an HTML redirect
curl -s -o /dev/null -w '%{http_code}\n' https://<domain>/api/digest  # 401
```

Then, signed in as a real account:

1. Create a patient, a goal, a session.
2. Generate a report and read it. This is the one that costs money and matters.
3. Open the booking link on a phone, send a request, confirm the email arrives.
4. Install the app from the browser and check it opens at `/inicio`.

And once, deliberately: `select * from patients` from a second account's
session, and confirm it returns nothing. `src/server/rls.test.ts` proves this
locally on every run; doing it once against production is what turns it from a
test into a fact about the real database.

---

## 8. Cutover

From `docs/plan-02-migration.md` §9:

1. Confirm there is nothing to migrate by **looking at v1's `pacientes` table**,
   not by remembering. If something has accumulated that is worth keeping, it is
   a one-off script from the `data` JSONB into the normalised tables — not a
   change to any of this.
2. Merge `rewrite` into `main`, tag `v2.0.0`.
3. Point the domain at the v2 deployment.
4. **Pause** v1's Supabase project rather than deleting it. Pausing is reversible
   and free; deleting is neither.

`legacy/` stays in the repository. It is the only record of what the Spanish
copy, the clinical prompts and the colours were meant to be.

---

## If it breaks

`docs/when-things-break.md`. The short version: **roll back in Vercel first,
then investigate.** Nobody diagnoses well with the site down.
