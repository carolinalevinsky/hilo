/**
 * The questionnaires a patient can answer from a link: PHQ-9 and GAD-7.
 *
 * ─── The wording is not written here, on purpose ───────────────────────────
 *
 * These are validated instruments. Their Spanish wording was translated and
 * tested as a whole, and a question reworded into rioplatense — "¿con qué
 * frecuencia te molestó…" instead of the published "¿con qué frecuencia le han
 * molestado…" — is no longer the instrument whose cut-offs are below. So the
 * texts are not paraphrased, not adapted to `vos`, and not typed from memory:
 * they are pasted verbatim from the official Spanish version, by a person who
 * checked the source. Both are free to reproduce and use (Pfizer, the copyright
 * holder, requires no permission).
 *
 * Until every text below is filled in, `scaleIsReady` is false and Hilo does
 * not offer to send that scale. A questionnaire with a placeholder where a
 * question should be must never reach a patient.
 *
 * ─── What *is* written here ────────────────────────────────────────────────
 *
 * The structure (how many items, scored 0–3) and the published severity
 * cut-offs, which are numbers, not text:
 *
 *   PHQ-9  0–4 mínima · 5–9 leve · 10–14 moderada · 15–19 moderadamente severa · 20–27 severa
 *   GAD-7  0–4 mínima · 5–9 leve · 10–14 moderada · 15–21 severa
 *
 * A score is a screening aid, not a diagnosis — the same rule as the clinical
 * prompt in `src/server/ai.ts`. The ficha says "puntaje" and a band, never a
 * disorder.
 */

export const SCALE_IDS = ['phq9', 'gad7'] as const
export type ScaleId = (typeof SCALE_IDS)[number]

/** Where the official Spanish text is, for whoever fills in the wording. */
export const OFFICIAL_SOURCE =
  'https://uwhatc.uw.edu/PDF/TF-%20CBT/pages/3%20Assessment/Standardized%20Measures/PHQ9_Spanish%20for%20the%20USA.pdf'

export type ScaleDefinition = {
  id: ScaleId
  /** Short name, as clinicians say it. */
  name: string
  /** What it screens, in plain words, for the ficha. */
  about: string
  /** The sentence above the items, verbatim from the official version. */
  instruction: string
  /** The items, verbatim, in order. */
  items: string[]
  /** The four answers, verbatim, scored 0 to 3 in this order. */
  options: [string, string, string, string]
  /** The closing question about daily life, verbatim. Not scored. */
  difficultyQuestion: string
  difficultyOptions: [string, string, string, string]
  /** Upper bound of each band, inclusive, with its label. */
  bands: { upTo: number; label: string }[]
  maxScore: number
}

/** Marks a text that still has to be pasted from the official version. */
const PASTE = '[PEGAR TEXTO OFICIAL]'

export const SCALES: Record<ScaleId, ScaleDefinition> = {
  phq9: {
    id: 'phq9',
    name: 'PHQ-9',
    about: 'Síntomas depresivos en las últimas dos semanas',
    instruction: PASTE,
    items: [PASTE, PASTE, PASTE, PASTE, PASTE, PASTE, PASTE, PASTE, PASTE],
    options: [PASTE, PASTE, PASTE, PASTE],
    difficultyQuestion: PASTE,
    difficultyOptions: [PASTE, PASTE, PASTE, PASTE],
    bands: [
      { upTo: 4, label: 'mínima' },
      { upTo: 9, label: 'leve' },
      { upTo: 14, label: 'moderada' },
      { upTo: 19, label: 'moderadamente severa' },
      { upTo: 27, label: 'severa' },
    ],
    maxScore: 27,
  },
  gad7: {
    id: 'gad7',
    name: 'GAD-7',
    about: 'Síntomas de ansiedad en las últimas dos semanas',
    instruction: PASTE,
    items: [PASTE, PASTE, PASTE, PASTE, PASTE, PASTE, PASTE],
    options: [PASTE, PASTE, PASTE, PASTE],
    difficultyQuestion: PASTE,
    difficultyOptions: [PASTE, PASTE, PASTE, PASTE],
    bands: [
      { upTo: 4, label: 'mínima' },
      { upTo: 9, label: 'leve' },
      { upTo: 14, label: 'moderada' },
      { upTo: 21, label: 'severa' },
    ],
    maxScore: 21,
  },
}

/** True only when every text of the scale has been pasted in. */
export function scaleIsReady(id: ScaleId): boolean {
  const scale = SCALES[id]
  const texts = [
    scale.instruction,
    ...scale.items,
    ...scale.options,
    scale.difficultyQuestion,
    ...scale.difficultyOptions,
  ]
  return texts.every((text) => text.trim() !== '' && !text.includes(PASTE))
}

/** "moderada", for a total. */
export function severityBand(id: ScaleId, total: number): string {
  const band = SCALES[id].bands.find((b) => total <= b.upTo)
  return band?.label ?? SCALES[id].bands.at(-1)!.label
}

/** PHQ-9's ninth item is about self-harm; any answer above 0 is a flag. */
export const SELF_HARM_ITEM_INDEX = 8

/**
 * Where to call right now, in Uruguay. Línea Vida de ASSE and the MSP: free,
 * 24 hours, whatever the person's health provider. Confirmed on gub.uy and
 * asse.com.uy on 11 September 2026.
 */
export const CRISIS_LINE = {
  name: 'Línea Vida de prevención del suicidio',
  landline: '0800 0767',
  mobile: '*0767',
} as const
