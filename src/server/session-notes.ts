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
 * The browser turns speech into text on its own — the same
 * `SpeechRecognition` the dictation button already uses. **No audio is uploaded,
 * stored, or sent anywhere**, and what reaches this module is text.
 *
 * That is a deliberate limit, not a shortcut. Audio of a therapy session with a
 * child is the most sensitive thing this product could hold; uploading it would
 * mean a new processor, a retention policy, and a line in the privacy notice.
 * Speech-to-text in the browser gets the same result — a written record the
 * practitioner reviews — without any of that. If real audio transcription is
 * ever wanted, it is a decision to take deliberately, and this file is where the
 * consequences start.
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
