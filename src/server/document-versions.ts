import type { Database } from '@/lib/database.types'

import { logAction } from './audit'
import { getDb } from './db'

/**
 * El historial de un documento clínico, y el único lugar por donde su texto se
 * reemplaza.
 *
 * Los dos documentos que se firman —el informe y el análisis de una evaluación—
 * son la misma cosa para este problema: texto plano que alguien escribe,
 * corrige y firma. Así que en vez de dos historiales iguales hay uno, y las dos
 * funciones que antes hacían el `update` a secas —`updateReportContent` y
 * `updateAssessmentAnalysis`— ahora pasan por acá.
 *
 * Eso es lo que hace la regla verdadera. Un historial que hay que acordarse de
 * escribir se olvida en el tercer camino que aparezca; éste no se puede saltear,
 * porque no hay otra forma de escribir el cuerpo del documento.
 *
 * La razón por la que existe está en la migración `20260910090000`.
 */

export type DocumentKind = 'report' | 'assessment'

/**
 * Qué reemplazó al texto guardado.
 *
 * Está en la lista porque la pregunta que alguien se hace al abrir el historial
 * no es "cuándo" sino "cuál era la mía": `ai` es lo que había justo antes de
 * aplicar una propuesta de la IA, `edit` lo que había antes de una edición a
 * mano, y `restore` lo que había antes de volver a una versión anterior —para
 * que deshacer también se pueda deshacer.
 */
export type VersionReason = 'ai' | 'edit' | 'restore'

export type DocumentVersion = Database['public']['Tables']['document_versions']['Row']

/** Cuántas versiones se listan. Explícito: un tope que no se ve es el defecto F. */
const MAX_VERSIONS = 50

// ─── Leer y escribir el cuerpo, según de qué documento se trate ─────────────
//
// Un `switch` y no una tabla de nombres de columna. La tabla sería más corta y
// obligaría a un `as` para que el cliente de Supabase acepte una columna
// calculada, y un `as` acá apaga justamente la comprobación que avisa si mañana
// `reports.content` cambia de nombre.

async function readBody(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
): Promise<string | null> {
  const db = await getDb()

  if (kind === 'report') {
    const { data, error } = await db
      .from('reports')
      .select('content')
      .eq('id', documentId)
      .eq('practitioner_id', practitionerId)
      .maybeSingle()
    if (error) throw error
    return data?.content ?? null
  }

  const { data, error } = await db
    .from('assessments')
    .select('analysis')
    .eq('id', documentId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()
  if (error) throw error
  return data?.analysis ?? null
}

async function writeBody(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
  body: string,
) {
  const db = await getDb()

  const query =
    kind === 'report'
      ? db.from('reports').update({ content: body })
      : db.from('assessments').update({ analysis: body })

  const { error } = await query.eq('id', documentId).eq('practitioner_id', practitionerId)
  if (error) throw error
}

/**
 * Reemplaza el cuerpo de un documento, guardando antes lo que decía.
 *
 * El orden importa y es el único que sirve: primero la copia, después el
 * reemplazo. Al revés, un `insert` que falla después de un `update` exitoso deja
 * el texto viejo perdido, que es exactamente lo que esto viene a impedir. En
 * este orden, lo que puede quedar mal es una versión guardada de un cambio que
 * no llegó a ocurrir — una fila de más, que no le hace daño a nadie.
 *
 * No guarda versión cuando no hay nada que guardar: un documento vacío, o un
 * texto idéntico al que ya está. Lo segundo pasa seguido, porque el editor
 * guarda al salir del modo edición aunque no se haya tocado una letra.
 */
export async function replaceDocumentBody(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
  body: string,
  reason: VersionReason,
) {
  const current = await readBody(practitionerId, kind, documentId)

  if (current !== null && current.trim() !== '' && current !== body) {
    await recordVersion(practitionerId, kind, documentId, current, reason)
  }

  await writeBody(practitionerId, kind, documentId, body)
  await logAction(practitionerId, 'update', kind, documentId)
}

/**
 * Guarda una versión.
 *
 * Exportada porque hay un caso que no pasa por `replaceDocumentBody`: la
 * propuesta de la IA se aplica desde el editor con el texto ya en la mano.
 * Igual conviene que el reemplazo pase por la función de arriba, así que esto
 * queda para los tests y para lo que venga.
 */
export async function recordVersion(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
  body: string,
  reason: VersionReason,
) {
  const db = await getDb()

  const { error } = await db.from('document_versions').insert({
    practitioner_id: practitionerId,
    report_id: kind === 'report' ? documentId : null,
    assessment_id: kind === 'assessment' ? documentId : null,
    body,
    replaced_by: reason,
  })

  if (error) throw error
}

/** Las versiones de un documento, la más nueva primero. */
export async function listVersions(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
): Promise<DocumentVersion[]> {
  const db = await getDb()

  const { data, error } = await db
    .from('document_versions')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .eq(kind === 'report' ? 'report_id' : 'assessment_id', documentId)
    .order('created_at', { ascending: false })
    .limit(MAX_VERSIONS)

  if (error) throw error
  return data
}

/**
 * Vuelve a una versión anterior, y guarda como versión lo que había.
 *
 * Esa segunda mitad es la que hace que restaurar no sea otra forma de perder
 * texto: si alguien restaura la versión equivocada, lo que estaba escrito hace
 * un segundo sigue estando en la lista, arriba de todo.
 *
 * Devuelve el texto restaurado para que el editor lo muestre sin recargar. El
 * documento y la profesional salen de la fila de `document_versions`, no de lo
 * que diga el navegador: pedir restaurar una versión ajena no encuentra fila.
 */
export async function restoreVersion(practitionerId: string, versionId: string) {
  const db = await getDb()

  const { data: version, error } = await db
    .from('document_versions')
    .select('*')
    .eq('id', versionId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  if (error) throw error
  if (!version) return null

  const kind: DocumentKind = version.report_id ? 'report' : 'assessment'
  const documentId = version.report_id ?? version.assessment_id
  if (!documentId) return null

  await replaceDocumentBody(practitionerId, kind, documentId, version.body, 'restore')

  return { kind, documentId, body: version.body }
}
