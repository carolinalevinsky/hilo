import { countPatients } from './patients'
import { getPractitioner } from './practitioners'
import { hasAnyPlanItem } from './session-plans'

/**
 * "Primeros pasos": what a new practitioner has done so far.
 *
 * One answer, asked from two places that must agree. Inicio draws the card from
 * it, and the Server Actions behind each step read it before they write, to
 * know whether what they are about to save is the thing the card was waiting
 * for — in which case they send the practitioner back to Inicio, where the step
 * is crossed out and the next one is open.
 *
 * Three steps, Carolina's (2026-10-07): a patient, a planned session, and a
 * look at Pagos. The first two are counts that read an index and return no
 * rows; the third is a visit, remembered on the practitioner's row.
 */
export type FirstSteps = {
  hasPatient: boolean
  /** Something in a session plan: a goal, a material, an activity. */
  hasPlan: boolean
  /** Opened Pagos from the step. See `markPaymentsSeen`. */
  hasSeenPayments: boolean
  /** Whether the card is still on Inicio. */
  open: boolean
}

export async function firstSteps(practitionerId: string): Promise<FirstSteps> {
  const [patients, hasPlan, practitioner] = await Promise.all([
    countPatients(practitionerId),
    hasAnyPlanItem(practitionerId),
    getPractitioner(practitionerId),
  ])

  const hasPatient = patients > 0
  const hasSeenPayments = practitioner.payments_seen_at !== null

  return {
    hasPatient,
    hasPlan,
    hasSeenPayments,
    open: !(hasPatient && hasPlan && hasSeenPayments),
  }
}
