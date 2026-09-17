import { BRAND_COLORS } from './brand'

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
 * Filled: the colour itself, white on top.
 *
 * This is what an avatar wears (`legacy/index.html:.av` — `color:#fff` over the
 * patient's colour). It is the strongest use of the palette in the product and
 * it is doing real work: at a glance down a list, the colour *is* how you find
 * a patient, before you have read a single name. A tinted avatar with coloured
 * initials reads as a placeholder for a photo that failed to load.
 */
export const PATIENT_COLOR_SOLID: Record<string, string> = {
  violet: 'bg-violet text-white',
  teal: 'bg-teal text-white',
  coral: 'bg-coral text-white',
  blue: 'bg-blue text-white',
  amber: 'bg-amber text-white',
  green: 'bg-green text-white',
}

/** Tinted: for chips and badges, where the colour is a label and not the subject. */
export const PATIENT_COLOR_CLASSES: Record<string, string> = {
  violet: 'bg-violet-soft text-violet',
  teal: 'bg-teal-soft text-teal',
  coral: 'bg-coral-soft text-coral',
  blue: 'bg-blue-soft text-blue',
  amber: 'bg-amber-soft text-amber',
  green: 'bg-green-soft text-green',
}

export function patientHex(color: string | null) {
  return PATIENT_COLOR_HEX[color ?? 'violet'] ?? PATIENT_COLOR_HEX.violet!
}

export function patientClasses(color: string | null) {
  return PATIENT_COLOR_CLASSES[color ?? 'violet'] ?? PATIENT_COLOR_CLASSES.violet!
}

export function patientSolidClasses(color: string | null) {
  return PATIENT_COLOR_SOLID[color ?? 'violet'] ?? PATIENT_COLOR_SOLID.violet!
}
