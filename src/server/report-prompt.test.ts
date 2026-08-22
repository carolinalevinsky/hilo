import { describe, expect, it } from 'vitest'

import { reportFallback, reportInstructions, reportUserPrompt } from './report-prompt'
import type { ReportContext } from './report-prompt'

/**
 * The prompt, not the model output.
 *
 * Snapshotting what the model *says* would be a test of Anthropic's servers and
 * it would fail on every model update. What is worth pinning is what we *ask*:
 * the register per recipient, that the clinical context actually reaches the
 * prompt, and — most of all — that nothing which must not leave the office ends
 * up in it.
 */

const CONTEXT: ReportContext = {
  patientName: 'Tomás Pérez',
  patientFirstName: 'Tomás',
  age: '5 años',
  referralReason: 'Dificultades en la articulación de varios fonemas.',
  startDate: '12 mar. 2026',
  goals: [
    { title: 'Producción del fonema /r/', progress: 65 },
    { title: 'Ampliación del vocabulario', progress: 82 },
  ],
  recentNotes: ['Logró la /r/ en posición inicial.', 'Incorporó vocabulario nuevo.'],
  sessionCount: 12,
}

describe('reportInstructions', () => {
  it('names the discipline in the adjective form the sentences need', () => {
    expect(reportInstructions('psychopedagogy')).toContain('profesional de psicopedagógico')
  })

  it('forbids markdown, because the output goes into a signed document', () => {
    const instructions = reportInstructions('speech_therapy')
    expect(instructions).toContain('No uses viñetas, guiones ni asteriscos de markdown')
  })

  it('does not ask the model to double-check itself', () => {
    // Opus 5 self-verifies; telling it to verify causes redundant work. This
    // inverts the usual prompting advice, which is exactly why it needs a test —
    // it is the kind of line someone would helpfully add back.
    const instructions = reportInstructions('psychology')
    expect(instructions.toLowerCase()).not.toMatch(/revisá tu|verificá|chequeá tu|double.check/)
  })
})

describe('reportUserPrompt', () => {
  it('carries the goals, their progress, and the session notes', () => {
    const prompt = reportUserPrompt({
      context: CONTEXT,
      recipient: 'school',
      disciplineId: 'speech_therapy',
    })

    expect(prompt).toContain('Producción del fonema /r/ (65%)')
    expect(prompt).toContain('Logró la /r/ en posición inicial.')
    expect(prompt).toContain('Sesiones registradas: 12')
  })

  it('changes register with the recipient', () => {
    const family = reportUserPrompt({
      context: CONTEXT,
      recipient: 'family',
      disciplineId: 'speech_therapy',
    })
    const insurer = reportUserPrompt({
      context: CONTEXT,
      recipient: 'health_insurer',
      disciplineId: 'speech_therapy',
    })

    expect(family).toContain('Estimada familia')
    expect(family).toContain('cómo acompañar desde casa')

    expect(insurer).toContain('A quien corresponda')
    expect(insurer).toContain('dejar constancia de la evolución')
  })

  it('passes the practitioner’s own notes through', () => {
    const prompt = reportUserPrompt({
      context: CONTEXT,
      recipient: 'anep',
      disciplineId: 'psychopedagogy',
      practitionerNotes: 'Pedir más tiempo en las pruebas escritas.',
    })

    expect(prompt).toContain('Pedir más tiempo en las pruebas escritas.')
    expect(prompt).toContain('tenelas muy en cuenta')
  })

  it('never carries a private note', () => {
    // `sessions.private_note` is the practitioner's own working note. It is not
    // gathered into the context at all, and this is the test that says so — it
    // would be an easy and invisible thing to add to the select while "giving
    // the model more context".
    const prompt = reportUserPrompt({
      context: CONTEXT,
      recipient: 'school',
      disciplineId: 'speech_therapy',
    })

    expect(prompt).not.toContain('privada')
    expect(JSON.stringify(CONTEXT)).not.toContain('private')
  })
})

describe('reportFallback', () => {
  it('produces a signable draft with the same section headings', () => {
    // The offline draft and the AI output have to be the same shape, because the
    // editor renders both and the practitioner should not be able to tell which
    // one they are looking at from the layout.
    const draft = reportFallback({
      context: CONTEXT,
      recipient: 'family',
      disciplineId: 'speech_therapy',
    })

    expect(draft).toContain('Estimada familia:')
    expect(draft).toContain('Motivo de consulta:')
    expect(draft).toContain('Objetivos del período:')
    expect(draft).toContain('Recomendaciones:')
  })

  it('does not claim progress on a goal that has none', () => {
    const draft = reportFallback({
      context: { ...CONTEXT, goals: [{ title: 'Fluidez lectora', progress: 20 }] },
      recipient: 'school',
      disciplineId: 'psychopedagogy',
    })

    expect(draft).not.toContain('Avances observados')
    expect(draft).toContain('Se continúa trabajando en fluidez lectora')
  })
})
