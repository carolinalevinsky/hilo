import { z } from 'zod'

/**
 * Quién firma los correos que manda Hilo.
 *
 * Resend acepta dos formas, y las dos son legítimas: la dirección sola
 * (`hola@hilo.uy`) o con nombre visible (`Hilo <hola@hilo.uy>`). La segunda es
 * la que documenta `docs/launch.md`, y es la razón por la que `MAIL_FROM` no se
 * podía validar con un `z.email()` a secas.
 *
 * Lo que no alcanza es comprobar que la cadena no esté vacía, porque nada más
 * abajo va a notar el error. `send()` en `src/server/notifications.ts` no lanza
 * a propósito: un correo que falla no puede tirar abajo la reserva que estaba
 * anunciando. Así que un `MAIL_FROM` mal escrito —un `>` que falta, el dominio
 * que se comió un dedo— no rompe nada visible. Se caen todos los correos, uno
 * por uno, calladitos. Y los que se caen son el de recuperar la contraseña y el
 * aviso de que llegó una reserva.
 *
 * Resend rechaza esos pedidos en la API, antes de crear el registro del envío,
 * así que el panel no muestra un error: muestra "No sent emails yet". No hay
 * dónde mirar. Por eso el guardia va al arranque, donde equivocarse es un build
 * que se cae nombrando la variable, y no un silencio de semanas.
 */

const ADDRESS = z.email()

/**
 * La dirección que hay adentro, o `null` si no hay una válida.
 *
 * Devuelve la dirección en vez de un booleano para que el test pueda afirmar
 * *qué* leyó y no sólo que dijo que sí. `Hilo <hola@hilo.uy>` → `hola@hilo.uy`
 * distingue un parseo correcto de uno que aceptó la cadena por otro motivo.
 */
export function mailFromAddress(value: string): string | null {
  const trimmed = value.trim()

  /**
   * Nada de caracteres de control.
   *
   * El caso mundano es un valor pegado en Vercel que se trajo un salto de línea
   * del medio; `trim()` sólo limpia las puntas. No pretende ser una defensa
   * contra inyección de cabeceras —Resend manda JSON, no SMTP a mano— pero una
   * dirección de correo no tiene por qué contener ninguno, y cuesta una línea.
   */
  for (const char of trimmed) {
    const code = char.codePointAt(0) ?? 0
    if (code < 0x20 || code === 0x7f) return null
  }

  // `Hilo <hola@hilo.uy>` → el nombre visible puede ser cualquier cosa menos
  // otro par de ángulos; lo que se valida es lo de adentro.
  const angled = /^[^<>]*<([^<>]+)>$/.exec(trimmed)
  const address = angled?.[1]?.trim() ?? trimmed

  return ADDRESS.safeParse(address).success ? address : null
}
