/**
 * The short messages the sign-in screen can be sent with, as `?aviso=<code>`.
 *
 * A code rather than the message itself: `/confirmar` redirects here after a
 * link fails, and putting the wording in the URL would mean rendering whatever
 * text an address bar happened to contain.
 */
const NOTICES = {
  'enlace-vencido':
    'Ese enlace no funcionó: puede que haya vencido o que ya lo hayas usado. Pedí uno nuevo.',
  // Aceptar una invitación crea la cuenta y después inicia sesión. Si lo
  // segundo falla, lo primero ya pasó — y decir sólo "entrá" dejaría a alguien
  // que acaba de elegir una contraseña sin saber si la cuenta llegó a existir.
  'cuenta-creada':
    'Creamos tu cuenta. Entrá con el correo de la invitación y la contraseña que elegiste.',
} as const

export type AuthNotice = keyof typeof NOTICES

export function noticeFor(value: unknown): string | null {
  return typeof value === 'string' && value in NOTICES
    ? NOTICES[value as AuthNotice]
    : null
}
