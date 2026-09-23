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
  signUp: null as unknown,
  resetPasswordForEmail: null as unknown,
}))

vi.mock('./db', () => ({
  getDb: async () => ({
    auth: {
      signInWithPassword: holder.signInWithPassword,
      signUp: holder.signUp,
      resetPasswordForEmail: holder.resetPasswordForEmail,
    },
  }),
}))

const { signIn, signUp, requestPasswordReset } = await import('./auth')

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

describe('crear cuenta', () => {
  it('distingue no poder conectarse de no poder crearla', async () => {
    holder.signUp = async () => ({ data: {}, error: NETWORK_ERROR })

    const result = await signUp({
      fullName: 'Ana Prueba',
      email: CREDENTIALS.email,
      password: CREDENTIALS.password,
      discipline: 'speech_therapy',
      acceptedTerms: true,
    })

    expect(result.ok === false && result.message).toBe(
      'No pudimos conectarnos. Probá de nuevo en un minuto.',
    )
  })

  it('sigue diciendo lo suyo cuando el correo ya tiene cuenta', async () => {
    holder.signUp = async () => ({
      data: {},
      error: { name: 'AuthApiError', code: 'user_already_exists', status: 422 },
    })

    const result = await signUp({
      fullName: 'Ana Prueba',
      email: CREDENTIALS.email,
      password: CREDENTIALS.password,
      discipline: 'speech_therapy',
      acceptedTerms: true,
    })

    expect(result.ok === false && result.message).toMatch(/Ya hay una cuenta/)
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
