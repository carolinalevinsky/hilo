/**
 * Who and which session every write on the planner is for.
 *
 * Every form on this screen carries the same two hidden fields, and they have to
 * agree — a "Agregar" that names a different session from the "Quitar" beside it
 * writes into two plans. One component, so there is one place they can disagree.
 *
 * The session travels empty for a patient with nothing scheduled; the server
 * reads that as "their next one, whenever it is".
 */
export function PlanFields({
  patientId,
  appointmentId,
}: {
  patientId: string
  appointmentId: string | null
}) {
  return (
    <>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="appointmentId" value={appointmentId ?? ''} />
    </>
  )
}

/** What each part of the planner needs to write into the right plan. */
export type PlanTarget = {
  patientId: string
  appointmentId: string | null
}
