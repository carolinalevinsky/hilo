/**
 * What to actually do about a goal, in one line.
 *
 * v1's `sugeActividad` (`legacy/index.html:1023`), ported as written. It is a
 * lookup from a fragment of a goal's wording to the activity a practitioner of
 * that discipline would reach for — "conciencia fonológica" → "segmentar y unir
 * sonidos con palmas".
 *
 * This is clinical domain knowledge, not a heuristic worth improving. It was
 * written by someone who does this work, it covers the six disciplines Hilo
 * serves, and every phrase is something you can do with a child on a Tuesday.
 * Keep the wording; add rows if a discipline is missing one.
 *
 * The keys are fragments matched against the goal with accents stripped from
 * both sides, longest-useful-prefix style: 'fonolog' catches "conciencia
 * fonológica", "fonológico" and somebody who typed it without the accent. Order
 * matters only in that the first match wins, which is why the specific '/r/'
 * sits above the general 'articul'.
 *
 * Matching used to compare the raw lowercased title against accented keys, and
 * two ordinary goals fell through to the fallback because of it: "cálculo" typed
 * without its accent missed 'cálcul', and "leer un texto" missed 'lector', which
 * only catches "lectora". A goal that reaches the fallback is told
 * "actividades graduadas centradas en ese objetivo", which is a polite way of
 * saying nothing. The rows below are unchanged clinical content — only their
 * keys were widened.
 */
const BANK: readonly (readonly [string, string])[] = [
  ['/r/', 'praxias linguales y repetición de la /r/ en palabras cortas'],
  ['articul', 'praxias y producción del fonema en sílaba, palabra y frase'],
  ['vocabul', 'lotería de imágenes por campo semántico'],
  ['oracion', 'armar frases con apoyo visual'],
  ['fonolog', 'segmentar y unir sonidos con palmas'],
  ['lect', 'lectura repetida de un texto breve'],
  ['leer', 'lectura repetida de un texto breve'],
  ['fluid', 'lectura cronometrada de listas de palabras'],
  ['atenci', 'tareas cortas de 10 minutos con pausa activa'],
  ['pinza', 'circuito de pinza: encastre, ensartado y pinzas'],
  ['sensor', 'circuito sensorial breve y dieta sensorial'],
  ['regula', 'estrategias de autorregulación (respiración, rincón de la calma)'],
  ['coordin', 'circuito de coordinación óculo-manual y bilateral'],
  ['avd', 'práctica guiada de la actividad de la vida diaria'],
  ['expres', 'juego de descripción de láminas'],
  ['enunci', 'ampliar frases sumando una palabra'],
  ['calcul', 'cálculo mental con material concreto'],
  ['concien', 'rimas y juegos con sonidos'],
  ['escrit', 'copia guiada respetando el renglón'],
  ['problem', 'resolver problemas cortos subrayando los datos'],
  ['memor', 'juegos de recordar secuencias'],
  ['lengua', 'juego oral ampliando cada respuesta'],
  ['soplo', 'juegos de soplo graduados con sorbete y burbujas'],
  ['voz', 'ejercicios de proyección y cuidado de la voz'],
  ['ansied', 'respiración de la caja y registro de disparadores'],
  ['emocion', 'termómetro emocional y diario de emociones'],
  ['social', 'role-play de situaciones y semáforo social'],
  ['sueno', 'pauta de higiene del sueño'],
  ['equilib', 'circuito de equilibrio estático y dinámico'],
  ['esquema', 'juego de reconocimiento del propio cuerpo'],
  ['lateral', 'juegos de derecha/izquierda y orientación espacial'],
  ['rango', 'movilidad articular progresiva'],
  ['elong', 'elongación sostenida de la cadena trabajada'],
  ['fuerza', 'fortalecimiento con progresión de carga'],
  ['marcha', 'reeducación de la marcha con apoyos'],
  ['propio', 'ejercicios propioceptivos sobre superficie inestable'],
  ['dolor', 'dosificar la carga y pautas para casa'],
] as const

/** v1's fallback, word for word. Vague on purpose: it is honest about knowing nothing. */
const FALLBACK = 'actividades graduadas centradas en ese objetivo'

export function suggestedActivity(goalTitle: string): string {
  const text = withoutAccents(goalTitle)
  return BANK.find(([key]) => text.includes(key))?.[1] ?? FALLBACK
}

/** Lowercase with accents stripped, so "fonológica" and "fonologica" both match. */
function withoutAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}
