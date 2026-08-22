import { SCORE_SCALES, type ScoreScale } from '@/lib/instruments'
import { joinEs } from '@/lib/text'
import { disciplineAdjective } from '@/lib/recipients'

import { bandScores, type AssessmentResultsData } from './assessments'

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
  adjustment,
}: {
  instrumentName: string
  patientName: string
  age: string
  results: AssessmentResultsData
  observations?: string | null
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
      // Spelled out rather than assumed. It is the difference between "85 is
      // below average" and "85 is above the median", and the model cannot know
      // which from the number alone.
      results.scale === 'raw'
        ? 'Son puntajes directos, sin baremo: interpretalos cualitativamente y no los clasifiques como altos o bajos respecto de una norma.'
        : `En esta escala, por debajo de ${scale.low} se considera descendido y desde ${scale.high} se considera fortaleza.`,
    )
  }

  if (results.prose.trim()) {
    parts.push(`Resultados cualitativos: ${results.prose.trim()}`)
  }

  if (observations?.trim()) {
    parts.push(`Observaciones de conducta durante la administración: ${observations.trim()}`)
  }

  parts.push('', 'Redactá la interpretación (sin encabezado ni firma).')

  if (adjustment?.trim()) {
    parts.push('', `Ajuste solicitado por el/la profesional (respetalo): ${adjustment.trim()}`)
  }

  return parts.join('\n')
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
  const bands = bandScores(results)
  const list = (entries: { area: string; value: number }[]) =>
    joinEs(entries.map((entry) => `${entry.area.toLowerCase()} (${entry.value})`))

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
      'Áreas descendidas:',
      `Aparecen por debajo de lo esperado: ${list(bands.low)}. Estas áreas orientan los objetivos prioritarios.`,
      '',
    )
  }

  if (results.prose.trim()) {
    lines.push('Resultados registrados:', results.prose.trim(), '')
  }

  lines.push(
    'Orientaciones para la intervención:',
    bands.low.length > 0
      ? `Se sugiere priorizar la intervención en ${joinEs(bands.low.map((entry) => entry.area.toLowerCase()))}, con actividades graduadas y apoyándose en las fortalezas detectadas.`
      : 'A completar según el criterio profesional.',
  )

  return lines.join('\n')
}
