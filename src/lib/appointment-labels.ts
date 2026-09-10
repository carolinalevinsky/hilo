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

/**
 * El mismo estado, para un bloque que ya está pintado del color del paciente.
 *
 * En la grilla de escritorio el fondo lo ocupa el color del paciente y el texto
 * es blanco, así que los fondos suaves de arriba no se leen ahí. Lo que queda
 * disponible es el borde del bloque y un glifo.
 *
 * Hasta ahora la grilla sólo distinguía `cancelled`, así que `attended`,
 * `no_show` y `scheduled` se dibujaban exactamente igual: marcar "Vino"
 * funcionaba —la fila cambiaba en la base— y no movía un pixel, con lo cual
 * parecía que el botón no hacía nada. "Volver a agendada" era el mismo problema
 * al revés: pasaba de un estado invisible a otro.
 *
 * Un glifo y no un texto porque el bloque de una sesión de 45 minutos tiene
 * lugar para el nombre y poco más; y las dos cosas juntas —marco y glifo—
 * porque el color solo no alcanza para quien no distingue verde de rojo.
 *
 * `frame` va en un `<span>` encima del bloque y no en el bloque mismo: el bloque
 * ya usa `ring` para marcar cuál está abierto en el panel, y dos `ring` en el
 * mismo elemento se pisan — Tailwind los compone en un solo `box-shadow` y gana
 * el que quede último en el CSS, no el que se escribió después.
 */
export const APPOINTMENT_STATUS_TILE = {
  scheduled: { frame: '', glyph: '' },
  attended: { frame: 'border-2 border-white/85', glyph: '✓' },
  cancelled: { frame: '', glyph: '' },
  no_show: { frame: 'border-2 border-dashed border-white/85', glyph: '✕' },
} as const

export function appointmentStatusTile(status: string) {
  return (
    APPOINTMENT_STATUS_TILE[status as keyof typeof APPOINTMENT_STATUS_TILE] ??
    APPOINTMENT_STATUS_TILE.scheduled
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
