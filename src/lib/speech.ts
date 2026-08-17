/**
 * The browser's own speech recognition, typed.
 *
 * Two features use it — dictating into a field, and recording a whole session —
 * and they need the same three things: the constructor under either of its two
 * names, a way to ask whether it exists that does not break hydration, and
 * types, because `SpeechRecognition` is not in the DOM lib.
 *
 * **Nothing here uploads audio.** The browser turns speech into text and only
 * text ever leaves the page. That is the property the session recorder is built
 * on; see `src/server/session-notes.ts`.
 *
 * Where the API is missing — Firefox, and most iOS browsers — callers render
 * nothing and the practitioner uses the microphone on their own keyboard, which
 * does the same job. An offer that does nothing when tapped is worse than no
 * offer.
 */

export type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
}

export type SpeechRecognitionEventLike = {
  resultIndex: number
  results: { isFinal: boolean; 0: { transcript: string }; length: number }[] & {
    length: number
  }
}

export function recognitionCtor() {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

/**
 * For `useSyncExternalStore`: the server snapshot is `false`, so the control is
 * absent from the HTML and appears on hydration where the API exists. Deciding
 * this in an effect would render one frame with the wrong answer; deciding it
 * during render would be a hydration mismatch.
 */
export const speechStore = {
  subscribe: () => () => {},
  isSupportedOnClient: () => recognitionCtor() !== undefined,
  isSupportedOnServer: () => false,
}

/** A recogniser set up for how people actually speak here. */
export function newRecognition() {
  const Ctor = recognitionCtor()
  if (!Ctor) return null

  const recognition = new Ctor()
  recognition.lang = 'es-UY'
  recognition.interimResults = true
  recognition.continuous = true
  return recognition
}
