# Hilo v1 — frozen prototype

This is the Hilo v1 prototype: a single 343 KB `index.html` plus four Vercel
serverless functions. **It is frozen and unmaintained.**

It is kept as a reference for:

- **Visual design** — the palette and type scale live in the `<style>` block at
  `index.html` lines 27–497.
- **Spanish product copy** — every label, hint, empty state, and error message.
- **The clinical AI prompts** — `api/ia.js` lines 6–24 (`BASE_INSTRUCTIVO`).
- **The email templates** — `api/aviso-reserva.js` and `api/resumen.js`.
- **Domain knowledge** — which assessment instruments belong to which
  discipline, which report recipients each profession needs
  (`index.html` lines 1696–1743).

## Rules

- **Do not import from this folder.** Nothing under `legacy/` is part of the
  running application.
- **Do not run it.** `legacy/vercel.json` is inert — Vercel only reads a
  `vercel.json` at the repository root.
- **Do not treat anything here as current architecture.** This code was written
  by one person learning as she went, and it contains twelve catalogued defects,
  including a payment token that was readable from the browser and an
  unauthenticated AI endpoint.

## Where the defects are written down

`docs/plan-02-migration.md`, section 2. Each entry has a file and line number
and names the milestone where it stops being possible.

## If you need v1 back

```bash
git checkout v1-prototype
```

The tag points at the last commit where v1 was the live application.
