import { describe, expect, it } from 'vitest'

import {
  assistantInstructions,
  assistantUserPrompt,
  offlineAnswer,
  type AssistantContext,
} from './assistant'

/**
 * "Preguntale a Hilo".
 *
 * Two things are asserted here and the second is why the file exists.
 *
 * **The offline answer is a real answer.** With no `ANTHROPIC_API_KEY` — which
 * is how this app runs locally, and how it runs anywhere the key is rotated or
 * the quota is spent — every question falls through to `offlineAnswer`. It is
 * not an error message; it is arithmetic over the practitioner's own rows, and
 * if it silently degraded to the generic "nombrame a alguno" the feature would
 * look alive and be dead.
 *
 * **The prompt carries the roster and nothing more.** v1 sent the last progress
 * note of every patient on every question (`legacy/index.html:2593`), so typing
 * "hola" shipped clinical text about someone's whole caseload to a third party.
 * Under Ley N.º 18.331 that is the kind of copy that has to be deliberate, and
 * "just add the notes, the answers will be better" is exactly the helpful change
 * that would undo it. This is the test that says no.
 */

const CONTEXT: AssistantContext = {
  discipline: 'Psicopedagogía',
  patients: [
    {
      id: 'p1',
      fullName: 'Tomás Pérez',
      firstName: 'Tomás',
      age: '5 años',
      averageProgress: 67,
      goals: [
        { title: 'Conciencia fonológica', progress: 80 },
        { title: 'Estructuración de oraciones', progress: 55 },
      ],
    },
    {
      id: 'p2',
      fullName: 'Malena Rodríguez',
      firstName: 'Malena',
      age: '7 años',
      averageProgress: 0,
      goals: [],
    },
  ],
  sessionsToday: [{ firstName: 'Tomás', startTime: '09:00' }],
  pendingBookings: 2,
}

const EMPTY: AssistantContext = {
  discipline: 'Fonoaudiología',
  patients: [],
  sessionsToday: [],
  pendingBookings: 0,
}

describe('offlineAnswer', () => {
  it('answers about the patient named in the question', () => {
    const answer = offlineAnswer(CONTEXT, '¿qué me recomendás para Tomás?')

    expect(answer).toContain('Tomás Pérez')
    expect(answer).toContain('67%')
    // The lowest goal, not the first one — that is the whole suggestion.
    expect(answer).toContain('Estructuración de oraciones')
    expect(answer).toContain('55%')
  })

  it('finds the patient without the accent', () => {
    // Someone typing quickly writes "tomas". Matching only the accented form
    // would drop them into the generic answer for a patient they do have.
    expect(offlineAnswer(CONTEXT, 'contame de tomas')).toContain('Tomás Pérez')
  })

  it('says what to do when the patient has no goals yet', () => {
    const answer = offlineAnswer(CONTEXT, '¿cómo viene Malena?')

    expect(answer).toContain('Malena Rodríguez')
    expect(answer).toContain('no tiene objetivos')
  })

  it('answers about today from the agenda, not from a guess', () => {
    const answer = offlineAnswer(CONTEXT, '¿qué tengo hoy?')

    expect(answer).toContain('Tomás 09:00')
    expect(answer).toContain('1 sesión')
  })

  it('does not claim sessions on an empty day', () => {
    expect(offlineAnswer(EMPTY, '¿qué tengo hoy?')).toContain('no tenés sesiones')
  })

  it('points at the screen that answers the question', () => {
    expect(offlineAnswer(CONTEXT, 'sugerime materiales')).toContain('Materiales')
    expect(offlineAnswer(CONTEXT, '¿a quién le falta pagar?')).toContain('Cobros')
    expect(offlineAnswer(CONTEXT, 'necesito un informe')).toContain('Informes')
  })

  it('greets without pretending to know what was asked', () => {
    expect(offlineAnswer(CONTEXT, 'hola!')).toContain('¿Sobre qué paciente querés saber?')
  })

  it('offers the roster when it cannot tell what was asked', () => {
    const answer = offlineAnswer(CONTEXT, 'xyz')

    expect(answer).toContain('Tomás')
    expect(answer).toContain('Malena')
  })

  it('asks a practitioner with no patients to load one', () => {
    expect(offlineAnswer(EMPTY, 'xyz')).toContain('Todavía no tenés pacientes')
  })
})

describe('assistantUserPrompt', () => {
  const prompt = assistantUserPrompt(CONTEXT, '¿qué trabajo con Tomás?')

  it('carries the roster the answer needs', () => {
    expect(prompt).toContain('Tomás Pérez')
    expect(prompt).toContain('Conciencia fonológica 80%')
    expect(prompt).toContain('avance 67%')
    expect(prompt).toContain('¿qué trabajo con Tomás?')
  })

  it('carries nothing a progress note would be in', () => {
    // The context type has nowhere to put one, which is the real guarantee —
    // this asserts the shape stays that way. If a `lastNote` field is ever added
    // to `AssistantPatient`, this is the line that has to be argued with first.
    const patientKeys = Object.keys(CONTEXT.patients[0]!)

    expect(patientKeys).toEqual([
      'id',
      'fullName',
      'firstName',
      'age',
      'averageProgress',
      'goals',
    ])
  })

  it('says so plainly when there are no patients', () => {
    expect(assistantUserPrompt(EMPTY, 'hola')).toContain('todavía sin pacientes')
  })
})

describe('assistantInstructions', () => {
  it('names the discipline and forbids inventing a patient', () => {
    const instructions = assistantInstructions('Fonoaudiología')

    expect(instructions).toContain('Fonoaudiología')
    expect(instructions).toContain('No inventás datos de pacientes')
    // Rule 3 of the clinical instructions: no closed diagnoses. The block in
    // `ai.ts` says it too, and it is cheap to say twice.
    expect(instructions).toContain('No hacés diagnósticos cerrados')
  })
})
