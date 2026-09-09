import { expect, test, type BrowserContext, type Cookie } from '@playwright/test'

import { createConfirmedUser, deleteAuthUserByEmail, uniqueEmail } from './support/supabase'

/**
 * Que entrar una vez alcance.
 *
 * Esto no prueba una pantalla: prueba que la sesión sobreviva a las dos cosas
 * que le pasan a cualquier profesional entre un día y el siguiente — cerrar el
 * navegador, y volver cuando el token de acceso ya venció.
 *
 * El segundo caso es el que se rompió. El token de acceso dura una hora, así
 * que **siempre** está vencido cuando alguien abre Hilo a la mañana. El proxy lo
 * renueva y tiene que escribir la cookie nueva en la respuesta; si esa
 * respuesta es un redirect construido aparte, la cookie renovada se pierde y la
 * sesión se cae. Ese es exactamente el camino de entrar por la raíz del sitio.
 */

const PASSWORD = 'una-clave-de-prueba'
const email = uniqueEmail('sesion')

/** El día que la cookie deje de ser persistente, esto lo dice. */
const SIETE_DIAS = 7 * 24 * 60 * 60

test.beforeAll(async () => {
  await createConfirmedUser({
    email,
    password: PASSWORD,
    fullName: 'Prueba Sesión',
    discipline: 'speech_therapy',
  })
})

test.afterAll(async () => {
  await deleteAuthUserByEmail(email)
})

/** Las cookies de sesión de Supabase, que vienen partidas en trozos si son grandes. */
async function authCookies(context: BrowserContext) {
  const all = await context.cookies()
  return all.filter((cookie) => cookie.name.includes('auth-token'))
}

/** La sesión que hay guardada en el navegador, decodificada. */
async function readSession(context: BrowserContext) {
  const cookies = await authCookies(context)
  expect(cookies.length, 'no había cookie de sesión').toBeGreaterThan(0)

  // Los trozos se concatenan en orden por el sufijo `.0`, `.1`, … antes de decodificar.
  const ordered = [...cookies].sort((a, b) => a.name.localeCompare(b.name))
  const raw = ordered.map((cookie) => cookie.value).join('')
  const payload = raw.startsWith('base64-') ? raw.slice('base64-'.length) : raw
  return {
    ordered,
    session: JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      expires_at: number
      access_token: string
      refresh_token: string
    },
  }
}

/**
 * Adelanta el reloj de la sesión sin esperar una hora.
 *
 * La cookie guarda el `expires_at` de la sesión. Poniéndolo en el pasado,
 * `getUser()` da el token por vencido y sale a renovarlo con el refresh token
 * —que sigue siendo válido—, que es exactamente lo que pasa al otro día.
 */
async function expireAccessToken(context: BrowserContext) {
  const { ordered, session } = await readSession(context)

  session.expires_at = Math.floor(Date.now() / 1000) - 60
  // Y un token que el servidor de Auth rechaza de verdad. Mover sólo la fecha no
  // alcanza: el token seguía siendo válido y no había nada que renovar, así que
  // la prueba pasaba sin ejercitar el camino que importa.
  session.access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.vencido.vencido'
  const encoded = `base64-${Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')}`

  // Se reescribe en una sola cookie: si entra en un trozo, el nombre base es el
  // que lee el servidor, y los sobrantes se vacían.
  const base = ordered[0]
  if (!base) throw new Error('no había cookie de sesión para reescribir')
  await context.clearCookies()
  await context.addCookies([
    {
      name: base.name.replace(/\.\d+$/, ''),
      value: encoded,
      domain: base.domain,
      path: base.path,
      expires: base.expires,
      httpOnly: base.httpOnly,
      secure: base.secure,
      sameSite: base.sameSite,
    } satisfies Cookie,
  ])
}

test('entrar una vez alcanza: la sesión sobrevive al cierre del navegador y al token vencido', async ({
  page,
  context,
}) => {
  await test.step('entra con su correo y su contraseña', async () => {
    await page.goto('/entrar')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/(inicio|completar-perfil)/)
  })

  await test.step('la cookie es persistente, no muere al cerrar el navegador', async () => {
    const cookies = await authCookies(context)
    expect(cookies.length, 'no se escribió ninguna cookie de sesión').toBeGreaterThan(0)

    for (const cookie of cookies) {
      // -1 es la marca de Playwright para "cookie de sesión": se borra al
      // cerrar el navegador, y entonces hay que volver a poner la contraseña.
      expect(cookie.expires, `${cookie.name} muere al cerrar el navegador`).toBeGreaterThan(0)
      expect(
        cookie.expires,
        `${cookie.name} vence demasiado pronto`,
      ).toBeGreaterThan(Date.now() / 1000 + SIETE_DIAS)
    }
  })

  await test.step('con el token vencido, /inicio renueva y sigue adentro', async () => {
    await expireAccessToken(context)
    await page.goto('/inicio')
    await expect(page).toHaveURL(/\/inicio/)
  })

  await test.step('el redirect de la raíz escribe la cookie renovada', async () => {
    await expireAccessToken(context)

    // La raíz es lo que se abre al escribir el dominio o tocar un favorito, y
    // el proxy la redirige a /inicio renovando el token por el camino.
    const final = await page.goto('/')
    await expect(page).toHaveURL(/\/inicio/)

    /**
     * Y acá está la aserción que importa, sobre el 307 en sí y no sobre dónde
     * terminamos.
     *
     * Llegar a /inicio no prueba nada, y es justamente lo que engaña: aunque el
     * redirect tire la cookie renovada, Supabase tolera reusar el refresh token
     * viejo unos segundos, así que la petición siguiente —la de /inicio, que no
     * es un redirect— renueva de nuevo y guarda bien. La pantalla carga igual y
     * el token del navegador igual terminó cambiando. Las dos formas obvias de
     * mirarlo dan verde con el bug puesto; se comprobó.
     *
     * Lo único que separa un caso del otro es si *esta* respuesta trae la
     * cookie. Si no la trae, el navegador se queda con el token que el servidor
     * ya gastó, y la primera renovación que caiga fuera de esa ventana de
     * gracia tira la sesión abajo: contraseña de nuevo.
     */
    const redirect = await final?.request().redirectedFrom()?.response()
    expect(redirect?.status(), 'la raíz no redirigió').toBe(307)

    const headers = (await redirect!.headersArray()).filter(
      (header) => header.name.toLowerCase() === 'set-cookie',
    )
    expect(
      headers.map((header) => header.value).join(' | '),
      'el redirect renovó el token pero no escribió la cookie',
    ).toContain('auth-token')

    // Y la sesión sigue viva después, que es lo que se ve desde afuera.
    await page.goto('/pacientes')
    await expect(page).toHaveURL(/\/pacientes/)
  })
})
