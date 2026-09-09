import { getServiceDb } from './db'

/**
 * El registro de consumo de IA.
 *
 * Una fila por unidad gastada. Es lo único que le pone techo al gasto contra
 * Anthropic, y por eso vive donde la usuaria no lo alcanza.
 *
 * ─── Por qué la clave de servicio ──────────────────────────────────────────
 *
 * Es el séptimo lugar del proyecto con ese permiso, y la razón es la misma que
 * la de `audit.ts`, dicha de otra forma: **un contador que puede borrar quien
 * está siendo contado no es un contador.**
 *
 * Antes esto se contaba sobre las filas que el consumo produce — los informes,
 * las evaluaciones, los materiales de IA y una tabla `assistant_questions` que
 * existía sólo para eso. Las cuatro tienen política `for all`, así que borrar
 * un informe devolvía la cuota. Con botón, incluso. Generar, copiar el texto,
 * borrar, repetir.
 *
 * `ai_usage` no tiene política de insert y además tiene el `revoke`. Nadie que
 * llegue con una sesión escribe acá; sólo este archivo, y sólo con la clave de
 * servicio. La contrapartida está acotada a propósito: son treinta líneas, se
 * toca una sola tabla, y `practitionerId` es siempre un argumento explícito.
 *
 * ─── Por qué se cuenta antes y no después ──────────────────────────────────
 *
 * `plans.ts` lo explica y esta parte no cambia: contar después de la respuesta
 * es una factura por algo que nadie estaba autorizado a pedir, y deja pasar una
 * ráfaga de pedidos en paralelo. Se anota antes, y si la respuesta no llegó se
 * devuelve — ver `releaseUsage`.
 */

/** Los cuatro de `PLAN_LIMITS`, y el `check` de la tabla dice lo mismo. */
export type UsageKind = 'reports' | 'assessments' | 'questions' | 'materials'

/**
 * Anota una unidad y devuelve el id, para poder devolverla si hace falta.
 *
 * No tira: quedarse sin poder generar un informe porque falló la anotación
 * sería cambiar un problema de plata por uno de trabajo. Devuelve `null`, el
 * error va al log, y esa unidad no se cuenta — que es un error del lado
 * generoso, que es el lado correcto para equivocarse acá.
 */
export async function recordUsage(
  practitionerId: string,
  kind: UsageKind,
): Promise<string | null> {
  try {
    const db = getServiceDb()
    const { data, error } = await db
      .from('ai_usage')
      .insert({ practitioner_id: practitionerId, kind })
      .select('id')
      .single()

    if (error) throw error
    return data?.id ?? null
  } catch (error) {
    console.error('[ai_usage] no se pudo anotar el consumo', { practitionerId, kind, error })
    return null
  }
}

/**
 * Devuelve una unidad que no se llegó a gastar.
 *
 * Existe por un caso concreto: con la clave de Anthropic sin configurar —o
 * caída, o con la cuota del proveedor agotada— *todas* las preguntas caen en
 * `offlineAnswer`, que es aritmética sobre las filas propias y no cuesta un
 * centavo. Sin esto, una profesional quemaría su mes entero en respuestas que
 * calculó esta misma aplicación.
 *
 * Se devuelve **sólo cuando no llegó nada**. Una respuesta cortada por la mitad
 * igual costó tokens y sigue contada.
 *
 * Borrar es correcto acá y no contradice lo de arriba: quien borra es el
 * servidor, no quien está siendo contado. Un `ai_usage` sin esta función sería
 * un registro más puro y una aplicación peor.
 */
export async function releaseUsage(usageId: string | null): Promise<void> {
  if (!usageId) return

  try {
    const db = getServiceDb()
    const { error } = await db.from('ai_usage').delete().eq('id', usageId)
    if (error) throw error
  } catch (error) {
    console.error('[ai_usage] no se pudo devolver el consumo', { usageId, error })
  }
}
