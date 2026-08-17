'use client'

import { Search } from '@/components/icons'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { Input } from '@/components/ui/input'

/**
 * The two controls on the planner that change what the server queries: which
 * patient, and what to search the library for.
 *
 * Both live in the URL, for the same reasons as the patient list — the page
 * stays a Server Component, a half-built plan can be reloaded without losing
 * where you were, and the back button works. These are the only two client
 * components on the screen; everything else is rendered on the server and
 * changed through Server Actions.
 */

const SELECT_CLASSES =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

function useUrlParam() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  return function set(values: Record<string, string>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }

    const query = next.toString()
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    )
  }
}

export function PlanPatientPicker({
  patients,
  selectedId,
}: {
  patients: { id: string; fullName: string }[]
  selectedId: string
}) {
  const set = useUrlParam()

  return (
    <select
      value={selectedId}
      // Changing patient must also drop the library search: the results carry
      // "Agregar" buttons that would otherwise still be pointing at the previous
      // patient's plan for as long as the URL kept the old query.
      onChange={(event) => set({ paciente: event.target.value, q: '' })}
      aria-label="Elegí el paciente"
      className={SELECT_CLASSES}
    >
      {patients.map((patient) => (
        <option key={patient.id} value={patient.id}>
          {patient.fullName}
        </option>
      ))}
    </select>
  )
}

export function PlanMaterialSearch({ initial }: { initial: string }) {
  const params = useSearchParams()
  const set = useUrlParam()
  const [value, setValue] = useState(initial)

  // Same 250ms as the patient list, and for the same reason: typing "fluidez"
  // should be one query, not seven.
  useEffect(() => {
    const current = params.get('q') ?? ''
    if (value === current) return

    const timer = setTimeout(() => set({ q: value }), 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ej: fluidez, sílabas, atención…"
        aria-label="Buscar en la biblioteca"
        className="pl-9"
      />
    </div>
  )
}
