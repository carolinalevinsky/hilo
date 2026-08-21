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

/**
 * Lo que salió mal, dicho en castellano.
 *
 * Los dos botones que usan esto tenían un `onerror` que apagaba el estado y no
 * decía nada. Desde afuera, "el navegador me pidió permiso, se lo di, y no pasa
 * nada" es indistinguible de una función rota — y el motivo real, que casi
 * siempre es del entorno y no del código, se queda adentro del evento.
 *
 * `aborted` devuelve null a propósito: es lo que dispara parar uno mismo, y
 * avisar de algo que acabás de hacer vos es ruido.
 *
 * Los códigos son los de la Web Speech API. El caso por defecto incluye el
 * código crudo: no significa nada para quien lo lee, pero es lo único con lo que
 * se puede pedir ayuda.
 */
export function speechErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case 'aborted':
      return null
    case 'not-allowed':
    case 'service-not-allowed':
      return 'El navegador bloqueó el micrófono. Habilitalo para este sitio y probá de nuevo.'
    case 'audio-capture':
      return 'No encontramos ningún micrófono. Fijate que esté conectado y elegido en el sistema.'
    case 'no-speech':
      return 'No se escuchó nada. Acercate al micrófono y probá de nuevo.'
    case 'network':
      return 'El dictado necesita internet para funcionar y no se pudo conectar.'
    case 'language-not-supported':
      return 'Tu navegador no tiene el español de Uruguay para dictar.'
    default:
      return `No pudimos usar el dictado${code ? ` (${code})` : ''}. Probá de nuevo.`
  }
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
