/**
 * "Primeros pasos" sends the practitioner to the real screen for each step, and
 * that screen says what to do there. Which sentence it says travels in the URL
 * (`?pasos=<name>`), so it survives a reload and leaves with the next link.
 *
 * It only ever chooses a sentence. Nothing is decided by it: what brings
 * somebody back to Inicio after a step is what they saved, read on the server
 * (`src/server/first-steps.ts`), not a parameter anyone can type.
 */
export const STEP_HINTS = ['paciente', 'planificar', 'pagos'] as const

export type StepHintName = (typeof STEP_HINTS)[number]

/** The hint the URL asks for, if it is one this screen has. Anything else is nothing. */
export function readStepHint<Name extends StepHintName>(
  param: string | string[] | undefined,
  allowed: readonly Name[],
): Name | null {
  return typeof param === 'string' && (allowed as readonly string[]).includes(param)
    ? (param as Name)
    : null
}
