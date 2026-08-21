'use client'


import { useUrlParam } from '@/components/use-url-param'

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
