import { firstName } from '@/lib/whatsapp'

/**
 * Qué se ve de un paciente en el calendario de Google.
 *
 * Un evento de calendario es un lugar raro: lo mira la profesional en el celular
 * en la calle, aparece en la pantalla compartida de una reunión, lo lee quien
 * tenga el calendario compartido, y vive en un servidor de otra empresa en otro
 * país. Nada de eso lo controla Hilo.
 *
 * Por eso el título del evento es una decisión y no un descuido, y por eso
 * arranca en lo más reservado. Ninguna de las tres opciones manda la nota
 * clínica, el motivo de consulta ni los objetivos: eso no sale de Hilo por este
 * camino bajo ninguna configuración.
 */
export const CALENDAR_PRIVACY = ['busy', 'initials', 'first_name'] as const

export type CalendarPrivacy = (typeof CALENDAR_PRIVACY)[number]

export const CALENDAR_PRIVACY_LABELS: Record<CalendarPrivacy, string> = {
  busy: 'Sólo "Ocupado"',
  initials: 'Iniciales',
  first_name: 'Nombre de pila',
}

/** Lo que se ve en el calendario, para mostrar al lado de cada opción. */
export const CALENDAR_PRIVACY_EXAMPLES: Record<CalendarPrivacy, string> = {
  busy: 'Ocupado',
  initials: 'T. P.',
  first_name: 'Tomás',
}

export const CALENDAR_PRIVACY_HINTS: Record<CalendarPrivacy, string> = {
  busy: 'Nadie que vea tu calendario sabe de quién es la hora. Ni vos, a simple vista.',
  initials: 'Te alcanza para reconocer la hora y a otra persona no le dice quién es.',
  first_name:
    'Cómodo para vos. Tené presente que queda escrito en un servidor de Google que esa persona es paciente tuya.',
}

/** "Tomás Pérez" → "T. P." */
function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''

  // Las dos primeras y no todas: "María del Carmen Rodríguez Silva" en cuatro
  // iniciales no es más reservado, es sólo más largo.
  return parts
    .slice(0, 2)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}.`)
    .join(' ')
}

/**
 * El título del evento, según lo que la profesional haya elegido.
 *
 * Un valor desconocido cae en `busy`. Es lo que corresponde cuando no se sabe:
 * el default de una decisión sobre privacidad tiene que ser el que menos cuenta,
 * no el más conveniente.
 */
export function calendarEventTitle(
  patientFullName: string,
  privacy: CalendarPrivacy | string | null | undefined,
): string {
  switch (privacy) {
    case 'first_name':
      return firstName(patientFullName)
    case 'initials':
      return initials(patientFullName)
    default:
      return 'Ocupado'
  }
}
