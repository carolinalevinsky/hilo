import { suggestedActivity } from '@/lib/activity-bank'

/**
 * Designing a therapeutic activity from a sentence.
 *
 * v1's "Generar material con IA" (`legacy/index.html:2305`): you say what you
 * need to work on, with which area and which age, and get back an activity you
 * can run in the next session. Its system prompt is ported almost word for word
 * — it asks for the four things a practitioner actually needs, in that order,
 * and the shape it produces is the shape the rest of the library already has.
 *
 * ─── What is and is not in the prompt ─────────────────────────────────────
 *
 * **No patient goes into this request.** Not a name, not an age in months, not a
 * goal as it was written on a ficha. The inputs are an area, an age band and a
 * sentence the practitioner typed — the same three things v1 sent — because a
 * material is a worksheet, and a worksheet does not need to know who it is for.
 * That is also what makes the result shareable: a generated material can be
 * published to the community without anything clinical riding along inside it.
 *
 * The result is a draft. It lands in the library marked "Generado con IA", the
 * practitioner reads and edits it, and nothing is published unless they say so.
 */

/** A prompt longer than this is not a request, it is a document. */
export const MAX_REQUEST = 400

export function materialInstructions(discipline: string): string {
  // v1's system prompt (`legacy/index.html:2316`), extended only with the
  // formatting convention this codebase renders — v1 asked for HTML, which is
  // how it ended up with `dangerouslySetInnerHTML`-shaped problems.
  return `Sos asistente de un/a profesional de ${discipline} en Uruguay. Diseñás una actividad terapéutica breve y concreta en español rioplatense para trabajar en sesión.

Devolvés, en este orden y con estos títulos exactos:

Objetivo:
Qué se trabaja, en una oración.

Materiales:
Lo que hace falta. Cosas que se consiguen: papel, lápiz, imágenes, objetos de la casa.

Paso a paso:
La consigna, numerada, como se la das al niño o a la niña. Concreta y corta.

Variación más fácil:
Qué sacar o qué apoyo sumar.

Variación más difícil:
Qué sacar de apoyo o qué paso agregar.

Reglas:
- Claro y aplicable. Nada de teoría ni de justificación.
- No inventes materiales comerciales, tests ni marcas.
- Nada de diagnósticos, pronósticos ni afirmaciones sobre ningún niño en particular.
- Cada título va en su propia línea y termina en dos puntos. El resto, párrafos o una lista numerada.
- Sin encabezados de más, sin markdown, sin HTML.`
}

export function materialPrompt(input: {
  area: string
  ageRange: string
  request: string
}): string {
  return `Área: ${input.area}
Edad: ${input.ageRange}
Trabajar: ${input.request.trim().slice(0, MAX_REQUEST)}`
}

/** An activity is long, but not a report. Past this it is not one activity. */
export const MAX_MATERIAL = 8_000

/**
 * "Modificar con IA": the same activity, changed the way you asked.
 *
 * v1's version (`legacy/index.html:2320`) did not really do this — it appended a
 * canned paragraph to the bottom of the document based on which words it spotted
 * in your request, so asking for "más fácil" and "con dinosaurios" produced the
 * same two sentences with a different label. This one rewrites the activity.
 *
 * Rewrites, rather than appending: a practitioner asking for the easier version
 * wants the easier version, not the harder one with a note underneath about how
 * to make it easier.
 */
export function materialAdjustmentPrompt(input: {
  area: string
  ageRange: string
  content: string
  adjustment: string
}): string {
  return `Área: ${input.area}
Edad: ${input.ageRange}

Esta es la actividad actual:
---
${input.content.trim().slice(0, MAX_MATERIAL)}
---

Reescribila entera con este cambio: ${input.adjustment.trim().slice(0, MAX_REQUEST)}

Devolvé la actividad completa con la misma estructura de títulos, ya con el cambio aplicado. No expliques qué cambiaste ni agregues notas al final.`
}

