/**
 * Age, derived from a date of birth.
 *
 * v1 stored the age itself, as free text: `edad: "5 años"`. It was wrong within
 * a year of being typed, and it made "show me the patients between 6 and 8"
 * impossible to ask. Storing the date and computing this is the whole fix.
 */

export function ageInYears(dateOfBirth: string, today = new Date()): number {
  const born = new Date(`${dateOfBirth}T00:00:00`)
  let years = today.getFullYear() - born.getFullYear()
  const monthDelta = today.getMonth() - born.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < born.getDate())) {
    years -= 1
  }
  return Math.max(years, 0)
}

export function ageInMonths(dateOfBirth: string, today = new Date()): number {
  const born = new Date(`${dateOfBirth}T00:00:00`)
  let months =
    (today.getFullYear() - born.getFullYear()) * 12 + (today.getMonth() - born.getMonth())
  if (today.getDate() < born.getDate()) months -= 1
  return Math.max(months, 0)
}

/**
 * "5 años", "1 año", "8 meses". Under two, months are what a practitioner
 * actually works with — "1 año" tells you much less than "14 meses" does when
 * the patient is a toddler in early intervention.
 */
export function ageLabel(dateOfBirth: string | null, today = new Date()): string | null {
  if (!dateOfBirth) return null

  const months = ageInMonths(dateOfBirth, today)
  if (months < 24) return months === 1 ? '1 mes' : `${months} meses`

  const years = ageInYears(dateOfBirth, today)
  return years === 1 ? '1 año' : `${years} años`
}
