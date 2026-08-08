---
name: add-feature
description: Add a feature to Hilo — the two-file pattern (logic in src/server/, Server Action in src/app/). Use whenever adding or changing anything a practitioner can do.
---

# Adding a feature to Hilo

Two files. Resist adding a third.

## 1. The logic — `src/server/<concept>.ts`

Put it in the file named after the business concept, not after the screen.
Something about payments goes in `payments.ts` even if it is triggered from the
patient page.

```ts
import { z } from 'zod'
import { getDb } from './db'

// Name the schema after the use case, not the transport.
// NewPatient — not CreatePatientRequest, not PatientDTO.
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

Three things that are not negotiable:

- **`practitionerId` is the first parameter.** Never read it from a cookie or a
  header inside this function. This is what makes the function testable with any
  id and callable from outside a web request.
- **Validate at the boundary with Zod.** `input` is `unknown` until it is parsed.
- **`getDb()`, not `getServiceDb()`.** `getDb()` carries the user's session so
  Row Level Security protects the data. The service-role client bypasses RLS
  entirely and a lint rule blocks it outside four allowlisted files.

## 2. The Server Action — `src/app/<route>/actions.ts`

```ts
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

The action does three things and nothing else: resolve the user, call the server
function, revalidate. **If you find yourself writing an `if` here, it belongs in
`src/server/`.**

## Reading data

Straight from a Server Component. No action, no API route, no `useEffect`.

```tsx
import { requireUser } from '@/server/auth'
import { listPatients } from '@/server/patients'

export default async function PatientsPage() {
  const user = await requireUser()
  const patients = await listPatients(user.id)
  return <PatientList patients={patients} />
}
```

## When you need a route handler instead

Only when something **outside the app** calls in: a webhook, a cron job, or a
public form from someone who is not logged in. Those go in
`src/app/api/<name>/route.ts` and each one must authenticate its caller.

## Checklist

- [ ] Logic in `src/server/`, not in the action or the component
- [ ] `practitionerId` passed explicitly
- [ ] Zod schema at the boundary
- [ ] `getDb()` not `getServiceDb()`
- [ ] `revalidatePath` after a write
- [ ] UI text in Rioplatense Spanish, code in English
- [ ] `npm run lint && npm run typecheck` pass
