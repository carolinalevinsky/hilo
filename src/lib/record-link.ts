import type { AppointmentWithPatient } from '@/server/appointments'

/**
 * Where "Registrar sesión" goes from an appointment, shared with `SessionPanel`.
 *
 * The link carries the slot (`?agenda=`) so the record is tied to it and saving
 * marks it attended. A slot that already has its record offers that record
 * instead: the database allows one per slot, and a button that leads to a form
 * which fails on save is worse than no button.
 */
export function recordLink(
  appointment: Pick<AppointmentWithPatient, 'id' | 'patient_id' | 'sessions'>,
) {
  const recorded = appointment.sessions[0]
  const base = `/pacientes/${appointment.patient_id}/sesiones`

  return recorded
    ? { href: `${base}/${recorded.id}`, label: 'Ver registro' }
    : { href: `${base}/nueva?agenda=${appointment.id}`, label: 'Registrar sesión' }
}
