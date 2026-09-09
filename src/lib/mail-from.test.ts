import { afterEach, describe, expect, it, vi } from 'vitest'

import { mailFromAddress } from './mail-from'

describe('mailFromAddress', () => {
  it('acepta la dirección sola', () => {
    expect(mailFromAddress('hola@hilo.uy')).toBe('hola@hilo.uy')
  })

  it('acepta la forma con nombre visible, que es la que documentamos', () => {
    expect(mailFromAddress('Hilo <hola@hilo.uy>')).toBe('hola@hilo.uy')
  })

  it('acepta el valor que usa CI, para que esto no ponga la build en rojo', () => {
    expect(mailFromAddress('Hilo <ci@example.com>')).toBe('ci@example.com')
  })

  it('acepta el valor de ejemplo del .env.example', () => {
    expect(mailFromAddress('Hilo <onboarding@resend.dev>')).toBe('onboarding@resend.dev')
  })

  it('acepta un nombre con acentos y espacios, que es lo natural en español', () => {
    expect(mailFromAddress('Hilo · Notificaciones <avisos@hilo.uy>')).toBe('avisos@hilo.uy')
  })

  it('ignora los espacios de las puntas', () => {
    expect(mailFromAddress('  Hilo <hola@hilo.uy>  ')).toBe('hola@hilo.uy')
    expect(mailFromAddress('Hilo < hola@hilo.uy >')).toBe('hola@hilo.uy')
  })

  /**
   * Un salto de línea pegado al final es el caso más común de copiar y pegar en
   * el panel de Vercel, y una vez recortado el valor es correcto. Se acepta a
   * propósito: lo estricto tiene que ser el medio, no las puntas. Rechazarlo
   * sería tirar abajo el build por una configuración que anda bien.
   */
  it('tolera un salto de línea al final, que es el pegado de siempre', () => {
    expect(mailFromAddress('Hilo <hola@hilo.uy>\r')).toBe('hola@hilo.uy')
    expect(mailFromAddress('Hilo <hola@hilo.uy>\n')).toBe('hola@hilo.uy')
  })

  it('acepta los ángulos sin nombre adelante', () => {
    expect(mailFromAddress('<hola@hilo.uy>')).toBe('hola@hilo.uy')
  })

  /**
   * Y acá lo que el guardia existe para atajar. Cada uno de estos pasaba el
   * `z.string().min(1)` de antes, arrancaba la app sin una queja, y después
   * hacía fallar todos los correos en silencio.
   */
  describe('rechaza lo que arrancaba igual y después no mandaba nada', () => {
    const malos: Array<[string, string]> = [
      ['vacío', ''],
      ['sólo espacios', '   '],
      ['sin arroba', 'hilo.uy'],
      ['sólo el nombre visible', 'Hilo'],
      ['el ángulo que falta', 'Hilo <hola@hilo.uy'],
      ['el otro ángulo que falta', 'Hilo hola@hilo.uy>'],
      ['sin dominio', 'Hilo <hola@>'],
      ['sin buzón', 'Hilo <@hilo.uy>'],
      ['ángulos vacíos', 'Hilo <>'],
      ['un salto de línea en el medio', 'Hilo\n<hola@hilo.uy>'],
      ['un salto de línea adentro de los ángulos', 'Hilo <hola@\nhilo.uy>'],
      ['dos direcciones', 'Hilo <hola@hilo.uy, otra@hilo.uy>'],
    ]

    for (const [nombre, valor] of malos) {
      it(nombre, () => {
        expect(mailFromAddress(valor)).toBeNull()
      })
    }
  })
})

/**
 * Y que el guardia esté efectivamente puesto.
 *
 * Lo de arriba prueba la función; esto prueba el cableado, que es lo que
 * realmente falla en la vida real — una validación perfecta que nadie llamó.
 * `resetModules` hace falta porque `env.ts` valida al importarse, una sola vez.
 */
describe('el arranque', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('se cae, nombrando la variable, si MAIL_FROM no es una dirección', async () => {
    vi.stubEnv('MAIL_FROM', 'Hilo')
    vi.resetModules()

    await expect(import('./env')).rejects.toThrow(/MAIL_FROM/)
  })

  it('arranca con la forma que documentamos, y guarda el valor recortado', async () => {
    vi.stubEnv('MAIL_FROM', '  Hilo <hola@hilo.uy>\n')
    vi.resetModules()

    const { env } = await import('./env')
    expect(env.MAIL_FROM).toBe('Hilo <hola@hilo.uy>')
  })
})
