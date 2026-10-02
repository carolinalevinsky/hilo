import { describe, expect, it, vi } from 'vitest'

/**
 * Qué se le dice a alguien cuando el que falla es el servidor y no ella.
 *
 * El 2026-09-23 el proyecto de Supabase de producción estaba pausado y la
 * pantalla de entrar dijo "El correo o la contraseña no coinciden" — a una
 * profesional cuya contraseña estaba bien. Estos tests son la línea que separa
 * un error de red de un error de credenciales, y la que impide que se vuelvan a
 * juntar.
 *
 * Con un doble y no contra Supabase: lo que hay que probar es cómo se traduce un
 * error, y un error de red de verdad no se puede pedir a demanda.
 */

const holder = vi.hoisted(() => ({
  signInWithPassword: null as unknown,
  resetPasswordForEmail: null as unknown,
  /** Los fallos anotados, por clave: lo mismo que la tabla `login_failures`. */
  failures: new Map<string, number>(),
}))

vi.mock('./db', () => ({
  getDb: async () => ({
    auth: {
      signInWithPassword: holder.signInWithPassword,
      resetPasswordForEmail: holder.resetPasswordForEmail,
    },
    // Las tres funciones de la migración, con los mismos topes.
    rpc: async (name: string, args: Record<string, string>) => {
      const count = (key: string) => holder.failures.get(key) ?? 0
      if (name === 'login_allowed') {
        return { data: count(args.per_account!) < 5 && count(args.per_ip!) < 30, error: null }
      }
      if (name === 'note_login_failure') {
        for (const key of [args.per_account!, args.per_ip!]) holder.failures.set(key, count(key) + 1)
      }
      if (name === 'clear_login_failures') holder.failures.delete(args.per_account!)
      return { data: null, error: null }
    },
  }),
}))

const { signIn, requestPasswordReset } = await import('./auth')

/** Lo que devuelve `@supabase/auth-js` cuando el `fetch` ni salió. */
const NETWORK_ERROR = {
  name: 'AuthRetryableFetchError',
  message: 'Failed to fetch',
  status: 0,
}

/** Lo que devuelve cuando Supabase sí contestó, y contestó que no. */
const BAD_CREDENTIALS = {
  name: 'AuthApiError',
  message: 'Invalid login credentials',
  code: 'invalid_credentials',
  status: 400,
}

/** Lo que devuelve cuando contestó algo que no se pudo leer: proxy, portal cautivo. */
const UNREADABLE_ANSWER = {
  name: 'AuthUnknownError',
  message: 'Unexpected token < in JSON at position 0',
}

const CREDENTIALS = { email: 'ana@ejemplo.uy', password: 'una-clave-de-prueba' }

describe('entrar', () => {
  it('dice que no pudimos conectarnos cuando no llegamos a Supabase', async () => {
    holder.signInWithPassword = async () => ({ data: {}, error: NETWORK_ERROR })

    const result = await signIn(CREDENTIALS)

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.message).toBe(
      'No pudimos conectarnos. Probá de nuevo en un minuto.',
    )
  })

  it('tampoco culpa a la contraseña cuando la respuesta no se pudo leer', async () => {
    // Un proxy que devuelve HTML, una URL de Supabase mal configurada. No
    // entendimos la respuesta: eso no es un veredicto sobre la contraseña.
    holder.signInWithPassword = async () => ({ data: {}, error: UNREADABLE_ANSWER })

    const result = await signIn(CREDENTIALS)

    expect(result.ok === false && result.message).toBe(
      'No pudimos conectarnos. Probá de nuevo en un minuto.',
    )
  })

  it('sigue sin distinguir una cuenta que no existe de una contraseña equivocada', async () => {
    // La regla de privacidad del archivo, que esto no puede aflojar: el mensaje
    // de credenciales es uno solo, y no dice cuál de las dos cosas pasó.
    holder.signInWithPassword = async () => ({ data: {}, error: BAD_CREDENTIALS })

    const result = await signIn(CREDENTIALS)

    expect(result.ok === false && result.message).toBe('El correo o la contraseña no coinciden.')
  })

  it('deja pasar el caso que sí se cuenta: falta confirmar el correo', async () => {
    holder.signInWithPassword = async () => ({
      data: {},
      error: { name: 'AuthApiError', code: 'email_not_confirmed', status: 400 },
    })

    const result = await signIn(CREDENTIALS)

    expect(result.ok === false && result.message).toMatch(/confirmar tu correo/)
  })
})

describe('olvidé mi contraseña', () => {
  it('no promete un mail que no salió', async () => {
    holder.resetPasswordForEmail = async () => ({ data: null, error: NETWORK_ERROR })

    const result = await requestPasswordReset({ email: CREDENTIALS.email })

    expect(result.ok).toBe(false)
  })

  it('sigue contestando que sí cuando el correo no tiene cuenta', async () => {
    // Lo de siempre y a propósito: una respuesta distinta le diría a quien
    // escribió la dirección si una profesional tiene cuenta acá.
    holder.resetPasswordForEmail = async () => ({ data: null, error: null })

    const result = await requestPasswordReset({ email: 'nadie@ejemplo.uy' })

    expect(result.ok).toBe(true)
  })
})

/**
 * El límite propio. El de Supabase es por IP y generoso: 30 cada 5 minutos son
 * miles de contraseñas por día contra una sola cuenta.
 */
describe('demasiados intentos', () => {
  it('al sexto fallo seguido espera, sin preguntarle a Supabase', async () => {
    holder.failures.clear()
    let asked = 0
    holder.signInWithPassword = async () => {
      asked += 1
      return { data: {}, error: BAD_CREDENTIALS }
    }

    for (let attempt = 0; attempt < 5; attempt++) await signIn(CREDENTIALS, '1.2.3.4')
    const sixth = await signIn(CREDENTIALS, '1.2.3.4')

    expect(sixth).toEqual({ ok: false, message: expect.stringContaining('demasiados intentos') })
    expect(asked).toBe(5)
  })

  it('no deja afuera a la dueña de la cuenta desde otra IP', async () => {
    holder.signInWithPassword = async () => ({ data: {}, error: null })

    expect(await signIn(CREDENTIALS, '5.6.7.8')).toEqual({ ok: true })
  })

  it('una entrada buena borra los fallos de esa cuenta', async () => {
    holder.failures.clear()
    holder.signInWithPassword = async () => ({ data: {}, error: BAD_CREDENTIALS })
    for (let attempt = 0; attempt < 4; attempt++) await signIn(CREDENTIALS, '1.2.3.4')

    holder.signInWithPassword = async () => ({ data: {}, error: null })
    await signIn(CREDENTIALS, '1.2.3.4')

    holder.signInWithPassword = async () => ({ data: {}, error: BAD_CREDENTIALS })
    const next = await signIn(CREDENTIALS, '1.2.3.4')
    expect(next).toEqual({ ok: false, message: 'El correo o la contraseña no coinciden.' })
  })

  it('un error de red no cuenta como fallo', async () => {
    holder.failures.clear()
    holder.signInWithPassword = async () => ({ data: {}, error: NETWORK_ERROR })
    for (let attempt = 0; attempt < 6; attempt++) await signIn(CREDENTIALS, '1.2.3.4')

    expect(holder.failures.size).toBe(0)
  })
})
