import type { Agreement } from './grammatical-gender'

/**
 * El nombre del paciente no sale de Ombúa.
 *
 * Todo lo que va a la IA viaja con un marcador en lugar del nombre —"[NOMBRE]",
 * "[NOMBRE COMPLETO]", o "[P3]" cuando hay varios pacientes en juego— y lo que
 * vuelve se re-escribe con el nombre real antes de llegar a la pantalla. La IA
 * nunca ve quién es: sólo la edad, la escolaridad y lo que dicen las notas, que
 * es lo que hace falta para escribir el informe.
 *
 * El motivo es la transferencia internacional de la Ley 18.331 (art. 23): los
 * servidores de Anthropic están en EE.UU., y un dato de salud con nombre y
 * apellido de un menor es lo más sensible que maneja esta aplicación. Sin el
 * nombre, lo que viaja es mucho más difícil de atar a una persona.
 *
 * No es anonimización perfecta: una nota que dice "la hija del intendente" sigue
 * diciéndolo. Es la parte que se puede hacer sin perder el informe.
 *
 * Puro y sin dependencias, para poder probarlo sin nada alrededor.
 */

export type Alias = {
  /** Lo que viaja, con corchetes: "[NOMBRE]". */
  token: string
  /** Lo que vuelve a aparecer en el texto de la IA. */
  restoreAs: string
  /** Las formas que se tapan: nombre completo, nombre, apellido. */
  names: string[]
  /**
   * Con qué concordancia escribir sobre esa persona. Antes el modelo la
   * deducía del nombre; sin el nombre hay que decírsela. Ver
   * `src/lib/grammatical-gender.ts`.
   */
  agreement: Agreement
}

/** Las variantes de cada vocal, para que "Tomas" y "TOMÁS" también se tapen. */
const VARIANTS: Record<string, string> = {
  a: 'aáàäâ',
  e: 'eéèëê',
  i: 'iíìïî',
  o: 'oóòöô',
  u: 'uúùüû',
}

