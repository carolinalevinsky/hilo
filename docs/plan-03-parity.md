# Parity with v1 — what the migration changed without meaning to

The v2 rewrite kept the palette, the copy register and the security model. What
it did not keep is the **shape of the product**: which screens exist, what lives
inside which, and what a card looks like. Enough of that drifted that v2 reads as
a different tool wearing v1's colours.

This document is the inventory of that drift, and the order in which to close it.

## How this was measured

Not from memory. `legacy/index.html` was copied to a scratch directory with
`SB_URL`/`SB_KEY` blanked — which is what flips it into demo mode — served
locally, and driven screen by screen next to v2 running on the seed data. The
copy is outside the repository: `legacy/` is frozen and is never run from its
own directory.

When re-checking any row below, do that again rather than reasoning about the
source. Several of these differences are invisible in the markup and only show
up rendered.

## Cross-cutting — **all done**

| # | What v1 does | What v2 had | |
|---|---|---|---|
| C1 | Stat card: white, icon in a tinted rounded square, big bold number, muted label under it | Two unrelated styles; none at all on Inicio | done — `src/components/stat-card.tsx` |
| C2 | Period switcher: centred, `‹  Agosto 2026  ›`, with a "MES ACTUAL" caption | Left-aligned pill buttons | done — `src/components/period-switcher.tsx` |
| C3 | Patient avatar: solid patient colour, white initials | Soft tint, coloured initials | done — `patientSolidClasses` |
| C4 | "Preguntá a Hilo" floats on every screen | Only a card on Inicio | done — `ask-hilo-fab.tsx` |
| C5 | Brandmark: rounded square with three lines | A plain square, drawn differently in four places | done — `src/components/brandmark.tsx` |
| C6 | v1's own 44 icons | lucide — every icon a different drawing | done — `src/components/icons.tsx` |

C6 was the largest of these and was not in the original list, because it is
invisible until you put the two side by side: a set of icons has a voice, and
changing it changes how the whole product reads. Nine icons with no v1 original
(arrows, chevron, close, bin, hamburger) are still lucide, re-exported from the
same module so there is one source and the exceptions are in one list.

## Screen by screen

### Nav — **done**

Six items in v1's order: Inicio, Pacientes, Agenda, Planificación, Informes y
evaluaciones, Cobros. Clínica is deliberately not ported.

v2 had promoted three screens to the sidebar that in v1 lived inside another
one. They are back where they were, and each keeps its own route:

- Materiales → a tab inside Planificación
- Reservas → a card at the top of Agenda, shown only when something is pending
- Estadísticas → a link at the foot of Inicio

### Inicio — **done**

The two stat cards are back, and so is the rich "Hoy" row: `ÚLTIMA VEZ …` and
`PARA HOY priorizar <objetivo> (55%) — <material>`, with the amber and coral
warning chips under it. `todayBriefing` in `src/server/planning.ts` assembles
it, reusing `planUpcoming` so "lo que menos se movió" means the same thing here
and in Planificación.

The "Tus pacientes" card v1 did not have is gone; it repeated the screen next
door. So is `listToday`, which nothing called any more.

### Pacientes — **done**

Lista (the default, as in v1) and Tarjetas, four sort orders, and the three
fields each row had lost: the population chip, the session count and the average
progress in the patient's own colour. Everything lives in the URL. The controls
sit behind a collapsed "Filtros y orden" that summarises what is applied.

`patientSummaries` does two aggregate queries for the whole list and averages
only active goals — the same rule as `progressByPatient`, so a patient cannot be
at 67% on one screen and 54% on another.

### Ficha del paciente — **mostly done**

The action row is back and in v1's order: Sesión, Evaluar, Compartir con
familia, Generar informe. "Abordaje" is back on the ficha. The header gradient
was already correct — the earlier note here was wrong.

The camera badge on the avatar is back too. **The photo itself was never
missing** — v2 has the bucket, its policies, the `photo_path` column and a
picker in the edit form, all built in M2. An earlier draft of this document said
otherwise and was wrong; the badge is only the shortcut v1 had, because adding a
face to a patient is something you think of while looking at them.

