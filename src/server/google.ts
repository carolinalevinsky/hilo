import { env, publicConfig } from '@/lib/env'

import { logAction } from './audit'
import { getServiceDb } from './db'

/**
 * La conexión con Google Calendar.
 *
 * ─── Por qué este archivo usa la clave de servicio ─────────────────────────
 *
 * `google_accounts` tiene la política `using (false)`: nadie la lee con su
 * sesión, ni la profesional dueña de la fila. Esa decisión está explicada en la
 * migración y se resume así: ninguna pantalla necesita el token en el navegador,
 * así que no puede llegar ahí. La contrapartida es que el único que puede leerlo
 * es el servidor, y para eso hace falta la clave de servicio.
 *
 * Es el sexto lugar del proyecto con ese permiso. Está en `SERVICE_DB_ALLOWED`
 * de `eslint.config.mjs` y en la lista de `CLAUDE.md`, que es la que lee una
 * persona.
 *
 * ─── Qué no hace ───────────────────────────────────────────────────────────
 *
 * No decide qué se escribe en el evento. Eso vive en `src/lib/calendar-privacy.ts`
 * y lo elige la profesional en su perfil. Acá sólo se habla con Google.
 *
 * No importa nada de `next/*`, como todo `src/server/`.
 */

const OAUTH = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN = 'https://oauth2.googleapis.com/token'
const USERINFO = 'https://www.googleapis.com/oauth2/v2/userinfo'

/**
 * Sólo el calendario, y sólo eventos.
 *
 * `calendar.events` deja crear, mover y cancelar eventos. No da acceso a
 * contactos, ni a Gmail, ni a Drive, ni a crear o borrar calendarios enteros.
 * `userinfo.email` es para mostrar "conectado como …" y que quien tenga dos
 * cuentas sepa a cuál le está escribiendo Hilo.
 *
 * Pedir de más acá no tiene costo visible y es exactamente por eso que conviene
 * mirarlo dos veces: el permiso queda concedido hasta que alguien se acuerde de
 * revocarlo.
 */
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')

/**
 * A dónde vuelve Google. Se deriva de `NEXT_PUBLIC_APP_URL` en vez de ser otra
 * variable: dos valores que tienen que coincidir a mano terminan sin coincidir,
 * y Google rechaza la conexión con un error que no explica cuál de los dos está
 * mal.
 */
export function redirectUri(): string {
  return `${publicConfig.NEXT_PUBLIC_APP_URL}/api/google/callback`
}

/**
 * La URL a la que se manda a la profesional para que autorice.
 *
 * `access_type=offline` con `prompt=consent` es lo que hace que Google entregue
 * un refresh token. Sin las dos, la primera conexión anda y a la hora deja de
 * andar sin decir por qué: el access token vence y no hay con qué renovarlo.
 * `prompt=consent` además fuerza que lo vuelva a entregar si la cuenta ya había
 * autorizado antes, que es el caso al reconectar.
 *
 * `state` no es decorativo: sin él, cualquiera puede hacerle abrir a la
 * profesional un callback con un código de *otra* cuenta de Google y dejar el
 * calendario de un tercero conectado a la suya. Lo genera y lo verifica la ruta,
 * que es la que tiene cookies.
 */
export function consentUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })

  return `${OAUTH}?${params.toString()}`
}

type TokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
  const response = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
    cache: 'no-store',
  })

  return (await response.json()) as TokenResponse
}

/** Cuándo vence un access token, con un minuto de margen. */
function expiryFrom(expiresIn: number | undefined): string {
  const seconds = typeof expiresIn === 'number' ? expiresIn : 3600
  return new Date(Date.now() + (seconds - 60) * 1000).toISOString()
}

export type GoogleAccount = {
  practitionerId: string
  googleEmail: string
  calendarId: string
  connectedAt: string
}

/**
 * Cierra la conexión: cambia el código por tokens y guarda la cuenta.
 *
 * Devuelve un mensaje en castellano si algo falla, en vez de tirar. Los modos de
 * error de acá son cosas que pasan —el permiso denegado, un código vencido, el
 * reloj corrido— y no bugs; quien los ve es alguien que apretó "conectar".
 */
