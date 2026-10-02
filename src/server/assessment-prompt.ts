import { cutoffBand, instrumentByName, SCORE_SCALES, type ScoreScale } from '@/lib/instruments'
import { joinEs } from '@/lib/text'
import { TO_COMPLETE } from '@/lib/to-complete'
import { disciplineAdjective } from '@/lib/recipients'

import { bandScores, type AssessmentResultsData } from './assessments'
import { customInstructionsBlock } from './prompt-templates'

/**
 * The prompt for interpreting an assessment.
 *
 * The model is given the raw scores and told which scale they are on. It is
 * deliberately *not* given the pre-sorted bands: rule 2 of the clinical
 * instructions asks it to interpret, and handing it "these are the low ones"
 * would reduce that to relabelling. The bands exist for the offline fallback and
 * for proposing goals.
 */

export function assessmentInstructions(disciplineId: string): string {
  return `Sos asistente de un/a profesional de ${disciplineAdjective(disciplineId)} en Uruguay. Redactás la interpretación de una evaluación en español rioplatense, claro y profesional.

Estructurá el texto en estas secciones, en este orden y sólo las que correspondan: Síntesis general, Fortalezas, Áreas descendidas, Orientaciones para la intervención.

Cada subtítulo va en su propia línea, corto y terminado en dos puntos, seguido de un párrafo en prosa. No uses viñetas, guiones ni asteriscos de markdown.

No pongas encabezado, datos del paciente ni firma: eso lo agrega el documento.`
}

export function assessmentUserPrompt({
  instrumentName,
  patientName,
  age,
  results,
  observations,
  customInstructions,
  adjustment,
}: {
  instrumentName: string
  patientName: string
  age: string
  results: AssessmentResultsData
  observations?: string | null
  /** Her own instructions (P20), fenced and below the rules — see `prompt-templates.ts`. */
  customInstructions?: string | null
  adjustment?: string | null
}): string {
  const scale = SCORE_SCALES[results.scale as ScoreScale]

  const scoreLines = Object.entries(results.scores)
    .map(([area, value]) => `${area}: ${value}`)
    .join('; ')

  const parts = [
    `Prueba administrada: ${instrumentName}.`,
    `Paciente: ${patientName} (${age}).`,
  ]

  if (scoreLines) {
    parts.push(
      `Tipo de puntaje: ${scale.label}.`,
      `Puntajes: ${scoreLines}.`,
      ...scoreReading(instrumentName, results),
    )
  }

  if (results.prose.trim()) {
    parts.push(`Resultados cualitativos: ${results.prose.trim()}`)
  }

  if (observations?.trim()) {
    parts.push(`Observaciones de conducta durante la administración: ${observations.trim()}`)
  }

  parts.push('', 'Redactá la interpretación (sin encabezado ni firma).')

  const own = customInstructionsBlock(customInstructions)
  if (own) parts.push('', own)

  if (adjustment?.trim()) {
    parts.push('', `Ajuste solicitado por el/la profesional (respetalo): ${adjustment.trim()}`)
  }

  return parts.join('\n')
}

/**
 * Cómo se leen los puntajes, dicho y no supuesto.
 *
 * Es la diferencia entre "85 está por debajo de la media" y "85 está por encima
 * de la mediana", y el modelo no puede saber cuál por el número solo. Tampoco
 * puede saber hacia dónde va el instrumento: la regla 2 de las instrucciones
 * clínicas dice que un puntaje bajo es un área descendida, y eso es cierto para
 * un WISC y al revés para un Beck, una EVA o un Pittsburgh. Antes un BDI-II de
 * 32 se interpretaba como fortaleza.
 */
function scoreReading(instrumentName: string, results: AssessmentResultsData): string[] {
  const entry = instrumentByName(instrumentName)
  const scale = SCORE_SCALES[results.scale as ScoreScale]
  const lines: string[] = []

  if (entry?.higherIsWorse) {
    lines.push(
      'En este instrumento un puntaje más alto indica más severidad o malestar: un puntaje alto es un área a trabajar y nunca una fortaleza, y uno bajo indica ausencia del síntoma. Esto prevalece sobre la regla general de puntajes.',
    )
  }

  if (results.scale === 'raw') {
    if (entry?.cutoffs) {
      let from = 0
      const bands = entry.cutoffs.map((band) => {
        const text =
          band.upTo === from ? `${from}, ${band.label}` : `${from} a ${band.upTo}, ${band.label}`
        from = band.upTo + 1
        return text
      })
      lines.push(
        `Son puntajes directos. Puntos de corte de referencia del instrumento: ${bands.join('; ')}. Ubicá cada puntaje en su franja y no uses otras normas.`,
      )
    } else {
      lines.push(
        'Son puntajes directos, sin baremo: interpretalos cualitativamente y no los clasifiques como altos o bajos respecto de una norma.',
      )
    }
  } else if (entry?.higherIsWorse) {
    lines.push(
      `En esta escala, desde ${scale.high} indica dificultad clínicamente relevante y por debajo de ${scale.low} no indica dificultad.`,
    )
  } else {
    lines.push(
      `En esta escala, por debajo de ${scale.low} se considera descendido y desde ${scale.high} se considera fortaleza.`,
    )
  }

  return lines
}

/**
 * The draft used when the AI is unavailable.
 *
 * Deliberately cautious. It states what was administered and which areas fall
 * where, and it stops — it does not attempt the interpretation that is the
 * professional's to make. An outage should leave a practitioner with a skeleton
 * to fill in, not with confident prose nobody wrote.
 */
export function assessmentFallback({
  instrumentName,
  patientName,
  age,
  results,
  observations,
}: {
  instrumentName: string
  patientName: string
  age: string
  results: AssessmentResultsData
  observations?: string | null
}): string {
  const bands = bandScores(results, instrumentName)
  const entry = instrumentByName(instrumentName)
  // Con puntos de corte, la franja al lado del número: "32, grave".
  const list = (entries: { area: string; value: number }[]) =>
    joinEs(
      entries.map((score) => {
        const band = results.scale === 'raw' ? cutoffBand(entry, score.value) : null
        return `${score.area.toLowerCase()} (${score.value}${band ? `, ${band.label}` : ''})`
      }),
    )

  const lines: string[] = [
    'Síntesis general:',
    `Se administró ${instrumentName} a ${patientName} (${age}).${
      observations?.trim() ? ` En lo conductual se observa que ${observations.trim().toLowerCase()}.` : ''
    }`,
    '',
  ]

  if (bands.high.length > 0) {
    lines.push(
      'Fortalezas:',
      `Se destacan como áreas de mejor rendimiento: ${list(bands.high)}.`,
      '',
    )
  }

  if (bands.average.length > 0) {
    lines.push('Dentro de lo esperado:', `Se ubican en un rango promedio: ${list(bands.average)}.`, '')
  }

  if (bands.low.length > 0) {
    lines.push(
      ...(entry?.higherIsWorse
        ? ['Áreas a trabajar:', `Indican dificultad: ${list(bands.low)}.`]
        : ['Áreas descendidas:', `Aparecen por debajo de lo esperado: ${list(bands.low)}.`]),
      '',
    )
  }

  if (results.prose.trim()) {
    lines.push('Resultados registrados:', results.prose.trim(), '')
  }

  lines.push(
    // Una orientación es criterio clínico, y este borrador no tiene criterio:
    // lo marca para que lo escriba quien firma. Ver `reportFallback`.
    'Orientaciones para la intervención:',
    TO_COMPLETE,
  )

  return lines.join('\n')
}
