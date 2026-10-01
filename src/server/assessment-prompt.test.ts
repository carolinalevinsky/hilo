import { describe, expect, it } from 'vitest'

import { TO_COMPLETE } from '@/lib/to-complete'

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
    // Dónde caen los puntajes es dato; qué hacer con eso es criterio, y el
    // borrador de emergencia no lo tiene.
    expect(draft).not.toContain('Se sugiere priorizar')
    expect(draft).toContain(`Orientaciones para la intervención:\n${TO_COMPLETE}`)
  })

  it('says "a completar" rather than inventing an orientation', () => {
    const draft = assessmentFallback({
      instrumentName: 'Prueba de cálculo',
      patientName: 'Malena Rodríguez',
      age: '7 años',
      results: { scale: 'raw', scores: { 'Cálculo mental': 14 }, prose: '' },
    })

    expect(draft).toContain(TO_COMPLETE)
  })
})

/**
 * Instrumentos donde más puntaje es peor. Antes todo se leía como un test de
 * rendimiento: un BDI-II de 32 —depresión grave— salía como fortaleza y los
 * objetivos sugeridos apuntaban al área que estaba bien.
 */
describe('instruments where a higher score is worse', () => {
  const BECK = 'Beck (BDI-II · depresión)'
  const STAI = 'STAI (ansiedad)'

  it('a severe Beck is an area to work on, with its band', () => {
    const results = { scale: 'raw' as const, scores: { 'Puntaje total BDI-II': 32 }, prose: '' }

    expect(bandScores(results, BECK).low).toEqual([{ area: 'Puntaje total BDI-II', value: 32 }])

    const draft = assessmentFallback({
      instrumentName: BECK,
      patientName: 'Ana',
      age: '34 años',
      results,
    })
    expect(draft).not.toContain('Fortalezas')
    expect(draft).toContain('puntaje total bdi-ii (32, grave)')
  })

  it('tells the model the direction and the published cut-offs', () => {
    const prompt = assessmentUserPrompt({
      instrumentName: BECK,
      patientName: 'Ana',
      age: '34 años',
      results: { scale: 'raw', scores: { 'Puntaje total BDI-II': 32 }, prose: '' },
    })

    expect(prompt).toContain('un puntaje más alto indica más severidad')
    expect(prompt).toContain('0 a 13, mínima; 14 a 19, leve; 20 a 28, moderada; 29 a 63, grave')
    expect(prompt).not.toContain('no los clasifiques como altos o bajos')
  })

  it('a high anxiety percentile is a difficulty, not a strength', () => {
    const results = {
      scale: 'percentile' as const,
      scores: { 'Ansiedad estado': 90, 'Ansiedad rasgo': 10 },
      prose: '',
    }

    const bands = bandScores(results, STAI)
    expect(bands.low.map((score) => score.area)).toEqual(['Ansiedad estado'])
    expect(bands.high).toEqual([])

    const prompt = assessmentUserPrompt({
      instrumentName: STAI,
      patientName: 'Ana',
      age: '34 años',
      results,
    })
    expect(prompt).toContain('desde 75 indica dificultad')
    expect(prompt).not.toContain('se considera fortaleza')
  })

  it('suggests reducing the worst one first, and nothing when all is well', () => {
    expect(
      suggestedGoals(
        { scale: 'percentile', scores: { 'Ansiedad estado': 80, 'Ansiedad rasgo': 95 }, prose: '' },
        STAI,
      ),
    ).toEqual(['Disminuir ansiedad rasgo', 'Disminuir ansiedad estado'])

    expect(
      suggestedGoals({ scale: 'raw', scores: { 'Puntaje total BDI-II': 8 }, prose: '' }, BECK),
    ).toEqual([])
  })

  it('pain on a 0–10 scale is read the same way', () => {
    const results = { scale: 'raw' as const, scores: { 'Dolor (0-10)': 7 }, prose: '' }

    expect(bandScores(results, 'EVA (dolor)').low).toHaveLength(1)
    expect(suggestedGoals(results, 'EVA (dolor)')).toEqual(['Disminuir dolor (0-10)'])
  })

  it('a WISC is still read as more is better', () => {
    const bands = bandScores({ scale: 'standard', scores: SCORES, prose: '' }, 'WISC-V (inteligencia)')

    expect(bands.low.map((score) => score.area)).toEqual(['Comprensión verbal'])
    expect(bands.high.map((score) => score.area)).toEqual(['Visoespacial'])
  })
})
