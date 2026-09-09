import { z } from 'zod'

import { getDb } from './db'

/**
 * Pedir un formato de informe que todavía no existe.
 *
 * La lista de formatos está escrita a mano en `src/lib/recipients.ts` —cada
 * destinatario tiene su tono y eso se redactó, no se generó— así que agregar uno
 * es trabajo de una persona sobre el código. Esto es el camino desde "me falta
 * el del juzgado" hasta esa persona, sin que haya que escribir un mail por fuera
 * y sin que el pedido se pierda.
 */

export const NewFormatRequest = z.object({
  detail: z
    .string()
    .trim()
    .min(5, 'Contanos un poco más: ¿para quién es el informe?')
    .max(500, 'Es muy largo. Con dos o tres líneas alcanza.'),
})

/**
 * Guarda el pedido y devuelve lo que hace falta para avisar.
 *
 * No manda el correo: eso lo hace quien la llama. Mandar mails es trabajo de
 * transporte y esta capa no sabe que existe Resend — y sobre todo, si el aviso
 * falla el pedido tiene que quedar guardado igual. Un pedido que se pierde
 * porque el servidor de correo tuvo un mal día es peor que un aviso que no
 * llega: el segundo se puede ver en la tabla, el primero no está en ningún lado.
 */
/**
 * Cuántos pedidos por hora. No es una cuota, es un freno.
 *
 * Cada pedido manda un correo a `OWNER_EMAIL`, así que sin tope alcanzaba con
 * apretar el botón en un bucle para llenar esa casilla y gastar la cuota de
 * Resend. Era la única superficie del sistema que mandaba correo sin ningún
 * límite: `/api/reservas` cuenta filas por hora y el resumen quincenal manda en
 * lotes acotados.
 *
 * Tres es holgado para lo que esto es —contar que falta un formato— y cierra el
 * bucle. Quien de verdad necesite pedir cuatro cosas en una hora puede esperar,
 * o escribir las cuatro en un pedido.
 */
export const FORMAT_REQUESTS_PER_HOUR = 3

/** Se pidieron demasiados seguidos. Es una respuesta, no un error del programa. */
export class TooManyFormatRequests extends Error {
  constructor() {
    super('Ya nos mandaste varios pedidos. Probá de nuevo en un rato.')
    this.name = 'TooManyFormatRequests'
  }
}

async function recentCount(practitionerId: string): Promise<number> {
  const db = await getDb()
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count, error } = await db
    .from('format_requests')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .gte('created_at', since)

  if (error) throw error
  return count ?? 0
}

export async function createFormatRequest(practitionerId: string, input: unknown) {
  const { detail } = NewFormatRequest.parse(input)

  // Antes de escribir y antes del correo. Cuenta filas, como el de reservas, así
  // que no hace falta ni Redis ni estado en memoria — que además no sobreviviría
  // entre invocaciones de una función serverless.
  if ((await recentCount(practitionerId)) >= FORMAT_REQUESTS_PER_HOUR) {
    throw new TooManyFormatRequests()
  }

  const db = await getDb()
  const { data, error } = await db
    .from('format_requests')
    .insert({ practitioner_id: practitionerId, detail })
    .select('id, detail, created_at')
    .single()

  if (error) throw error
  return data
}
