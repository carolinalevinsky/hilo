import { describe, expect, it } from 'vitest'

import { assessmentFallback, assessmentUserPrompt } from './assessment-prompt'
import { bandScores, suggestedGoals } from './assessments'

/**
 * Score interpretation.
 *
 * This is the part of the AI feature where being wrong is a clinical error
 * rather than an awkward sentence: 85 is a *descended* standard score and a
 * perfectly good percentile, and v1 was observed writing "sostener los logros"
 * about an area that was weak.
 */

const SCORES = { 'Comprensión verbal': 85, 'Memoria de trabajo': 100, Visoespacial: 120 }

describe('bandScores', () => {
  it('reads a standard score against a mean of 100', () => {
    const bands = bandScores({ scale: 'standard', scores: SCORES, prose: '' })

    expect(bands.low.map((entry) => entry.area)).toEqual(['Comprensión verbal'])
    expect(bands.average.map((entry) => entry.area)).toEqual(['Memoria de trabajo'])
    expect(bands.high.map((entry) => entry.area)).toEqual(['Visoespacial'])
  })

  it('reads the same numbers completely differently as percentiles', () => {
    // The whole reason the scale field exists. 85 is descended on one scale and
    // a strength on the other, and nothing in the number says which.
    const bands = bandScores({ scale: 'percentile', scores: SCORES, prose: '' })

    expect(bands.low).toEqual([])
    expect(bands.high.map((entry) => entry.area)).toEqual([
      'Comprensión verbal',
      'Memoria de trabajo',
      'Visoespacial',
    ])
  })

  it('refuses to band raw scores', () => {
    // A raw score has no norms. Sorting ungraded numbers into "low" and "high"
    // would be inventing a baseline, which is exactly what the clinical
    // instructions forbid.
    const bands = bandScores({ scale: 'raw', scores: SCORES, prose: '' })

    expect(bands).toEqual({ low: [], average: [], high: [] })
  })
})

describe('suggestedGoals', () => {
  it('proposes the weakest areas first, capped at three', () => {
    const goals = suggestedGoals(
      {
        scale: 'standard',
        scores: { Lectura: 70, Cálculo: 80, Atención: 85, Memoria: 88, Lenguaje: 105 },
        prose: '',
      },
      'Batería EVALÚA',
    )

    expect(goals).toEqual([
      'Mejorar lectura',
      'Mejorar cálculo',
      'Mejorar atención',
    ])
  })

  it('falls back to the instrument when there is only prose', () => {
    const goals = suggestedGoals(
      { scale: 'raw', scores: {}, prose: 'Omite la /r/ en grupos consonánticos.' },
      'Evaluación fonológica',
    )

    expect(goals).toEqual(['Trabajar sobre lo detectado en Evaluación fonológica'])
  })
})

describe('assessmentUserPrompt', () => {
  it('tells the model which scale the numbers are on, and where the cut-offs are', () => {
    const prompt = assessmentUserPrompt({
      instrumentName: 'WISC-V (inteligencia)',
      patientName: 'Malena Rodríguez',
      age: '7 años',
      results: { scale: 'standard', scores: SCORES, prose: '' },
    })

    expect(prompt).toContain('Tipo de puntaje: Puntaje estándar (media 100)')
    expect(prompt).toContain('por debajo de 90 se considera descendido')
    expect(prompt).toContain('desde 110 se considera fortaleza')
  })

  it('tells it not to classify raw scores at all', () => {
    const prompt = assessmentUserPrompt({
      instrumentName: 'Prueba de cálculo',
      patientName: 'Malena Rodríguez',
      age: '7 años',
      results: { scale: 'raw', scores: { 'Cálculo mental': 14 }, prose: '' },
    })

    expect(prompt).toContain('sin baremo')
    expect(prompt).toContain('no los clasifiques como altos o bajos')
  })

  it('does not hand the model the pre-sorted answer', () => {
    // Rule 2 asks the model to interpret. Passing it "these are the low ones"
    // would reduce that to relabelling — the bands exist for the offline draft.
    const prompt = assessmentUserPrompt({
      instrumentName: 'WISC-V (inteligencia)',
      patientName: 'Malena Rodríguez',
      age: '7 años',
      results: { scale: 'standard', scores: SCORES, prose: '' },
    })

    expect(prompt).not.toContain('Áreas descendidas:')
    expect(prompt).not.toContain('Fortalezas:')
  })
})

describe('assessmentFallback', () => {
  it('states where the scores fall and stops short of interpreting', () => {
    const draft = assessmentFallback({
      instrumentName: 'WISC-V (inteligencia)',
      patientName: 'Malena Rodríguez',
      age: '7 años',
      results: { scale: 'standard', scores: SCORES, prose: '' },
    })

    expect(draft).toContain('Áreas descendidas:')
    expect(draft).toContain('comprensión verbal (85)')
    expect(draft).toContain('Se sugiere priorizar la intervención en comprensión verbal')
  })

  it('says "a completar" rather than inventing an orientation', () => {
    const draft = assessmentFallback({
      instrumentName: 'Prueba de cálculo',
      patientName: 'Malena Rodríguez',
      age: '7 años',
      results: { scale: 'raw', scores: { 'Cálculo mental': 14 }, prose: '' },
    })

    expect(draft).toContain('A completar según el criterio profesional.')
  })
})
