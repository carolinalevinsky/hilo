import type { DisciplineId } from './disciplines'

/**
 * The assessment instruments, and which discipline uses which.
 *
 * Transcribed from `legacy/index.html:1696`. This is domain knowledge, not a
 * list someone generated: it says that a psicopedagoga reaches for a WISC-V and
 * a Prolec-R, and a kinesiólogo for a Berg and a goniometry. Getting it wrong
 * means a practitioner opens the assessment screen and does not recognise their
 * own profession.
 *
 * Two shapes, because instruments come in two shapes:
 *
 *   `fields`  — an instrument that produces numbers per subscale. The form
 *               renders a box per field and the AI is told which scale they are
 *               on, because 85 is a weak standard score and a fine percentile.
 *   `prose`   — an instrument that produces a description. The form renders a
 *               textarea and the placeholder tells the practitioner what to
 *               write.
 */

export type Instrument = {
  id: string
  /** As printed on the instrument. Shown verbatim and stored on the row. */
  name: string
  fields?: string[]
  prose?: string
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'wisc-v',
    name: 'WISC-V (inteligencia)',
    fields: [
      'Comprensión verbal',
      'Visoespacial',
      'Razonamiento fluido',
      'Memoria de trabajo',
      'Velocidad de procesamiento',
      'CI Total',
    ],
  },
  {
    id: 'wppsi-iv',
    name: 'WPPSI-IV',
    fields: ['Comprensión verbal', 'Visoespacial', 'Memoria de trabajo', 'CI Total'],
  },
  {
    id: 'bender',
    name: 'Bender (viso-motor)',
    prose:
      'Errores observados (rotaciones, distorsiones, perseveraciones) y edad viso-motriz estimada.',
  },
  {
    id: 'rey',
    name: 'Figura Compleja de Rey',
    fields: ['Copia', 'Memoria', 'Organización'],
  },
  {
    id: 'prolec-r',
    name: 'Prolec-R (lectura)',
    fields: [
      'Nombre de letras',
      'Igual-diferente',
      'Lectura de palabras',
      'Lectura de pseudopalabras',
      'Comprensión de oraciones',
      'Comprensión de textos',
    ],
  },
  {
    id: 'tale',
    name: 'TALE (lectoescritura)',
    fields: [
      'Lectura de letras',
      'Lectura de sílabas',
      'Lectura de palabras',
      'Dictado',
      'Copia',
    ],
  },
  {
    id: 'evalua',
    name: 'Batería EVALÚA',
    fields: ['Bases del razonamiento', 'Nivel de adaptación', 'Aprendizajes básicos'],
  },
  {
    id: 'calculo',
    name: 'Prueba de cálculo',
    fields: ['Cálculo mental', 'Cálculo escrito', 'Resolución de problemas'],
  },
  {
    id: 'fonologica',
    name: 'Evaluación fonológica',
    prose:
      'Fonemas alterados, tipo de proceso (omisión, sustitución, distorsión) y en qué posición.',
  },
  {
    id: 'teprosif-r',
    name: 'TEPROSIF-R',
    fields: ['Estructura silábica', 'Sustitución', 'Asimilación'],
  },
  { id: 'pecfo', name: 'PECFO', fields: ['Conciencia silábica', 'Conciencia fonémica'] },
  {
    id: 'bdi-ii',
    name: 'Beck (BDI-II · depresión)',
    fields: ['Puntaje total BDI-II'],
  },
  { id: 'stai', name: 'STAI (ansiedad)', fields: ['Ansiedad estado', 'Ansiedad rasgo'] },
  {
    id: 'psqi',
    name: 'Escala de sueño de Pittsburgh',
    fields: ['Puntaje global PSQI'],
  },
  {
    id: 'tar',
    name: 'TAR (articulación)',
    prose:
      'Fonemas alterados, tipo de error (omisión, sustitución, distorsión) y en qué posición.',
  },
  {
    id: 'tecal',
    name: 'TECAL (comprensión)',
    fields: ['Vocabulario', 'Morfología', 'Sintaxis'],
  },
  {
    id: 'tevi-r',
    name: 'TEVI-R (vocabulario)',
    fields: ['Puntaje directo', 'Percentil'],
  },
  {
    id: 'perfil-sensorial',
    name: 'Perfil Sensorial',
    fields: ['Búsqueda', 'Evitación', 'Sensibilidad', 'Registro'],
  },
  {
    id: 'beery-vmi',
    name: 'Beery-VMI (viso-motor)',
    fields: ['Integración viso-motriz', 'Percepción visual', 'Coordinación motriz'],
  },
  {
    id: 'copm',
    name: 'COPM (desempeño ocupacional)',
    fields: ['Desempeño', 'Satisfacción'],
  },
  {
    id: 'tepsi',
    name: 'TEPSI (desarrollo)',
    fields: ['Coordinación', 'Lenguaje', 'Motricidad'],
  },
  { id: 'eedp', name: 'EEDP (desarrollo)', fields: ['Coeficiente de desarrollo'] },
  { id: 'eva', name: 'EVA (dolor)', fields: ['Dolor (0-10)'] },
  {
    id: 'goniometria',
    name: 'Goniometría / rango articular',
    prose: 'Rango articular por articulación (en grados) y limitaciones observadas.',
  },
  { id: 'barthel', name: 'Barthel (autonomía)', fields: ['Índice de Barthel (0-100)'] },
  { id: 'berg', name: 'Berg (equilibrio)', fields: ['Escala de Berg (0-56)'] },
  {
    id: 'otra',
    name: 'Otra',
    prose: 'Cargá los resultados y observaciones que tengas.',
  },
]

