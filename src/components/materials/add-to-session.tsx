import { Plus } from '@/components/icons'

import { addMaterialFromLibraryAction } from '@/app/(app)/planificacion/actions'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'

/**
 * "Sumar a la sesión" — v1's button under an open material
 * (`legacy/index.html:812`).
 *
 * It is what closes the loop: you open a material because you are looking for
 * something to do with somebody, and without this the only way to use it is to
 * remember its name, go to the planner, and search for it again.
 *
 * A plain `<form>` with a `<select>` in it — a Server Component, no client
 * JavaScript. The patient is chosen and submitted in one go, which is exactly
 * what v1's select-plus-button did.
 */
export function AddMaterialToSession({
  materialId,
  patients,
}: {
  materialId: string
  patients: { id: string; full_name: string }[]
}) {
  if (patients.length === 0) return null

  return (
    <form
      action={addMaterialFromLibraryAction}
      className="no-print flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="materialId" value={materialId} />

      <NativeSelect
        name="patientId"
        aria-label="A qué paciente se lo sumás"
        className="h-8"
        wrapperClassName="w-auto min-w-[150px] flex-1"
      >
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.full_name}
          </option>
        ))}
      </NativeSelect>

      <Button type="submit" size="sm">
        <Plus className="size-4" />
        Sumar a la sesión
      </Button>
    </form>
  )
}
