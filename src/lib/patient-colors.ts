import { BRAND_COLORS, BRAND_FOREGROUND } from './brand'

/**
 * The six accent colours a patient can carry, in both forms the interface needs.
 *
 * Tailwind cannot build a class name at runtime — `bg-${color}` compiles to
 * nothing — so the class pairs are written out. The hex values are for the one
 * place a class will not do: the gradient on the patient header, which is
 * generated from the colour.
 *
 * Los hex salen de `brand.ts`, que es donde vive la paleta. Acá no se escribe
 * ningún color: se elige cuáles de los de la marca puede llevar un paciente.
 */

export const PATIENT_COLOR_HEX: Record<string, string> = {
  violet: BRAND_COLORS.violet,
  teal: BRAND_COLORS.teal,
  coral: BRAND_COLORS.coral,
  blue: BRAND_COLORS.blue,
  amber: BRAND_COLORS.amber,
  green: BRAND_COLORS.green,
}

/**
 * Tinted: a pale background and the deep version of the colour on top. What an
 * avatar wears, and every chip or badge that carries a patient's colour.
 */
export const PATIENT_COLOR_CLASSES: Record<string, string> = {
  violet: 'bg-violet-soft text-violet',
  teal: 'bg-teal-soft text-teal-ink',
  coral: 'bg-coral-soft text-coral-ink',
  blue: 'bg-blue-soft text-blue-ink',
  amber: 'bg-amber-soft text-amber-ink',
  green: 'bg-green-soft text-green-ink',
}

export function patientHex(color: string | null) {
  return PATIENT_COLOR_HEX[color ?? 'violet'] ?? PATIENT_COLOR_HEX.violet!
}

/**
 * El color del texto que va encima de `patientHex`: blanco sobre violeta, el
 * del texto de la app sobre los demás. Para los lugares que pintan el fondo con
 * el hex en línea (la grilla de la Agenda en escritorio y su panel).
 */
export function patientInk(color: string | null) {
  return patientHex(color) === PATIENT_COLOR_HEX.violet ? '#ffffff' : BRAND_FOREGROUND
}

export function patientClasses(color: string | null) {
  return PATIENT_COLOR_CLASSES[color ?? 'violet'] ?? PATIENT_COLOR_CLASSES.violet!
}
