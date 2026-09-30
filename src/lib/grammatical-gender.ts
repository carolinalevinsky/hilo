/**
 * El género gramatical con el que se escribe sobre alguien.
 *
 * No es un dato clínico ni una pregunta de identidad: es la concordancia del
 * castellano —"atento" o "atenta", "bienvenido" o "bienvenida"—. Hace falta en
 * dos lugares: en lo que Ombúa le dice a la profesional, y en lo que la IA
 * escribe sobre un paciente, que desde que no recibe el nombre (ver
 * `pseudonyms.ts`) ya no lo puede deducir.
 *
 * La regla, decidida con la usuaria el 2026-09-30:
 *
 *   1. Lo que la persona eligió, si eligió.
 *   2. Si no, lo que se pueda deducir del nombre con confianza.
 *   3. Si no, masculino.
 *
 * "Prefiero no decir" es una elección y se respeta: no se deduce encima de
 * ella; se escribe en masculino, que es lo que se acordó para ese caso.
 */

export const GRAMMATICAL_GENDERS = ['masculine', 'feminine', 'unspecified'] as const
export type GrammaticalGender = (typeof GRAMMATICAL_GENDERS)[number]

/** Lo que se usa al escribir: siempre uno de los dos. */
export type Agreement = 'masculine' | 'feminine'

/** Para la profesional, que habla de sí misma. */
export const SELF_GENDER_LABELS: Record<GrammaticalGender, string> = {
  masculine: 'Hombre',
  feminine: 'Mujer',
  unspecified: 'Prefiero no decir',
}

/** Para un paciente: la mayoría son chicos, así que no "hombre" ni "mujer". */
export const PATIENT_GENDER_LABELS: Record<GrammaticalGender, string> = {
  masculine: 'Masculino',
  feminine: 'Femenino',
  unspecified: 'Prefiero no decir',
}

// Nombres frecuentes en Uruguay que las dos reglas de abajo no resuelven, o
// resuelven mal. No pretende ser exhaustiva: lo que no está y no termina en
// -a / -o queda sin deducir, y se le pregunta a la persona.
const FEMININE = new Set([
  'isabel', 'raquel', 'ruth', 'carmen', 'belen', 'abigail', 'luz', 'paz', 'sol',
  'maite', 'ines', 'noemi', 'lourdes', 'mercedes', 'dolores', 'pilar', 'rocio',
  'consuelo', 'soledad', 'maribel', 'beatriz', 'esther', 'miriam', 'nieves',
  'guadalupe', 'jazmin', 'lucy', 'agustine', 'magali', 'noelia', 'itziar',
  'florencia', 'milagros', 'rosario', 'monserrat', 'montserrat', 'abril',
  'ailen', 'aylen', 'naomi', 'zoe', 'chloe', 'renee', 'yamile', 'nicole',
  'michelle', 'estefani', 'dayana', 'vanesa', 'sharon', 'karen', 'ivonne',
  'lilian', 'liliam', 'marisol', 'maria', 'ana',
])

const MASCULINE = new Set([
  'luca', 'nicola', 'bautista', 'joshua', 'elias', 'matias', 'tomas', 'nicolas',
  'lucas', 'thiago', 'santiago', 'joaquin', 'agustin', 'martin', 'sebastian',
  'julian', 'benjamin', 'valentin', 'facundo', 'ignacio', 'andres', 'jose',
  'juan', 'luis', 'raul', 'daniel', 'gabriel', 'manuel', 'miguel', 'rafael',
  'samuel', 'ismael', 'axel', 'felix', 'hector', 'oscar', 'victor', 'cesar',
  'ruben', 'fabian', 'adrian', 'ivan', 'german', 'hernan', 'fernan', 'leon',
  'simon', 'dylan', 'ian', 'liam', 'noah', 'enzo', 'franco', 'bruno', 'diego',
  'jesus', 'josue', 'moises', 'isaac', 'kevin', 'brian', 'jonathan', 'mateo',
  'gael', 'alan', 'john', 'jorge', 'carlos', 'marcos', 'lautaro', 'gaston',
  'maximiliano', 'emiliano', 'damian', 'cristian', 'christian', 'esteban',
  'saul', 'abel', 'noel', 'angel', 'uriel', 'ezequiel', 'nahuel', 'joel',
])

// Los que se usan para los dos, o que en otro idioma cambian. Mejor preguntar
// que adivinar: "Andrea" es mujer acá y varón en Italia; "Alex", "Ariel",
// "Noa", "Cruz" y "Dani" pueden ser cualquiera.
const AMBIGUOUS = new Set([
  'andrea', 'alex', 'ariel', 'noa', 'cruz', 'dani', 'sasha', 'alexis', 'reyes',
  'rene', 'guille', 'fran', 'juli', 'mica', 'maxi', 'santi', 'jean', 'jordan',
])

function fold(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/**
 * Lo que se puede deducir del primer nombre, o `null` si no se puede con
 * confianza. Nunca adivina entre dos: "no sé" es una respuesta válida y lleva a
 * preguntar.
 */
export function genderFromName(fullName: string | null | undefined): Agreement | null {
  const first = fold((fullName ?? '').trim().split(/\s+/)[0] ?? '').replace(/[^a-z]/g, '')
  if (first.length < 2 || AMBIGUOUS.has(first)) return null
  if (FEMININE.has(first)) return 'feminine'
  if (MASCULINE.has(first)) return 'masculine'
  if (first.endsWith('a')) return 'feminine'
  if (first.endsWith('o')) return 'masculine'
  return null
}

/** El género con el que se escribe, siguiendo la regla de arriba. */
export function agreementFor(
  chosen: string | null | undefined,
  fullName: string | null | undefined,
): Agreement {
  if (chosen === 'feminine') return 'feminine'
  if (chosen === 'masculine' || chosen === 'unspecified') return 'masculine'
  return genderFromName(fullName) ?? 'masculine'
}

/** "Bienvenido" / "Bienvenida". */
export function agree(agreement: Agreement, masculine: string, feminine: string) {
  return agreement === 'feminine' ? feminine : masculine
}