"Consulta online" is back too, second in the row as in v1 — see below for why its
link is not v1's. So are "Exportar datos", "Próxima sesión" above the history,
**"Evaluaciones e informes"** (the patient's own documents, which had lived only
on `/informes`), and **"Memoria de Hilo"**.

Still open, and it is more than a component edit:

- **Consentimiento.** v1 recorded that the family consented, which its own terms
  require before any data is loaded (Ley N.º 18.331 art. 18). The column exists
  (`patients.consent_signed_at`) and the export reports it; what is missing is
  the screen. v1 captured the authoriser's name and document, their relationship
  to the patient, the text they agreed to, and **a signature drawn on a canvas**.
  The signature is what makes this more than a migration: it is an image of a
  person's hand, which changes what the row is and what deleting an account has
  to delete. It wants deciding, not copying.

One thing deliberately not changed: objetivos render as range sliders where v1
used a bar and a pencil. The slider is the better control for the thing it does.
v1's "Marcar logrado" has an equivalent in "Dar por cerrado", which retires the
goal instead of forcing it to 100 — a goal you stopped working on is not the same
as a goal you finished, and v2 keeps both facts.

### Agenda — **done**

The weekly hour grid is back (`week-calendar.tsx`), with the day cards kept as
the phone view exactly as v1 split them. "Recordá los turnos de mañana" is back
with its WhatsApp button.

Reservas is a card at the top again **and is answered there**, not behind a link.
v1 put the two buttons on that card, and it is right: a family waiting on a reply
is what you deal with in the ten seconds between patients, and "go to another
screen first" is how it becomes tomorrow's job. One component
(`components/booking/pending-requests.tsx`) renders it here and on `/reservas`.

**"Plan de la semana" is back under the grid** (`legacy/index.html:1498`). One
row per session of the week: who, when, which goal it is for, the material that
fits, and a tick for when you have given it. The grid answers "when am I busy";
this answers "what am I doing in each of these".

Two things differ from v1, both because v1 kept this in memory:

- **The goal you pick is kept** (`appointments.focus_goal_id`). v1 reset every
  row to the lowest-scoring goal on each reload, which made choosing pointless.
  Until you choose, the suggestion is still the lowest-scoring goal, so the panel
  reads the same on first load.
- **The tick is the appointment's own status**, the same "Vino" the card menu
  sets, not a separate checkbox that knew nothing about it. One session, one
  truth about whether it happened.

Still open: **Google Calendar**. See below.

### Informes y evaluaciones — **done**

"Formatos disponibles" is back, with the banner above it, and the chosen format
now arrives preselected in the form. The list is built from
`recipientsFor(discipline)` rather than v1's fixed six, so a kinesióloga is not
offered ANEP adecuaciones.

### Planificación — **done**

Tabs restored, both routes sharing one title, and the nav item lands on
Materiales as v1 did.

**"Planificar sesión" is back**, and it was the largest single thing the
migration lost. The tab existed; inside it was a different screen — a read-only
list of the coming week. Not wrong, but it told you what was ahead and gave you
nothing to do about it, and the part it dropped is the part that takes the time.

v1's three panels are what live there now (`src/app/(app)/planificacion/page.tsx`):
the patient's goals sorted by what has moved least, each with its activity and a
matched material and a one-click "Agregar"; the library search; and "Próxima
sesión de X", which persists, prints and empties. Registering it fills the
session form in and retires the plan, as `registrarSesionPreparada` did.

Two things came with it:

- **The activity bank is ported verbatim** (`src/lib/activity-bank.ts`). v1's
  `sugeActividad` is clinical domain knowledge, not a heuristic worth improving:
  it covers the six disciplines and every phrase is something you can do with a
  child on a Tuesday.
- **"Próxima sesión" is on the ficha too** (`proxSesionHTML`), above the history,
  because a plan is only worth making if it is on the screen you open with the
  child already in the room.

Underneath it differs from v1 on purpose: v1's plan lived in `p.plan` inside the
patient's JSON blob — defect #4, the one where two open tabs overwrote each
other. Rows, with their own policy.

The weekly list is not lost: `todayBriefing` on Inicio is built from the same
`planUpcoming`, which is where a practitioner actually looked at it.

### Materiales — **done**

Three things v1 offered and none of which quite worked.

- **Editing.** v1's modal was `contenteditable`: you typed into the document and
  nothing was saved, so every change was gone on reload. Now a form, the same one
  as creating, because the fields are identical and two would drift.
