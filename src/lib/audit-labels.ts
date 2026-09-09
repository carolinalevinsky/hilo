import { TIME_ZONE } from '@/lib/dates'

/**
 * El registro de auditoría, en castellano.
 *
 * `audit_log` guarda `action` y `entity` en inglés, como toda columna de esta
 * base. Esto es la otra mitad de la regla del proyecto: el código es en inglés,
 * lo que se lee es en rioplatense. Vive en `src/lib/` y no en `src/server/`
 * porque no consulta nada — es una tabla de palabras.
 *
 * ─── Por qué una frase y no dos etiquetas al lado ──────────────────────────
 *
 * "create · patient" traducido campo por campo da "crear · paciente", que es
 * una fila de base de datos con acento. Lo que alguien quiere leer cuando abre
 * su historial es qué hizo: "Cargaste un paciente". Por eso el verbo se conjuga
 * en segunda persona y el sustantivo lleva su artículo con el género que le
 * toca — "una sesión", "un informe".
 */

/** El verbo, en segunda persona, que es a quien se le está contando. */
const VERB: Record<string, string> = {
  create: 'Cargaste',
  update: 'Editaste',
  archive: 'Archivaste',
  delete: 'Borraste',
  export: 'Exportaste',
  generate: 'Generaste',
  view: 'Abriste',
  connect: 'Conectaste',
  disconnect: 'Desconectaste',
}

/** El sustantivo con su artículo, porque en castellano el género no se deduce. */
const THING: Record<string, string> = {
  practitioner: 'tu perfil',
  patient: 'un paciente',
  goal: 'un objetivo',
  session: 'una sesión',
  appointment: 'una hora de la agenda',
  assessment: 'una evaluación',
  report: 'un informe',
  payment: 'un pago',
  booking_request: 'una reserva',
  material: 'un material',
  google_account: 'Google Calendar',
}

/**
 * Los pares que merecen su propia frase.
 *
 * Casi todo sale bien de verbo + sustantivo. Estos no: "Conectaste Google
 * Calendar" ya está completo, y "Exportaste un paciente" dice algo distinto de
 * lo que pasó — lo que salió fue su historia clínica entera, y ése es
 * justamente el evento que este registro existe para poder reconstruir.
 */
const PHRASE: Record<string, string> = {
  'export:patient': 'Exportaste la historia clínica de un paciente',
  'create:session': 'Registraste una sesión',
  'generate:report': 'Generaste un informe',
  'generate:assessment': 'Generaste el análisis de una evaluación',
  'create:appointment': 'Agendaste una hora',
  'delete:appointment': 'Sacaste una hora de la agenda',
  'update:practitioner': 'Cambiaste algo de tu perfil',
}

/** "Cargaste un paciente". Nunca vacío: un registro ilegible no sirve de nada. */
export function auditPhrase(action: string, entity: string): string {
  const known = PHRASE[`${action}:${entity}`]
  if (known) return known

  const verb = VERB[action]
  const thing = THING[entity]

  // Una acción o una entidad que este archivo no conoce todavía. Se muestra en
  // crudo antes que esconderla: una línea rara en el historial es un aviso de
  // que falta traducir algo, y una línea que no aparece no avisa nada.
  if (!verb || !thing) return `${action} · ${entity}`

  return `${verb} ${thing}`
}

/** "8 de septiembre, 14:32" — la hora importa tanto como el día acá. */
export function auditWhen(value: string): string {
  return new Date(value).toLocaleString('es-UY', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}