/**
 * Which instruments each discipline sees. "Otra" is last in every list — an
 * instrument this catalogue does not know about should never be a dead end.
 */
export const INSTRUMENTS_BY_DISCIPLINE: Record<DisciplineId, string[]> = {
  psychopedagogy: [
    'wisc-v',
    'wppsi-iv',
    'bender',
    'rey',
    'prolec-r',
    'tale',
    'evalua',
    'calculo',
    'otra',
  ],
  speech_therapy: ['fonologica', 'teprosif-r', 'pecfo', 'tar', 'tecal', 'tevi-r', 'tale', 'otra'],
  occupational_therapy: ['perfil-sensorial', 'beery-vmi', 'copm', 'bender', 'otra'],
  psychology: ['wisc-v', 'bender', 'bdi-ii', 'stai', 'psqi', 'otra'],
  psychomotricity: ['tepsi', 'eedp', 'bender', 'otra'],
  physiotherapy: ['eva', 'goniometria', 'barthel', 'berg', 'otra'],
}

export function instrumentsFor(discipline: string): Instrument[] {
  const ids =
    INSTRUMENTS_BY_DISCIPLINE[discipline as DisciplineId] ??
    INSTRUMENTS.map((instrument) => instrument.id)
  return ids
    .map((id) => INSTRUMENTS.find((instrument) => instrument.id === id))
    .filter((instrument): instrument is Instrument => Boolean(instrument))
}

export function instrument(id: string): Instrument | undefined {
  return INSTRUMENTS.find((entry) => entry.id === id)
}

/**
 * The scale a set of scores is on.
 *
 * This is the single most important field on the assessment form, and it is why
 * the AI can interpret rather than repeat: 85 is a *descended* standard score
 * and a perfectly good percentile. Without knowing which, "interpret this" is
 * guesswork — and a guess in a signed report is a liability.
 */
export const SCORE_SCALES = {
  standard: { label: 'Puntaje estándar (media 100)', low: 90, high: 110 },
  percentile: { label: 'Percentil (0 a 100)', low: 25, high: 75 },
  raw: { label: 'Puntaje directo (sin baremo)', low: null, high: null },
} as const

export type ScoreScale = keyof typeof SCORE_SCALES
