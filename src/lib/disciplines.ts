/**
 * The six disciplines Hilo serves.
 *
 * The identifiers are English because they are stored in the database and
 * checked by a constraint (`practitioners.discipline`). The labels are
 * Rioplatense Spanish because a practitioner reads them.
 *
 * The accent colour per discipline comes from v1 (`legacy/index.html:887`),
 * where each profession had its own colour throughout the interface. It is a
 * small thing that makes the product feel like it was made for you rather than
 * for "a professional".
 */

export const DISCIPLINES = [
  { id: 'speech_therapy', label: 'Fonoaudiología', short: 'Fono', accent: 'teal' },
  { id: 'psychopedagogy', label: 'Psicopedagogía', short: 'Psicoped.', accent: 'violet' },
  {
    id: 'occupational_therapy',
    label: 'Terapia ocupacional',
    short: 'T. Ocupacional',
    accent: 'coral',
  },
  { id: 'psychology', label: 'Psicología', short: 'Psicología', accent: 'blue' },
  { id: 'psychomotricity', label: 'Psicomotricidad', short: 'Psicomotr.', accent: 'amber' },
  {
    id: 'physiotherapy',
    label: 'Kinesiología / Fisioterapia',
    short: 'Kinesio',
    accent: 'green',
  },
] as const

export type DisciplineId = (typeof DISCIPLINES)[number]['id']

export const DISCIPLINE_IDS = DISCIPLINES.map((d) => d.id) as [
  DisciplineId,
  ...DisciplineId[],
]

/**
 * Falls back to psychopedagogy's shape rather than throwing. A discipline that
 * somehow does not match should degrade to a readable screen, not a crash — the
 * database constraint is what actually guarantees the value is valid.
 */
export function discipline(id: string) {
  return DISCIPLINES.find((d) => d.id === id) ?? DISCIPLINES[1]
}

export function disciplineLabel(id: string) {
  return discipline(id).label
}
