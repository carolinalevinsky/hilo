/**
 * Spanish labels and colours for an appointment's status.
 *
 * The four states exist because they answer different questions. "Cancelada"
 * means the family let you know; "no vino" means they did not — and those are
 * not the same conversation, nor the same thing to bill. v1 could express
 * neither.
 */

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendada',
  attended: 'Vino',
  cancelled: 'Cancelada',
  no_show: 'No vino',
} as const

export const APPOINTMENT_STATUS_CLASSES = {
  scheduled: 'bg-violet-soft text-violet',
  attended: 'bg-green-soft text-[#1a8f57]',
  cancelled: 'bg-muted text-muted-foreground',
  no_show: 'bg-coral-soft text-[#c0392b]',
} as const

export function appointmentStatusLabel(status: string) {
  return (
    APPOINTMENT_STATUS_LABELS[status as keyof typeof APPOINTMENT_STATUS_LABELS] ??
    APPOINTMENT_STATUS_LABELS.scheduled
  )
}

export function appointmentStatusClasses(status: string) {
  return (
    APPOINTMENT_STATUS_CLASSES[status as keyof typeof APPOINTMENT_STATUS_CLASSES] ??
    APPOINTMENT_STATUS_CLASSES.scheduled
  )
}

export const FREQUENCY_LABELS = {
  weekly: 'Todas las semanas',
  biweekly: 'Cada quince días',
  monthly: 'Una vez por mes',
} as const

export function frequencyLabel(value: string) {
  return FREQUENCY_LABELS[value as keyof typeof FREQUENCY_LABELS] ?? FREQUENCY_LABELS.weekly
}
