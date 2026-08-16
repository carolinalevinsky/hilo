import type { DisciplineId } from './disciplines'

/**
 * The areas and focuses each discipline works in.
 *
 * Transcribed from `legacy/index.html:2099`. This is the taxonomy that decides
 * what a practitioner sees in the library, and it is real domain knowledge: a
 * fonoaudióloga works on praxias orofaciales and grupos consonánticos, a
 * kinesiólogo on rango articular and reeducación de la marcha. Getting it wrong
 * makes the library feel like it was built for somebody else.
 */

export const AREAS_BY_DISCIPLINE: Record<DisciplineId, Record<string, string[]>> = {
  psychopedagogy: {
    Lectura: ['Conciencia fonológica', 'Fluidez lectora', 'Comprensión lectora'],
    Escritura: ['Grafismo', 'Ortografía', 'Producción de textos'],
    Matemática: ['Cálculo mental', 'Resolución de problemas', 'Numeración'],
    Atención: ['Atención sostenida', 'Atención selectiva', 'Funciones ejecutivas'],
  },
  speech_therapy: {
    Articulación: [
      'Praxias orofaciales',
      'Fonema /r/',
      'Fonemas /s/ y /l/',
      'Grupos consonánticos',
    ],
    'Habla y voz': ['Soplo y respiración', 'Fluidez del habla', 'Voz'],
    'Conciencia fonológica': ['Sílabas', 'Rimas', 'Sonidos iniciales y finales'],
  },
  occupational_therapy: {
    'Motricidad fina': ['Agarre y pinza', 'Destreza manual', 'Grafomotricidad'],
    'Integración sensorial': ['Regulación', 'Modulación táctil', 'Propiocepción'],
    Coordinación: ['Óculo-manual', 'Bilateral', 'Cruce de línea media'],
    'Vida diaria (AVD)': ['Vestido', 'Alimentación', 'Autonomía'],
  },
  psychology: {
    Emociones: ['Reconocer emociones', 'Regulación emocional', 'Tolerancia a la frustración'],
    'Habilidades sociales': ['Empatía', 'Resolución de conflictos', 'Asertividad'],
    Técnicas: ['Respiración', 'Relajación', 'Reestructuración cognitiva'],
  },
  psychomotricity: {
    'Esquema corporal': ['Reconocimiento', 'Imagen corporal'],
    Equilibrio: ['Estático', 'Dinámico'],
    Coordinación: ['Óculo-manual', 'Óculo-podal', 'Coordinación global'],
    Lateralidad: ['Definición lateral', 'Orientación espacial'],
  },
  physiotherapy: {
    Movilidad: ['Rango articular', 'Elongación'],
    Fuerza: ['Miembro superior', 'Miembro inferior', 'Core'],
    'Equilibrio y marcha': ['Propiocepción', 'Reeducación de la marcha'],
    'Pautas para casa': ['Ejercicios diarios', 'Cuidados post-lesión'],
  },
}

export function areasFor(discipline: string): Record<string, string[]> {
  return AREAS_BY_DISCIPLINE[discipline as DisciplineId] ?? AREAS_BY_DISCIPLINE.psychopedagogy
}

export const MATERIAL_KIND_LABELS = {
  activity: 'Actividad',
  game: 'Juego',
  worksheet: 'Ficha',
  text: 'Texto',
  guide: 'Pauta',
} as const

export function materialKindLabel(kind: string) {
  return (
    MATERIAL_KIND_LABELS[kind as keyof typeof MATERIAL_KIND_LABELS] ??
    MATERIAL_KIND_LABELS.activity
  )
}

/** The age bands v1 filtered by (`legacy/index.html:2214`). */
export const AGE_RANGES = [
  '3-5 años',
  '6-7 años',
  '8-9 años',
  '10-11 años',
  '12-14 años',
  '15+ años',
] as const
