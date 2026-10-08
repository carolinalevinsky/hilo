/**
 * "Listo": lo que se le dice a quien acaba de hacer algo.
 *
 * Casi ninguna acción confirmaba que había salido bien. Guardabas un paciente
 * y aparecía su ficha, pero si lo que mirabas era igual que antes no había
 * forma de saber si se había guardado. Las que terminan en otra pantalla dejan
 * `?hecho=<código>` en la dirección, `DoneToast` lo muestra una vez y lo saca.
 *
 * Un código y no el texto: la frase no viaja en la URL, no se puede inventar
 * desde afuera, y las dos acciones que dicen lo mismo lo dicen igual.
 */
export const DONE_MESSAGES = {
  'paciente-creado': 'Paciente creado.',
  'paciente-guardado': 'Cambios guardados.',
  'paciente-borrado': 'Paciente borrado.',
  'registro-guardado': 'Registro guardado.',
  'registro-papelera': 'El registro pasó a la papelera.',
  'material-guardado': 'Material guardado.',
  'material-copiado': 'Copia creada. Ya podés editarla.',
  'material-borrado': 'Material borrado.',
  'documento-papelera': 'El documento pasó a la papelera.',
  'objetivos-cargados': 'Objetivos cargados en la ficha.',
  'reserva-convertida': 'Paciente creado desde la reserva.',
  // Los que dicen las acciones que, durante "Primeros pasos", vuelven a Inicio
  // en vez de quedarse en su pantalla. Ver `src/server/first-steps.ts`.
  'plan-guardado': 'Listo, la sesión quedó planificada.',
  'primeros-pasos-listos': '¡Listo! Terminaste los primeros pasos.',
} as const

export type DoneCode = keyof typeof DONE_MESSAGES

/** `path` con el aviso de que salió bien, conservando lo que ya traía. */
export function withDone(path: string, code: DoneCode): string {
  return `${path}${path.includes('?') ? '&' : '?'}hecho=${code}`
}

export function doneMessage(code: string | null): string | null {
  // `Object.hasOwn` y no `in`: `'toString' in DONE_MESSAGES` es verdadero.
  return code && Object.hasOwn(DONE_MESSAGES, code) ? DONE_MESSAGES[code as DoneCode] : null
}