- **"Generar con IA"**, against the real model, with its own monthly quota
  counting only `source = 'ai'` rows — writing one by hand costs nothing. The
  row is created first with an offline activity, the same order reports use, so
  a generation counts whether or not the model answered.
- **"Modificar con IA"**, which v1 only pretended to do: it appended a canned
  paragraph based on which words it spotted in your request, so "más fácil" and
  "con dinosaurios" produced the same two sentences with a different label. This
  rewrites the activity, and puts the old text back if the request fails.
- **"Sumar a la sesión"** from an open material, which is what closes the loop:
  you open a material because you are looking for something to do with somebody.

**"Publicar material" now means something.** The earlier note here said the word
was wrong, and it was — while every material was private. v1's selector existed
and did nothing: a "published" material lived in an array in memory until the tab
was reloaded and nobody else ever saw it. It is real now, which makes it **the
only change in this whole pass that alters who can read what**, and it is
described under its own heading below.

### Cobros — **done**

The three v1 stats are back with v1's icons and colours, the month switcher is
v1's, and the per-row `···` opens the fee, the frequency and the sessions per
month — edited from the row you are already reading while doing the month's
accounts, as in v1. It writes through `updatePatientBilling`, which can only
touch those three columns.

## Publishing a material to the community

The one widening of who can read what, so it gets its own section.

The read policy on `materials` is now: what ships with Hilo, plus your own
(published or not), plus what another practitioner published. The write policies
are untouched and deliberately not widened — **publishing makes a row readable by
everyone; it does not make it writable by anyone but its author.**

That distinction has six cases in `src/server/rls.test.ts`, and the one that
matters most is that Ana cannot edit, unpublish or delete what Bruno published. A
"simplification" that added `or visibility = 'public'` to `update_own` as well
would pass `check:rls`, pass the type checker, and hand every practitioner an
edit button on somebody else's work.

Two more things hold it up:

- **The authorship declaration is validated on the server.** A checkbox is a
  suggestion until the backend refuses without it. ARASAAC and the other open
  banks are non-commercial and a test manual is somebody's copyright.
- **A community material is copied, not referenced.** You take it because you
  want to change it for the child in front of you, and editing the original would
  rewrite it under everyone else who took it. The copy starts private and keeps
  `copied_from`.

Nothing clinical can arrive here: the only way a row is created is the form in
`/materiales/nuevo`, and there is no path from a patient to this table.

## Exporting a patient's data

The right of access under Ley N.º 18.331. v1 had the button, beside "Borrar
paciente y sus datos"; v2 had nothing. It is back in the same place, because
access and erasure are two halves of one right.

Both forms: a page that reads, prints and saves as PDF, and a `.json` with
exactly what is in the database.

**The private note is excluded, and its existence is declared.** Leaving it out
silently would be the easy thing and the wrong one — it is still personal data
about the patient, and pretending it does not exist is what makes an access
request adversarial. The document says, in one line, that working notes exist and
can be asked for. Technically the field never enters the object rather than
entering and being deleted: a field that is not there cannot escape through a
later `JSON.stringify` of "everything".

## Not ported, and why

### "Consulta online" — v1's shape refused, a safe one built

v1's button built a Jitsi room from the patient's own name:

```
https://meet.jit.si/Hilo-tomas-perez-x7k2p
```

`meet.jit.si` rooms are public to anyone holding the URL. That link puts a
patient's full name into an unauthenticated third-party address that gets pasted
into WhatsApp threads — the same class of mistake as putting clinical content in
an email. v1 also kept the room id in memory only, so it changed on every reload
and a link already shared with a family stopped working.

**Built, in the safe shape.** A random id stored on the patient
(`patients.room_id`): meaningless, because it is random, and stable, because it
is stored. The room is created when first asked for, not on every ficha that
loads. There is also a field for your own Zoom or Meet, which wins over Hilo's —
and it is validated as `http(s)` on the server, because `javascript:alert(1)` is
a valid string and an `href` will run it with the practitioner's session.

### "Descargar PDF"

v1 loaded `html2pdf` from a CDN at runtime. v2 prints — "Imprimir o guardar en
PDF" — which reaches the same file through the browser's own dialog without a
third-party script on a page showing clinical data. Deliberate, and the reason
that label differs.

