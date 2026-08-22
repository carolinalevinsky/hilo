import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { getUser } from '@/server/auth'
import { completeConnection } from '@/server/google'

import { STATE_COOKIE } from '../conectar/route'

/** Vuelve al perfil diciendo qué pasó, sin filtrar nada de Google en la URL. */
function backToProfile(result: string): never {
  redirect(`/perfil?google=${result}`)
}

/**
 * A donde vuelve Google después de que la profesional autorizó.
 *
 * Esta URL está registrada en Google Cloud Console y tiene que coincidir carácter
 * por carácter con la que arma `redirectUri()`. Si algún día se mueve, se mueve
 * en los dos lados o Google rechaza la conexión con un error que no dice cuál de
 * los dos está mal.
 *
 * ─── El orden de las verificaciones no es casual ───────────────────────────
 *
 * Primero la sesión, después el `state`, y recién ahí el código. Cada paso
 * decide de quién es esta conexión, y saltearse el segundo es lo que permitiría
 * dejar el calendario de un desconocido conectado a esta cuenta. Ver
 * `../conectar/route.ts`.
 */
export async function GET(request: NextRequest) {
  // Ver la nota en `../conectar/route.ts`: acá tampoco hay pantalla de error que
  // agarre una excepción, y volver de Google con la sesión vencida es
  // perfectamente posible — la vuelta pasa por el dominio de Google.
  const user = await getUser()
  if (!user) redirect('/entrar?volver=/perfil')

  const params = request.nextUrl.searchParams
  const jar = await cookies()
  const expected = jar.get(STATE_COOKIE)?.value

  // Se borra pase lo que pase: un `state` sirve una sola vez, y dejarlo vivo
  // después de usarlo es dejar abierta justo la ventana que existe para cerrar.
  jar.delete(STATE_COOKIE)

  // "No, gracias" en la pantalla de Google también vuelve por acá. No es un
  // error: es una respuesta, y merece un mensaje distinto.
  if (params.get('error')) backToProfile('cancelado')

  const state = params.get('state')
  if (!expected || !state || state !== expected) backToProfile('estado')

  const code = params.get('code')
  if (!code) backToProfile('sin-codigo')

  const result = await completeConnection(user.id, code)
  backToProfile(result.ok ? 'listo' : 'error')
}
