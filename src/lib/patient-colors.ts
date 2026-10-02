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
 * Filled: the colour itself, the initials on top.
 *
 * This is what an avatar wears (`legacy/index.html:.av`). It is the strongest
 * use of the palette in the product and it is doing real work: at a glance down
 * a list, the colour *is* how you find a patient, before you have read a single
 * name. A tinted avatar with coloured initials reads as a placeholder for a
 * photo that failed to load.
 *
 * Blanco encima sólo sobre el violeta. v1 ponía blanco sobre todos, y sobre
 * ámbar eso es 2:1 — las iniciales no se leían. Sobre los otros cinco va el
 * color del texto de la app, como ya hacían los avatares de la pantalla de
 * entrada; ver `patientInk` para los fondos que se pintan con el hex.
 */
export const PATIENT_COLOR_SOLID: Record<string, string> = {
  violet: 'bg-violet text-white',
  teal: 'bg-teal text-foreground',
  coral: 'bg-coral text-foreground',
  blue: 'bg-blue text-foreground',
  amber: 'bg-amber text-foreground',
  green: 'bg-green text-foreground',
}

/** Tinted: for chips and badges, where the colour is a label and not the subject. */
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
 * el hex en línea y no pueden usar `PATIENT_COLOR_SOLID`.
 */
export function patientInk(color: string | null) {
  return patientHex(color) === PATIENT_COLOR_HEX.violet ? '#ffffff' : BRAND_FOREGROUND
}

export function patientClasses(color: string | null) {
  return PATIENT_COLOR_CLASSES[color ?? 'violet'] ?? PATIENT_COLOR_CLASSES.violet!
}

export function patientSolidClasses(color: string | null) {
  return PATIENT_COLOR_SOLID[color ?? 'violet'] ?? PATIENT_COLOR_SOLID.violet!
}
