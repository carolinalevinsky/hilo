/**
 * The six accent colours a patient can carry, in both forms the interface needs.
 *
 * Tailwind cannot build a class name at runtime — `bg-${color}` compiles to
 * nothing — so the class pairs are written out. The hex values are for the one
 * place a class will not do: the gradient on the patient header, which is
 * generated from the colour.
 *
 * They match `--hilo-*` in `globals.css`, which came from v1
 * (`legacy/index.html:886`).
 */

export const PATIENT_COLOR_HEX: Record<string, string> = {
  violet: '#6c5ce7',
  teal: '#12b5a5',
  coral: '#ff6b6b',
  blue: '#4c8dff',
  amber: '#f7a800',
  green: '#21bf73',
}

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
