/**
 * Spanish labels for the closed sets stored on `patients`.
 *
 * The identifiers are English (they are database values checked by a
 * constraint); everything a practitioner reads is Rioplatense Spanish.
 *
 * v1 kept the age group because it changes how the product speaks: a screen for
 * a five-year-old says "el niño" and one for an adult in psychology says "el
 * paciente" (`legacy/index.html:987`). It is not a filter, it is a register.
 */

export const AGE_GROUP_LABELS = {
  children: 'Niños y niñas',
  adolescents: 'Adolescentes',
  adults: 'Adultos',
} as const

/** How to refer to the patient in running text, per age group. */
export const AGE_GROUP_NOUNS = {
  children: 'el niño / la niña',
  adolescents: 'el / la adolescente',
  adults: 'el / la paciente',
} as const

export const BILLING_FREQUENCY_LABELS = {
  monthly: 'Por mes',
  biweekly: 'Por quincena',
  weekly: 'Por semana',
  per_session: 'Por sesión',
} as const

export function ageGroupLabel(value: string) {
  return AGE_GROUP_LABELS[value as keyof typeof AGE_GROUP_LABELS] ?? AGE_GROUP_LABELS.children
}

export function billingFrequencyLabel(value: string) {
  return (
    BILLING_FREQUENCY_LABELS[value as keyof typeof BILLING_FREQUENCY_LABELS] ??
    BILLING_FREQUENCY_LABELS.monthly
  )
}
