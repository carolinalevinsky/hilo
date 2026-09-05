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
export async function createFormatRequest(practitionerId: string, input: unknown) {
  const { detail } = NewFormatRequest.parse(input)

  const db = await getDb()
  const { data, error } = await db
    .from('format_requests')
    .insert({ practitioner_id: practitionerId, detail })
    .select('id, detail, created_at')
    .single()

  if (error) throw error
  return data
}

/** Los pedidos de esta profesional, del más nuevo al más viejo. */
export async function listFormatRequests(practitionerId: string) {
  const db = await getDb()
  const { data, error } = await db
    .from('format_requests')
    .select('id, detail, created_at')
    .eq('practitioner_id', practitionerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
