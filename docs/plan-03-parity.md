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

## Cross-cutting — fix these once and many screens land at the same time

| # | What v1 does | What v2 does | Where |
|---|---|---|---|
| C1 | Stat card: white, icon in a tinted rounded square, big bold number, muted label under it | Two unrelated styles — Cobros uses tinted cards with the label *above*; Inicio has no stat cards at all | Inicio, Cobros, Estadísticas |
| C2 | Period switcher: centred, `‹  Agosto 2026  ›`, with a "MES ACTUAL" caption | Left-aligned pill buttons, "← Mes anterior / Este mes / Agosto 2026" | Agenda, Cobros |
| C3 | Patient avatar: solid patient colour, white initials, 11px radius | Soft tint background, coloured initials | everywhere |
| C4 | "Preguntá a Hilo" floats on every screen, bottom right | Only a card on Inicio | everywhere |
| C5 | Brandmark: rounded square with three lines | A plain white circle | sidebar |

C1 and C3 are the two that make the difference at a glance, because they repeat
on every screen.

## Screen by screen

### Nav — **done**

Six items in v1's order: Inicio, Pacientes, Agenda, Planificación, Informes y
evaluaciones, Cobros. Clínica is deliberately not ported.

v2 had promoted three screens to the sidebar that in v1 lived inside another
one. They are back where they were, and each keeps its own route:

- Materiales → a tab inside Planificación
- Reservas → a card at the top of Agenda, shown only when something is pending
- Estadísticas → a link at the foot of Inicio

### Inicio

- **Missing:** the two stat cards (Pacientes activos, Sesiones hoy).
- **Missing:** the rich "Hoy" row. v1 gives each session `ÚLTIMA VEZ …` and
  `PARA HOY priorizar <objetivo> (55%) — …`, plus amber warning chips
  ("Lenguaje expresivo viene lento"). v2 lists a name and a time. This is the
  single biggest content loss in the app — it is the reason to open Hilo
  between sessions.
- **Extra:** a "Tus pacientes" card v1 does not have.
- Subtitle drifted: "Esto es lo que tenés hoy." → "… Empezá por acá."

### Pacientes

- **Missing:** the Lista / Tarjetas view toggle.
- **Missing:** the sort control (Nombre A-Z, Más sesiones, Menos/Más avance).
- **Missing:** on each row — the population chip, the session count, and the
  progress percentage in the patient's own colour.
- **Missing:** the collapsible "Filtros y orden" header that holds all of the
  above.
- **Extra:** an "Archivados" filter.
- v2 renders cards where v1's default is a list.

### Ficha del paciente

- **Missing:** the header gradient (`linear-gradient(120deg, c, c+cc)`) — v2
  fills it flat.
- **Missing actions:** Evaluar, Consulta online, and Generar informe. v2 has
  Registrar sesión, Escribir a la familia, Editar ficha.
- **Missing fields:** Abordaje, Consentimiento, and the Exportar datos button.
- **Missing:** the photo upload badge on the avatar.
- Objetivos render as range sliders; v1 uses a thin bar with a pencil.

### Agenda

The largest structural gap.

- **Missing:** the weekly time grid — day columns, hour rows, coloured blocks
  positioned by time. v2 shows seven day cards with a list inside each.
- **Missing:** "Recordá los turnos de mañana", with a WhatsApp button per
  patient.
- **Missing:** the Google Calendar card. See "Needs a decision" below.
- Reservas is back as a card but only links out; v1 confirms or discards each
  request inline.

### Informes y evaluaciones

- **Missing:** the whole "Formatos disponibles" grid — six format cards
  (Avance · Colegio, Derivación · Mutualista, Para la familia, Adecuaciones
  curriculares · ANEP, Fonoaudiológico inicial, Psicopedagógico), each with its
  chip and a "Crear →" button. In v1 this *is* the screen; v2 opens on two
  mostly empty lists.
- **Missing:** the explanatory banner above it.

### Planificación

- Tabs restored. Still **missing:** "Publicar material" and "Generar con IA" in
  the header.
- v1 opens on the Materiales tab. v2 opens on Planificar sesión — see below.

### Cobros

- **Missing:** the "Pagaron 0/5" stat (v2 shows "Esperado" instead).
- **Missing:** the per-row `···` menu for editing fee and frequency.
- Row action is a text link, not a button.

## Needs a decision, or cannot be ported as-is

1. **Google Calendar.** v1 holds a public OAuth client id and connects each
   practitioner's own calendar. v2 has no Google integration anywhere — no
   tokens, no table, no refresh path. This is a feature to build, not a screen
   to restyle, and it should be scoped on its own.
2. **Patient photo.** Needs a Supabase Storage bucket with its own policies.
   Doable and worth doing, but it is a schema and RLS change, so it goes through
   `docs/plan-02-migration.md`'s rules, not through a component edit.
3. **Which tab Planificación opens on.** v1 lands on Materiales. Keeping
   `/planificacion` as the landing route is one line either way; it changes what
   the nav item means.
4. **"Consulta online."** What v1's button did needs reading before it is
   copied — if it is a stored meeting link, it is a column; if it is a
   provider, it is an integration.
5. **The stat card style (C1).** v2 has two inconsistent versions. Picking v1's
   is the obvious move, but it touches every screen that has numbers, so it is
   worth doing deliberately and in one pass.

## Order of work

1. C1 and C3 — the stat card and the avatar. One pass, visible everywhere.
2. Inicio's "Hoy" rows and the two stat cards.
3. The Informes "Formatos disponibles" grid.
4. Pacientes: view toggle, sort, and the three row fields.
5. Agenda's weekly time grid.
6. Ficha: gradient, the missing actions and fields.
7. C2, C4, C5 and the remaining small items.
8. The items under "Needs a decision", one at a time.

Nothing here changes `src/server/`. Every item is a component or a page, and the
architecture rules in `CLAUDE.md` hold throughout: reads stay in Server
Components, writes stay in Server Actions, and no screen grows a database query
of its own.
