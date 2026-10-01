/**
 * La dirección de quien llama, para los contadores de intentos.
 *
 * `x-vercel-forwarded-for` lo escribe la plataforma y no se puede pisar desde
 * afuera, así que es el primero que se mira. Si no está —local, o cualquier
 * otro hosting— vale el **último** valor de `x-forwarded-for`, que es el que
 * agregó el proxy más cercano. El primero es justo el que no hay que usar: el
 * encabezado se concatena, y lo que el cliente mandó por su cuenta queda
 * adelante; con ése, mandar un `X-Forwarded-For` distinto en cada pedido
 * alcanzaba para que el contador arrancara de cero cada vez.
 *
 * Sin ninguno de los dos queda `'local'`, y ahí todos comparten un contador:
 * es la dirección segura en la que equivocarse.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-vercel-forwarded-for') ?? headers.get('x-forwarded-for')

  const hops =
    forwarded
      ?.split(',')
      .map((hop) => hop.trim())
      .filter(Boolean) ?? []

  return hops.at(-1) ?? 'local'
}
