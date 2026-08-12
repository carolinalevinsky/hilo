import type { DisciplineId } from './disciplines'

/**
 * Who a report is written for.
 *
 * Transcribed from v1 (`legacy/index.html:1735` and `tono()` at 1741). Each
 * recipient gets a genuinely different register — a greeting, an opening, a
 * closing, and a title — because a school, a family, a mutualista and ANEP are
 * reading for four different reasons.
 *
 * This is the part of the product that took real domain knowledge to write, and
 * it is transcribed rather than rewritten. "Se emite el presente informe … a los
 * efectos de dejar constancia" is how a Uruguayan clinical report actually
 * opens; nothing generated from scratch would land on it.
 */

export type RecipientId =
  | 'school'
  | 'family'
  | 'health_insurer'
  | 'anep'
  | 'physician'
  | 'patient'

export const RECIPIENT_LABELS: Record<RecipientId, string> = {
  school: 'Colegio',
  family: 'Familia',
  health_insurer: 'Mutualista',
  anep: 'Adecuación ANEP',
  physician: 'Médico derivante',
  patient: 'Paciente',
}

/** Which recipients each discipline is offered, in the order v1 offered them. */
export const RECIPIENTS_BY_DISCIPLINE: Record<DisciplineId, RecipientId[]> = {
  psychopedagogy: ['school', 'family', 'health_insurer', 'anep'],
  speech_therapy: ['school', 'family', 'health_insurer', 'physician'],
  occupational_therapy: ['school', 'family', 'health_insurer', 'physician'],
  psychomotricity: ['school', 'family', 'health_insurer', 'physician'],
  psychology: ['patient', 'family', 'physician', 'health_insurer'],
  physiotherapy: ['physician', 'health_insurer', 'patient'],
}

export function recipientsFor(discipline: string): RecipientId[] {
  return (
    RECIPIENTS_BY_DISCIPLINE[discipline as DisciplineId] ?? [
      'school',
      'family',
      'health_insurer',
    ]
  )
}

export type RecipientTone = {
  /** Title of the document. */
  title: string
  /** The greeting line. */
  greeting: string
  /** How the report opens. */
  opening: string
  /** How it closes. */
  closing: string
}

/**
 * The register for one recipient, with the patient's details woven in.
 *
 * `discipline` arrives as the Spanish adjective v1 used ("psicopedagógico"),
 * because these sentences are built around it: "el proceso psicopedagógico".
 */
export function recipientTone(
  recipient: RecipientId,
  {
    patientName,
    patientFirstName,
    age,
    disciplineAdjective,
  }: {
    patientName: string
    patientFirstName: string
    age: string
    disciplineAdjective: string
  },
): RecipientTone {
  const n = patientName
  const e = age
  const esp = disciplineAdjective

  switch (recipient) {
    case 'family':
      return {
        title: 'Informe de avance',
        greeting: 'Estimada familia',
        opening: `Les compartimos cómo viene ${n} en el proceso ${esp}. La idea es que puedan ver, en palabras claras, los avances de este tiempo y cómo acompañar desde casa.`,
        closing:
          'Quedamos a las órdenes para conversar cualquier duda. El acompañamiento de la familia es parte enorme de estos logros.',
      }

    case 'health_insurer':
      return {
        title: `Informe ${esp}`,
        greeting: 'A quien corresponda',
        opening: `Se emite el presente informe ${esp} correspondiente a ${n} (${e}), a los efectos de dejar constancia de la evolución en el período y orientar la continuidad del tratamiento.`,
        closing:
          'Se sugiere la continuidad del abordaje según lo detallado. Quedo a disposición por cualquier ampliación requerida.',
      }

    case 'anep':
      return {
        title: 'Sugerencias de adecuaciones curriculares (ANEP)',
        greeting: 'Al equipo docente',
        opening: `Se presentan sugerencias de adecuaciones curriculares para ${n} (${e}), en el marco de la educación inclusiva (ANEP), a partir de su proceso ${esp}.`,
        closing:
          'Estas adecuaciones se acuerdan y ajustan junto al centro educativo y la familia. Quedo a disposición para coordinar su implementación.',
      }

    case 'physician':
      return {
        title: 'Informe de derivación',
        greeting: 'Al médico tratante',
        opening: `Se emite el presente informe ${esp} de ${n} (${e}) para poner en conocimiento del profesional derivante la evolución del proceso en el período.`,
        closing:
          'Quedo a disposición para coordinar la continuidad del tratamiento e intercambiar la información que se requiera.',
      }

    case 'patient':
      return {
        title: 'Resumen de tu proceso',
        greeting: `Hola ${patientFirstName}`,
        opening: `Te compartimos un resumen de cómo viene tu proceso ${esp} y los próximos pasos, en lenguaje claro.`,
        closing: 'Cualquier duda, quedo a las órdenes. Seguimos trabajando juntos en esto.',
      }

    case 'school':
    default:
      return {
        title: 'Informe de avance para el centro educativo',
        greeting: 'Estimado equipo docente',
        opening: `Se comparte con el centro educativo una síntesis del proceso ${esp} de ${n} (${e}), para aportar al trabajo conjunto entre la terapia y el aula.`,
        closing:
          'Agradezco el trabajo articulado con el centro educativo y quedo a disposición para coordinar estrategias en el aula.',
      }
  }
}

/**
 * The Spanish adjective for each discipline, as it appears inside a sentence:
 * "el proceso psicopedagógico", "el informe fonoaudiológico".
 *
 * Kept apart from the labels in `disciplines.ts` because those are how a
 * profession is named ("Psicopedagogía") and these are how the work is
 * described. v1 stored only the adjective and had to derive the name; this way
 * round reads better in both places.
 */
export const DISCIPLINE_ADJECTIVES: Record<DisciplineId, string> = {
  psychopedagogy: 'psicopedagógico',
  speech_therapy: 'fonoaudiológico',
  occupational_therapy: 'de terapia ocupacional',
  psychology: 'psicológico',
  psychomotricity: 'psicomotor',
  physiotherapy: 'kinésico',
}

export function disciplineAdjective(discipline: string): string {
  return DISCIPLINE_ADJECTIVES[discipline as DisciplineId] ?? 'terapéutico'
}
