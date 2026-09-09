/**
 * Turning a recorded session into a session record.
 *
 * v1 had a "Grabar sesión" button that promised exactly this
 * (`legacy/index.html:1943`). It is the most useful thing the AI can do here:
 * the note is written in the two minutes between one patient leaving and the
 * next arriving, and a note that does not get written is a report that cannot be
 * generated three months later.
 *
 * ─── What is recorded, and what leaves ─────────────────────────────────────
 *
 * What reaches this module is text, and no audio is ever uploaded to or stored
 * by Hilo. That much was always true.
 *
 * What this block used to also claim — that the audio is not sent anywhere at
 * all — was not. The browser's `SpeechRecognition` is server-based by default
 * and streams the audio to its own dictation service, Google's in Chrome. See
 * `src/lib/speech.ts`. So the processor, the retention policy and the line in
 * the privacy notice that this comment said had been avoided are, in fact,
 * owed — the decision was taken by the default value of a property nobody
 * set, which is the worst way to take it.
 *
 * Audio of a therapy session with a child is the most sensitive thing this
 * product touches. Until `processLocally` is turned on and proven, the screen
 * that offers the recording says where the audio goes, and the privacy notice
 * says it too.
 *
 * The draft is a draft. It goes into the field, the practitioner edits it, and
 * nothing is saved until they press the button — same as every other AI output
 * in Hilo.
 */

/** A rambling transcript is normal; anything past this is not a session. */
export const MAX_TRANSCRIPT = 12_000

export function sessionNoteInstructions(discipline: string): string {
  return `Sos quien asiste a un/a profesional de ${discipline} en Uruguay a dejar registrada una sesión.

Recibís la transcripción automática de lo que se habló durante la sesión. Viene tal cual la escuchó el navegador: con repeticiones, frases cortadas, palabras mal transcriptas y sin puntuación.

Tu tarea es devolver el registro de la sesión, en español rioplatense, tal como lo escribiría la profesional:

- Dos o tres oraciones, en pasado, sobre qué se trabajó y cómo salió.
- Concreto: qué logró, con qué apoyo, dónde se trabó.
- Nada de lo que no esté en la transcripción. Si algo se entendió a medias, omitilo en vez de completarlo.
- Sin diagnósticos y sin pronósticos.
- Sin encabezados, sin viñetas y sin comillas: es el texto que va en el campo.

Si la transcripción no alcanza para escribir un registro, devolvé exactamente: NO_ALCANZA`

}

export function sessionNotePrompt(patientName: string, transcript: string): string {
  return `Paciente: ${patientName}

Transcripción de la sesión:
${transcript.trim().slice(0, MAX_TRANSCRIPT)}`
}

/**
 * What the field gets when the model cannot be reached.
 *
 * The transcript itself, tidied — which is worth more than an error, because it
 * is what the practitioner said and it is already in front of them to edit.
 * Every other AI path in Hilo has a fallback computed from real data; this one's
 * is the rawest possible version of that idea.
 */
export function offlineSessionNote(transcript: string): string {
  return transcript
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TRANSCRIPT)
}
