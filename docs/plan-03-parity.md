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

Still open, and each one is more than a component edit:

- **Consentimiento.** v1 recorded that the family consented, which its own terms
  require before any data is loaded (Ley N.º 18.331 art. 18). v2 has nothing —
  no column, no screen. v1 captured the authoriser's name and document, their
  relationship to the patient, the text they agreed to, and **a signature drawn
  on a canvas**. The signature is what makes this more than a migration: it is
  an image of a person's hand, which changes what the row is and what deleting
  an account has to delete. It wants deciding, not copying.
- **Exportar datos.** The right of access, and v1 had a button for it. Needs a
  server function that assembles everything about one patient and a route that
  streams it. No schema change.
- Objetivos render as range sliders where v1 used a bar and a pencil. Left as
  is: the slider is the better control for the thing it does.

### Agenda — **mostly done**

The weekly hour grid is back (`week-calendar.tsx`), with the day cards kept as
the phone view exactly as v1 split them. "Recordá los turnos de mañana" is back
with its WhatsApp button. Reservas is a card at the top again.

Still open:

- **Google Calendar.** See below.
- Reservas links out to `/reservas` instead of confirming or discarding each
  request inline the way v1 did.

### Informes y evaluaciones — **done**

"Formatos disponibles" is back, with the banner above it, and the chosen format
now arrives preselected in the form. The list is built from
`recipientsFor(discipline)` rather than v1's fixed six, so a kinesióloga is not
offered ANEP adecuaciones.

### Planificación — **mostly done**

Tabs restored, both routes sharing one title, and the nav item now lands on
Materiales as v1 did.

Still open, and one deliberate refusal:

- **"Generar con IA"** does not exist in v2 at all: there is no path that writes
  a material with the model, so it is a feature, not a button.
- **"Publicar material" stays "Nuevo material".** v1's word is wrong here: a
  material created in v2 is written with the practitioner's own
  `practitioner_id` and only they can see it. Only the 45 rows shipped with Hilo
  have a NULL owner and are shared. A button that says "publicar" for something
  nobody else will ever see is a label that lies about what it does.

### Cobros — **mostly done**

The three v1 stats are back with v1's icons and colours, and the month switcher
is v1's. Still open: the per-row `···` menu for editing fee and frequency —
today that is done from the patient's ficha.

## Not ported, and why

### "Consulta online" — **do not copy v1's**

v1's button built a Jitsi room from the patient's own name:

```
https://meet.jit.si/Hilo-tomas-perez-x7k2p
```

`meet.jit.si` rooms are public to anyone holding the URL. That link puts a
patient's full name into an unauthenticated third-party address that gets pasted
into WhatsApp threads — it is the same class of mistake as putting clinical
content in an email, and it is exactly what Ley N.º 18.331 is about. v1 also kept
the room id in memory only, so it changed on every reload and a link already
shared with a family stopped working.

The version worth building stores a random room id on the appointment — no name
in the URL — so the link is stable and says nothing. That is a migration plus a
button, and it should be a deliberate decision rather than a port.

### Google Calendar

v1 holds a public OAuth client id and connects each practitioner's own calendar.
v2 has no Google integration anywhere — no tokens, no table, no refresh path.
A feature to build, scoped on its own. Note that v2 does already put "Agregar a
Google Calendar" on every appointment menu, which covers the common case without
any OAuth at all.

### Consentimiento, exportar datos, foto del paciente

All three are listed under Ficha above. They are schema or server work, not
component work.

## What is left

In rough order of how much they are missed:

1. Consentimiento de la familia — the one with a legal weight behind it.
2. Exportar los datos de un paciente.
3. Reservas confirmed inline on the Agenda instead of a link out.
4. "Publicar material" in Planificación's header (a rename), and the `···` menu
   on a Cobros row.
5. The foto del paciente, "Consulta online", and Google Calendar — each its own
   piece of work, in that order of value.

Everything above the line was component and page work, plus two additions to
`src/server/` (`todayBriefing`, `patientSummaries`) because the pages must not
query. The architecture rules in `CLAUDE.md` held throughout: reads in Server
Components, writes in Server Actions, and no screen grew a database query of its
own.