export async function completeConnection(
  practitionerId: string,
  code: string,
): Promise<{ ok: true; email: string } | { ok: false; message: string }> {
  const token = await postToken({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri(),
  })

  if (token.error || !token.access_token) {
    return {
      ok: false,
      message: 'Google no aceptó la conexión. Probá de nuevo desde tu perfil.',
    }
  }

  // Sin refresh token la conexión sirve una hora y después se apaga sola. Es
  // preferible fallar acá, con la profesional mirando, que dentro de una hora
  // sin nadie delante. Pasa si Google ya había autorizado antes y `prompt` no
  // pidió el consentimiento otra vez.
  if (!token.refresh_token) {
    return {
      ok: false,
      message:
        'Google no nos dio permiso permanente. Entrá a la configuración de tu cuenta de Google, quitá el acceso de Hilo, y conectá de nuevo.',
    }
  }

  const email = await fetchEmail(token.access_token)
  if (!email) {
    return { ok: false, message: 'No pudimos leer con qué cuenta te conectaste.' }
  }

  const db = getServiceDb()
  const { error } = await db.from('google_accounts').upsert(
    {
      practitioner_id: practitionerId,
      google_email: email,
      refresh_token: token.refresh_token,
      access_token: token.access_token,
      access_token_expires_at: expiryFrom(token.expires_in),
      // Reconectar arranca de cero: los datos de la conexión anterior —el punto
      // de sincronización y el canal de avisos— pertenecen a la cuenta vieja y
      // no significan nada para la nueva.
      sync_token: null,
      channel_id: null,
      channel_resource_id: null,
      channel_expires_at: null,
    },
    { onConflict: 'practitioner_id' },
  )

  if (error) {
    return { ok: false, message: 'No pudimos guardar la conexión. Probá de nuevo.' }
  }

  await logAction(practitionerId, 'connect', 'google_account', practitionerId)
  return { ok: true, email }
}

async function fetchEmail(accessToken: string): Promise<string | null> {
  const response = await fetch(USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  if (!response.ok) return null

  const data = (await response.json()) as { email?: string }
  return data.email ?? null
}

/** La cuenta conectada, sin ningún token: esto sí se puede mostrar. */
export async function findGoogleAccount(
  practitionerId: string,
): Promise<GoogleAccount | null> {
  const db = getServiceDb()
  const { data, error } = await db
    .from('google_accounts')
    .select('practitioner_id, google_email, calendar_id, connected_at')
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    practitionerId: data.practitioner_id,
    googleEmail: data.google_email,
    calendarId: data.calendar_id,
    connectedAt: data.connected_at,
  }
}

/**
 * Un access token válido, renovándolo si hace falta.
 *
 * Es lo único que el resto del código necesita pedir: nadie más toca el refresh
 * token, y así queda un solo lugar donde el secreto se lee.
 */
export async function accessTokenFor(practitionerId: string): Promise<string | null> {
  const db = getServiceDb()
  const { data, error } = await db
    .from('google_accounts')
    .select('refresh_token, access_token, access_token_expires_at')
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const stillValid =
    data.access_token &&
    data.access_token_expires_at &&
    new Date(data.access_token_expires_at) > new Date()

  if (stillValid) return data.access_token

  const token = await postToken({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: data.refresh_token,
    grant_type: 'refresh_token',
  })

  if (!token.access_token) return null

  await db
    .from('google_accounts')
    .update({
      access_token: token.access_token,
      access_token_expires_at: expiryFrom(token.expires_in),
    })
    .eq('practitioner_id', practitionerId)

  return token.access_token
}

/**
 * Lo único que el resto del código necesita para hablarle a Google: un token de
 * una hora y a qué calendario escribir.
 *
 * Existe para que `google-calendar.ts` no tenga que tocar `google_accounts` — y
 * por lo tanto no necesite la clave de servicio. El refresh token, que es el que
 * no vence, se lee en este archivo y en ninguno más.
 *
 * `null` significa "no hay cuenta conectada", que no es un error: es el estado
 * normal de quien todavía no conectó nada.
 */
export async function connectionFor(
  practitionerId: string,
): Promise<{ accessToken: string; calendarId: string } | null> {
  const account = await findGoogleAccount(practitionerId)
  if (!account) return null

  const accessToken = await accessTokenFor(practitionerId)
  if (!accessToken) return null

  return { accessToken, calendarId: account.calendarId }
}

/**
 * Desconecta la cuenta.
 *
 * Le avisa a Google además de borrar la fila. Borrar sólo la fila deja el
 * permiso concedido del lado de Google para siempre — invisible desde Hilo,
 * visible en la lista de aplicaciones de la cuenta, y vivo. "Desconectar" tiene
 * que significar que Hilo ya no puede entrar, no que se olvidó de cómo.
 *
 * Si el aviso falla, la fila se borra igual: quedarse conectada porque Google no
 * contestó sería el peor de los dos resultados.
 */
export async function disconnect(practitionerId: string): Promise<void> {
  const db = getServiceDb()
  const { data } = await db
    .from('google_accounts')
    .select('refresh_token')
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (data?.refresh_token) {
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: data.refresh_token }).toString(),
        cache: 'no-store',
      })
    } catch {
      // Se sigue igual. Ver arriba.
    }
  }

  const { error } = await db
    .from('google_accounts')
    .delete()
    .eq('practitioner_id', practitionerId)

  if (error) throw error

  await logAction(practitionerId, 'disconnect', 'google_account', practitionerId)
}
