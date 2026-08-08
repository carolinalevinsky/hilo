---
name: add-screen
description: Add a screen or page to Hilo — routing, Server Component data loading, shadcn layout, Spanish copy, empty states. Use when building any user-facing view.
---

# Adding a screen to Hilo

## Route

```
src/app/patients/page.tsx           /patients
src/app/patients/[id]/page.tsx      /patients/<id>
src/app/patients/actions.ts         Server Actions for this route
```

Route folder names are English, like all code. What the user sees is Spanish.

## Load data in the Server Component

```tsx
import { requireUser } from '@/server/auth'
import { listPatients } from '@/server/patients'

export default async function PatientsPage() {
  const user = await requireUser()
  const patients = await listPatients(user.id)

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Pacientes</h1>
      <PatientList patients={patients} />
    </main>
  )
}
```

No `useEffect`, no fetch-on-mount, no loading spinner for the initial render.
The page arrives with its data.

**A component never imports `@supabase/*`.** A lint rule blocks it. Data comes
from `src/server/` through the page.

## `'use client'` only when you need it

Add it for: `useState`, `onClick`, form interactivity, anything using a browser
API. Push it to the smallest possible leaf — an interactive button inside a
server-rendered page, not the whole page.

## Visual language

shadcn components already carry Hilo's palette, because the tokens are mapped in
`globals.css`. Use the semantic classes:

```tsx
bg-background text-foreground     page
bg-card shadow-card rounded-lg    a card
text-muted-foreground             secondary text
border-border                     dividers
```

The named accents from v1, each with a soft companion for chips and badges:

```tsx
bg-violet   bg-violet-soft text-violet    // primary — brand
bg-teal     bg-teal-soft text-teal
bg-coral    bg-coral-soft text-coral      // also destructive
bg-amber    bg-amber-soft text-amber
bg-green    bg-green-soft text-green      // success, paid
bg-blue     bg-blue-soft text-blue
```

Add a component with `npx shadcn@latest add <name>`. It is copied into
`src/components/ui/` and is yours to edit — not a dependency.

## Copy

Rioplatense Spanish, `vos` not `tú`. Warm and clear, the way v1 was written:

```tsx
// Good
<Button>Guardar paciente</Button>
<p>Todavía no agregaste ningún paciente.</p>
<p>Podés empezar por acá.</p>

// Wrong register
<p>Aún no has agregado ningún paciente.</p>
```

Reuse v1's wording where it exists — read `legacy/index.html`. It was written by
someone who knows this audience.

## Every screen needs three states

1. **Empty** — first-time users see this most. Say what the screen is for and
   give one action. Never an empty box.
2. **Loading** — a `loading.tsx` with skeletons, not a spinner.
3. **Error** — an `error.tsx` in plain Spanish, with a way back. Never a stack
   trace.

## Mobile

Practitioners use this between sessions, on a phone. v1 had a bottom nav bar on
mobile and a sidebar on desktop, and that was the right call. Check every screen
at 375px wide.

## Checklist

- [ ] Data loaded in the Server Component, from `src/server/`
- [ ] No `@supabase/*` import in any component
- [ ] `'use client'` only on the leaves that need it
- [ ] Spanish copy, `vos`, reusing v1's wording where it exists
- [ ] Empty, loading, and error states all present
- [ ] Works at 375px