/**
 * Describing a material the practitioner already had, from a scan or a photo.
 *
 * The model reads the file and writes what it is, so the library has words to
 * search and match on — `bestMaterialFor` works on text, and a PDF with no
 * description is a title nobody will ever be offered again.
 *
 * **The draft is never saved without being read.** It lands in the same form the
 * practitioner is already looking at, they correct it, and nothing is stored
 * until they press the button. That is the whole shape of the feature: the model
 * does the typing, the person does the deciding.
 *
 * Two rules in here earn their place. It must not invent what it cannot see — a
 * blurry photo should produce a short honest description, not a confident wrong
 * one. And it must not copy a worksheet out in full: the file is already
 * attached, so repeating its contents adds nothing and would quietly turn a
 * scanned page of somebody else's book into text in this database.
 */
export function fileDescriptionInstructions(discipline: string): string {
  return `Sos asistente de un/a profesional de ${discipline} en Uruguay. Recibís el archivo de un material de trabajo que la profesional ya tenía —un PDF o una foto de una ficha, un juego o una lámina— y lo describís para que quede guardado en su biblioteca.

Devolvés exactamente estas tres partes, en este orden y con estos títulos:

TITULO:
Un título corto, de menos de ocho palabras.

OBJETIVO:
Para qué sirve, en una oración: qué se trabaja con esto.

DESCRIPCION:
Qué es el material y cómo se usa, en dos o tres oraciones. Si se ve la consigna, resumila.

Reglas:
- Escribí en español rioplatense.
- **No inventes.** Si la imagen está borrosa o no se entiende qué es, decilo en la descripción y sé breve. Una descripción corta y honesta sirve; una inventada arruina la búsqueda.
- **No transcribas el material entero.** El archivo queda adjunto; acá va una descripción, no una copia.
- Si aparece el nombre de un niño o cualquier dato de un paciente, no lo incluyas.
- Sin encabezados de más, sin markdown, sin comillas.`
}

export function fileDescriptionPrompt(area: string): string {
  return `Área de la biblioteca donde se va a guardar: ${area}.

Describí el material adjunto.`
}

/**
 * Splits the three-part answer into the three fields it fills.
 *
 * Tolerant on purpose: if the model drops a heading, whatever came back still
 * reaches the practitioner as the description rather than vanishing into a
 * parse error. The worst case is that they retype a title.
 */
export function parseFileDescription(text: string): {
  title: string
  objective: string
  content: string
} {
  const section = (name: string) => {
    const match = text.match(
      new RegExp(`${name}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:TITULO|OBJETIVO|DESCRIPCION):|$)`, 'i'),
    )
    return match?.[1]?.trim() ?? ''
  }

  const title = section('TITULO')
  const objective = section('OBJETIVO')
  const content = section('DESCRIPCION')

  return {
    title: title.slice(0, 160),
    objective,
    // Nothing recognised: hand back the whole answer rather than nothing.
    content: content || (title || objective ? '' : text.trim()),
  }
}

/**
 * What lands in the library when the model cannot be reached.
 *
 * v1 had the same idea — a bank of one-line activities per area, used whenever
 * `IA_ON` was false (`legacy/index.html:2311`). This version leans on the
 * activity bank instead, which is the same knowledge kept in one place and
 * already keyed by what is being worked on rather than by area.
 *
 * It is deliberately a real, usable activity rather than an apology. A
 * practitioner who asked for something two minutes before a session should get
 * something they can run.
 */
export function offlineMaterial(input: { ageRange: string; request: string }): string {
  const request = input.request.trim()
  const lower = request.charAt(0).toLowerCase() + request.slice(1)

  return `Objetivo:
${request.charAt(0).toUpperCase() + request.slice(1)}.

Materiales:
Lo que tengas a mano: papel, lápiz, imágenes u objetos de todos los días.

Paso a paso:
1. Mostrá la actividad con un ejemplo hecho por vos.
2. Que la resuelva con tu apoyo, y andá sacando la ayuda de a poco.
3. Cerrá con una versión que pueda hacer solo, para afianzar el logro.

Actividad sugerida: ${suggestedActivity(request)}, para ${input.ageRange}.

Variación más fácil:
Menos pasos, más apoyo visual y un ejemplo antes de cada intento.

Variación más difícil:
Sin apoyos, un paso más, o pedirle que explique cómo lo resolvió.

Escrito por Hilo sin conexión al modelo, a partir de "${lower}". Revisalo y ajustalo antes de usarlo.`
}
