# Poner Ombúa en producción

Everything in this file happens **outside the repository**, in the Supabase,
Vercel and Resend dashboards. The code is finished; this is the
list of things that only exist once and that nobody remembers a year later.

Work through it in order. Steps 1 to 4 can be done days ahead; step 8 is the one
that makes Ombúa live.

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

Some migrations must run **before** the code that needs them is deployed, and
a few must run **after** (they remove what the old code still reads). The
migration file says which in its first lines; read them before a `db push`.

```bash
./dx npx supabase db push --dry-run --db-url "$(tr -d '[:space:]' < ~/.supabase-db-url)"
./dx npx supabase db push --yes    --db-url "$(tr -d '[:space:]' < ~/.supabase-db-url)"
```

`supabase link` refuses this project ("your account does not have the
necessary privileges"), so the connection string goes in directly: the
**Session pooler** one, from *Connect* at the top of the dashboard, port 5432,
saved in `~/.supabase-db-url` with permissions 600 and never on the command
line. Always `--dry-run` first and compare the list with what you expect.

`db push` replays `supabase/migrations/` in order against production. Seeding is
opt-in (`--include-seed`), so **do not pass that flag**: `supabase/config.toml`
points it at `seed.sql`, which creates a fake practitioner and three fake
patients for local demos and must never exist in production.

### Seed the shared materials

The shared library is the one thing production *does* need from the seeds
directory — the rows with a NULL `practitioner_id`, one file per discipline.
Load them with the script, which never touches `seed.sql`:

```bash
./dx npm run db:seed:remote
```

Run it as often as the library changes. The seeds end in `on conflict … do
update`, so a row that is already there is updated in place and keeps its id —
which is what keeps the session plans that point at it pointing at it. A shared
row that is no longer in any file is removed at the end of the same
transaction; nobody's own materials are touched.

The script counts what it loaded and fails if a discipline came up short. To
check by hand: `select count(*) from materials where practitioner_id is null;`
should return the same number as
`grep -c "^  (null," supabase/seeds/*.sql | awk -F: '{t+=$2} END {print t}'`.

### Auth settings

In *Authentication → URL Configuration*:

- **Site URL**: `https://<the real domain>` — every emailed link is built from
  this, so a wrong value here sends practitioners to the wrong host.
- **Redirect URLs**: `https://<the real domain>/confirmar`, plus the same path on
  the Vercel preview pattern if previews are used.

`supabase/config.toml` sets these for local development only. The production
values live in the dashboard and are not in the repo — this is the one place
where "never change the schema in the dashboard" does not apply, because these
are not schema.

### Two-step verification and the password

In *Authentication → Multi-Factor*: **App Authenticator (TOTP)** enabled for
both enrolment and verification. It is free on every plan. Practitioners turn
it on for themselves in *Mi perfil*; with this off the button fails. The
database already refuses a password-only session for an account that has it
(migration `mfa_when_enrolled`), so there is nothing else to switch.

In *Authentication → Sign In / Providers → Email*: **minimum password length
10**. The app asks for 10 when a password is set; this makes Supabase refuse a
shorter one even when the request does not come through the app.

### The email templates

In *Authentication → Email Templates*, replace **Confirm signup** and **Reset
password** with the contents of `supabase/templates/confirmacion.html` and
`supabase/templates/recuperacion.html`, and set the subjects to the ones in
`supabase/config.toml`.

This is not only about the emails being in Spanish. Both templates build their
link from `{{ .TokenHash }}` rather than `{{ .ConfirmationURL }}`, and that is
the difference between a link that works and one that does not: a token hash can
be redeemed by any browser, while `{{ .ConfirmationURL }}` carries a PKCE code
that only the browser which asked for the email can exchange. The request is
made on a laptop and the email is read on a phone. `/confirmar` handles both
shapes, so a forgotten template degrades rather than breaks — but it degrades
into exactly the failure nobody can reproduce.

### Sign-up is off, and this is the switch that does it

In *Authentication → Sign In / Providers → Email*, turn **"Allow new users to
sign up"** off.

**Leave "Enable Email provider" on.** It is the toggle directly above and it
looks like the thorough version of the same decision. It is not: it decides
whether email is a way *in* at all, so turning it off stops everyone who already
has an account from signing in. The server answers `email_provider_disabled`,
which `/entrar` shows as "El correo o la contraseña no coinciden" — a message
that sends whoever is locked out to check a password that was never the problem.
The same trap is in `supabase/config.toml`; there is a comment on the line.

**This is the only thing that closes the door.** Ombúa has no sign-up form any
more, but that is decoration: the `anon` key is a public credential — the
dashboard hands it out and it sits in Vercel's environment — so anybody who has
it can `POST` straight at `/auth/v1/signup` without touching a screen of ours.
This switch is what refuses it.

`supabase/config.toml` sets the same thing for the local stack. Both have to be
set; neither implies the other.

Accounts are created from inside Ombúa, at `/invitaciones`, by
`src/server/invitations.ts` using the admin API — which this switch does not
apply to, on purpose.

### The first admin

Only a practitioner with `practitioners.is_admin = true` can invite, and nothing
in the application can grant it: the column grants in
`20260906120000_practitioners_column_grants.sql` leave every column added to that
table afterwards unwritable through a user session. So the first one is granted
by hand, once, in *SQL Editor*:

```sql
update practitioners set is_admin = true where email = '<the owner's email>';
```

That account then sees an **Invitaciones** card in *Mi perfil* and can invite
everybody else. Every later admin is the same one-line UPDATE — deliberately, so
that handing out the key is never something a screen can do by accident.

### Email confirmations

They are **off** (`enable_confirmations = false`), and with invitations they are
close to redundant: accepting an invitation proves the address already, because
the link only reaches the inbox it was sent to. `acceptInvitation` creates the
account with `email_confirm: true` for that reason.

They still apply to an address changed later from *Mi perfil*. If you turn
confirmations on, do it in the dashboard *and* in `supabase/config.toml`, so
local development behaves the way production does.

---

## 2. Resend

1. Add and verify the sending domain (DNS: SPF, DKIM).
2. Create an API key → `RESEND_API_KEY`.
3. Set `MAIL_FROM` to something a practitioner would recognise, e.g.
   `Ombúa <hola@ombua.com>`. It appears in the booking notification, the
   fortnightly digest and the invitation — which is the one that goes to somebody
   who has never heard of Ombúa, so it is the one where the sender matters most.

Until the domain is verified, Resend only delivers to the address that owns the
account. A booking notification that silently goes nowhere looks exactly like a
booking that never arrived.

### Resend as Supabase's mail server

The booking notification, the digest and the invitation are sent by Ombúa through
the Resend API — the invitation deliberately so, rather than by Supabase's own
invite, which is why its Spanish wording lives in `src/server/notifications.ts`
and is covered by a test instead of living in the dashboard.
The confirmation and password-recovery emails are sent by **Supabase**, which has
its own mail server — and by default that is a shared one limited to a handful of
messages an hour, meant for testing and not for people who need to get back into
their accounts.

Point it at the same Resend domain, in *Project Settings → Authentication → SMTP
Settings*:

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | the `RESEND_API_KEY` |
| Sender email | the same address as `MAIL_FROM` |
| Sender name | `Ombúa` |

Then raise the rate limit in *Authentication → Rate Limits* — the default of a
few emails per hour is a shared-server limit and no longer applies.

Send yourself one password reset afterwards and read it. An address that is not
on the verified domain is accepted by Supabase and dropped by Resend, and the
only symptom is a practitioner who says the email never arrived.

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
assistant answer against the real key and read them with a professional's eye.**

The plumbing is no longer the unknown it used to be: `.env.local` now carries a
real key, a session draft has been generated against the real model and read
(August 2026), and the end-to-end test drives a real report through it. What
remains is a judgement, not a check — whether the writing is good enough to put
a signature under — and no test can make it for you.

If you are reading an older note in this repository that says the key is absent
and the streamed output has never been seen, it is out of date.

---

## 4. Mercado Pago

Not in v1. It was built, kept switched off, and removed from the code on
2026-09-29 (migration `20260930024451_remove_mercado_pago.sql`). There is
nothing to configure. If it comes back, it comes back from the git history.

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

Two places, and forgetting the second one means sign-in redirects to the old
address without any error to explain it.

---

## 7. Check it before anyone else does

With the real domain live, and signed out:

```bash
curl -s https://<domain>/robots.txt          # disallow everything but the landing and legal pages
curl -s https://<domain>/manifest.webmanifest # the PWA manifest, not an HTML redirect
curl -s -o /dev/null -w '%{http_code}\n' https://<domain>/api/digest  # 401

# Sign-up is closed, and this is the door that has to be locked — not the form.
# Expect an error saying signups are disabled. A 200 with a user in it means the
# dashboard switch in step 1 was not set, and anybody can open an account.
curl -s -X POST "https://<project ref>.supabase.co/auth/v1/signup" \
  -H "apikey: <the anon key>" -H 'Content-Type: application/json' \
  -d '{"email":"prueba-alta-abierta@example.com","password":"una-clave-cualquiera"}'
```

Then, signed in as a real account:

1. Create a patient, a goal, a session.
2. Generate a report and read it. This is the one that costs money and matters.
3. Open the booking link on a phone, send a request, confirm the email arrives.
4. Install the app from the browser and check it opens at `/inicio`.
5. Use "Olvidé mi contraseña", and **open the link on a different device than the
   one that asked for it**. That is the case the whole token-hash decision above
   exists for, and the only way to find out it was got wrong is to try it.
6. Invite somebody from *Invitaciones*, to an address you can read, and accept it
   from a different device. Check the mail actually arrived — Resend accepting a
   message and a mailbox filing it as spam look identical from here, which is why
   the screen also shows the link — and then cancel a second invitation and
   confirm its link stops working.

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