function strip(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

function escape(char: string) {
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Una expresión que encuentra el nombre entero, sin importar tildes ni mayúsculas. */
function nameMatcher(name: string) {
  const body = [...strip(name)]
    .map((char) => {
      if (VARIANTS[char]) return `[${VARIANTS[char]}]`
      if (/\s/.test(char)) return '\\s+'
      return escape(char)
    })
    .join('')
  // Bordes de palabra por letra, no `\b`: `\b` no sabe que "á" es una letra.
  return new RegExp(`(?<!\\p{L})${body}(?!\\p{L})`, 'giu')
}

/**
 * Las partes de un nombre que vale la pena tapar.
 *
 * El nombre completo primero —si no, "Tomás" se taparía antes y dejaría
 * "[NOMBRE] Pérez"— y después cada palabra de tres letras o más. Las cortas
 * ("de", "la", "Li") se dejan: taparían media gramática del informe.
 */
export function nameParts(fullName: string): string[] {
  const full = fullName.trim().replace(/\s+/g, ' ')
  if (!full) return []
  const words = full.split(' ').filter((word) => word.length >= 3)
  return [...new Set([full, ...words])]
}

/** Los dos marcadores de un informe sobre una persona. */
export function patientAliases(fullName: string, agreement: Agreement): Alias[] {
  const parts = nameParts(fullName)
  if (parts.length === 0) return []
  const first = fullName.trim().split(/\s+/)[0] ?? fullName
  return [
    {
      token: '[NOMBRE COMPLETO]',
      restoreAs: fullName.trim(),
      names: parts.slice(0, 1),
      agreement,
    },
    { token: '[NOMBRE]', restoreAs: first, names: parts.slice(1), agreement },
  ]
}

/** Tapa los nombres. Primero los más largos, para no partir uno compuesto. */
export function hideNames(text: string, aliases: Alias[]): string {
  const pairs = aliases
    .flatMap((alias) => alias.names.map((name) => ({ name, token: alias.token })))
    .sort((a, b) => b.name.length - a.name.length)

  let result = text
  for (const { name, token } of pairs) {
    result = result.replace(nameMatcher(name), token)
  }
  return result
}

/** Vuelve a poner los nombres donde la IA dejó los marcadores. */
export function revealNames(text: string, aliases: Alias[]): string {
  let result = text
  for (const alias of [...aliases].sort((a, b) => b.token.length - a.token.length)) {
    result = result.split(alias.token).join(alias.restoreAs)
  }
  return result
}

/**
 * `revealNames` sobre un stream, sin cortar un marcador al medio.
 *
 * El texto llega en pedazos, y "[NOM" puede terminar un pedazo y "BRE]"
 * empezar el siguiente. Se retiene lo que viene después del último "[" que
 * todavía no cerró, siempre que sea más corto que el marcador más largo; el
 * resto sale enseguida.
 */
export async function* revealStream(
  chunks: AsyncIterable<string>,
  aliases: Alias[],
): AsyncGenerator<string> {
  if (aliases.length === 0) {
    yield* chunks
    return
  }

  const longest = Math.max(...aliases.map((alias) => alias.token.length))
  let pending = ''

  for await (const chunk of chunks) {
    pending += chunk
    const open = pending.lastIndexOf('[')
    const held =
      open !== -1 && !pending.includes(']', open) && pending.length - open < longest
        ? pending.slice(open)
        : ''
    const ready = pending.slice(0, pending.length - held.length)
    pending = held
    if (ready) yield revealNames(ready, aliases)
  }

  if (pending) yield revealNames(pending, aliases)
}

/**
 * Lo que se le explica al modelo, al final del pedido, cuando hay marcadores.
 *
 * El género no es un detalle: antes el modelo lo deducía del nombre, y ahora no
 * lo tiene. Se le dice cuál usar con cada marcador.
 */
export function aliasInstructions(aliases: Alias[]): string {
  if (aliases.length === 0) return ''
  const tokens = aliases.map((alias) => alias.token).join(', ')
  const feminine = aliases.filter((alias) => alias.agreement === 'feminine')
  const masculine = aliases.filter((alias) => alias.agreement === 'masculine')
  const agreement = [
    feminine.length > 0
      ? `Con ${feminine.map((alias) => alias.token).join(', ')} usá concordancia femenina (ella, atenta, la paciente).`
      : '',
    masculine.length > 0
      ? `Con ${masculine.map((alias) => alias.token).join(', ')} usá concordancia masculina (él, atento, el paciente).`
      : '',
  ].filter(Boolean)
  return [
    `Por privacidad, los nombres de las personas vienen reemplazados por marcadores (${tokens}).`,
    'Escribilos exactamente así, con los corchetes, donde iría el nombre: Ombúa pone el nombre real después. No inventes nombres.',
    ...agreement,
  ].join(' ')
}

/**
 * Un marcador por paciente, para lo que habla de varios a la vez: el asistente.
 *
 * "[P1]", "[P2]"… y vuelven como los llama la pantalla (`label`: el nombre de
 * pila, o con inicial si dos se llaman igual). Una palabra que comparten dos
 * pacientes —dos Tomás— no se tapa sola, porque no se sabría a cuál devolverla;
 * se tapa el nombre completo y el apellido de cada uno.
 */
export function manyPatientAliases(
  patients: { fullName: string; label: string; agreement: Agreement }[],
): Alias[] {
  const owners = new Map<string, number>()
  for (const patient of patients) {
    for (const part of nameParts(patient.fullName)) {
      const key = strip(part)
      owners.set(key, (owners.get(key) ?? 0) + 1)
    }
  }

  return patients
    .map((patient, index) => ({
      token: `[P${index + 1}]`,
      restoreAs: patient.label,
      names: nameParts(patient.fullName).filter((part) => owners.get(strip(part)) === 1),
      agreement: patient.agreement,
    }))
    .filter((alias) => alias.names.length > 0)
}
