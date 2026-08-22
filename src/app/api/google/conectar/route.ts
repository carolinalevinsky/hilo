import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getUser } from '@/server/auth'
import { consentUrl } from '@/server/google'

export const STATE_COOKIE = 'hilo_google_state'

/**
 * Manda a la profesional a autorizar en Google.
 *
 * Una ruta y no un Server Action porque el final del camino es una redirección
 * a otro dominio, con parámetros que Google tiene que ver en la URL.
 *
 * ─── Qué hace el `state` ───────────────────────────────────────────────────
 *
 * Un número al azar que sale hacia Google y tiene que volver igual. Al mismo
 * tiempo queda en una cookie que sólo el servidor puede leer.
 *
 * Sin eso, alguien puede armar un link a `/api/google/callback?code=…` con un
 * código de *su* cuenta de Google y hacérselo abrir a la profesional estando
 * logueada. Hilo cerraría la conexión sin sospechar nada, y a partir de ahí las
 * sesiones de sus pacientes se escribirían en el calendario del atacante — con
 * el nombre que ella haya elegido mostrar. El callback compara los dos valores y
 * corta si no coinciden.
 */
export async function GET() {
  // `getUser` y no `requireUser`: el segundo tira, y una excepción adentro de
  // una ruta de API es un 500 crudo. En una página la agarra la pantalla de
  // error; acá no hay pantalla. Que la sesión se haya vencido mientras el perfil
  // estaba abierto es de lo más común, y la respuesta correcta es el login.
  const user = await getUser()
  if (!user) redirect('/entrar?volver=/perfil')

  const state = crypto.randomUUID()
  const jar = await cookies()

  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // Diez minutos: lo que tarda leer una pantalla de permisos y decidir. Más
    // que eso es una ventana abierta sin motivo.
    maxAge: 600,
  })

  redirect(consentUrl(state))
}