### Google Calendar

v1 holds a public OAuth client id and connects each practitioner's own calendar.
v2 has no Google integration anywhere — no tokens, no table, no refresh path.
A feature to build, scoped on its own. Note that v2 does already put "Agregar a
Google Calendar" on every appointment menu, which covers the common case without
any OAuth at all.

### Consentimiento y exportar datos

Both are listed under Ficha above. They are schema or server work, not component
work.

## "Grabar sesión" — built

v1's button that promised a session record from a recording
(`legacy/index.html:1943`), delivered in `src/components/sessions/record-session.tsx`
and `src/app/api/ai/sesion/route.ts`.

The rule it is built on, and the one to keep if it is ever changed: **the browser
turns speech into text and only text is posted — no audio is uploaded, stored or
sent anywhere.** Uploading audio of a session with a child would mean a new
processor, a retention policy and a new line in the privacy notice. That is a
decision to take deliberately; `src/server/session-notes.ts` is where the
consequences would start.

## What is left

Two things, and only one of them is work.

1. **Consentimiento de la familia** — the one with legal weight, and the one that
   needs a decision before a line of it is written. See Ficha above: v1 captured a
   drawn signature, which is what makes this more than a migration. Note that
   `patients.consent_signed_at` already exists and is shown on the export; what
   is missing is the screen that fills it and the decision about the image.
2. **Google Calendar** — the largest, and the least missed, since every
   appointment menu already offers "Agregar a Google Calendar" without any OAuth.

## How the last passes were done

Not by re-reading the screens. Strings were extracted from `legacy/index.html`
and checked, accent- and punctuation-insensitively, against the whole of `src/`.
Twice, because the first cut missed a whole category.

**Pass one — every `<button>` label.** 103 of them; 34 did not appear. Most were
v2 saying the same thing in different words ("Marcar pago" → "Registrar pago"),
or Clínica and Google Calendar, which are deliberately absent. Three were real
and all three are built: **"Sumar a la sesión"**, **"Modificar con IA"**, and
**"Próxima sesión" on the ficha**.

**Pass two — section titles and form labels.** Buttons do not find a card that
has no button in it, which is exactly what the first pass missed. 24 headings and
48 labels; three more real gaps, all now built:

- **"Evaluaciones e informes" on the ficha.** The patient's documents lived only
  on `/informes`, which lists everybody's — the right screen for "what did I
  write this month", the wrong one for "what do I already have on this child".
- **"Memoria de Hilo".** It looks like decoration and is not: it answers the
  first-month doubt about whether all this is being written into a hole.
- **"Plan de la semana"** under the agenda grid. See Agenda above.

The technique is worth repeating for anything else ported, and worth doing more
than once, in more than one category: a label is a promise the interface makes,
and a promise missing from the new code is a feature missing from the new
product. It finds things reading cannot — including, twice, things this document
had already claimed were done.

## Screens compared, finally

The five that had never been opened side by side, and what came of each:

| Screen | Result |
|---|---|
| Términos and privacidad | Identical to v1 — all 16 clauses, same order, same text |
| The saved assessment | v2 has more: the signed document, the editor, and suggested goals adopted into the ficha |
| A saved session's detail | v2 has more: v1 had no such screen, sessions only lived in the ficha's timeline |
| An open material | Was missing "Sumar a la sesión". Built. |
| The mobile pass | Eleven screens at 375px, none scroll horizontally. The library search box was too narrow beside its button; the button now drops below. |

The privacy policy is worth one note: its "Derechos" paragraph promises that a
practitioner *can export all of a patient's data*. Until this pass that sentence
was false.

---

Most of this was component and page work. Where it needed more it got:
`session-plans`, `patient-export`, `material-prompt`, `todayBriefing`,
`patientSummaries` and `session-notes` in `src/server/`, because the pages must
not query; three migrations; and six new cases in the RLS isolation test for the
one policy that changed.

The architecture rules in `CLAUDE.md` held throughout: reads in Server
Components, writes in Server Actions, no screen grew a database query of its own,
`practitionerId` stayed an explicit argument, and `check:boundaries`,
`check:rls`, `check:secrets` and `check:migration` all still pass.
