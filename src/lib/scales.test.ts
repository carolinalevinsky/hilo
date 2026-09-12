import { describe, expect, it } from 'vitest'

import { SCALES, scaleIsReady, severityBand } from './scales'

describe('scales', () => {
  // The wording is pasted from the official version by a person. Until it is,
  // Hilo must not offer to send the questionnaire — see `@/lib/scales`.
  it('is not ready while any official text is still missing', () => {
    const missing = Object.values(SCALES).some((scale) =>
      [scale.instruction, ...scale.items, ...scale.options].some((text) =>
        text.includes('[PEGAR TEXTO OFICIAL]'),
      ),
    )
    if (missing) {
      expect(scaleIsReady('phq9') && scaleIsReady('gad7')).toBe(false)
    }
  })

  it('has the item counts of the published instruments', () => {
    expect(SCALES.phq9.items).toHaveLength(9)
    expect(SCALES.gad7.items).toHaveLength(7)
    expect(SCALES.phq9.maxScore).toBe(27)
    expect(SCALES.gad7.maxScore).toBe(21)
  })

  it('puts totals in the published bands, edges included', () => {
    expect(severityBand('phq9', 0)).toBe('mínima')
    expect(severityBand('phq9', 4)).toBe('mínima')
    expect(severityBand('phq9', 5)).toBe('leve')
    expect(severityBand('phq9', 14)).toBe('moderada')
    expect(severityBand('phq9', 15)).toBe('moderadamente severa')
    expect(severityBand('phq9', 20)).toBe('severa')
    expect(severityBand('phq9', 27)).toBe('severa')

    expect(severityBand('gad7', 9)).toBe('leve')
    expect(severityBand('gad7', 10)).toBe('moderada')
    expect(severityBand('gad7', 15)).toBe('severa')
    expect(severityBand('gad7', 21)).toBe('severa')
  })
})
