import { z } from 'zod'

import { TO_COMPLETE } from '@/lib/to-complete'

import { logAction } from './audit'
import { getDb } from './db'
import type { DocumentKind } from './document-versions'

/**
 * Firmar, corregir y anular un informe o una evaluación.
 *
 * Las reglas no viven acá: viven en el trigger `guard_clinical_document`
 * (migración `20260930020950`). Esto sólo pide el cambio. Así, lo que diga una
 * pantalla, un test o un `curl` a PostgREST con la sesión de alguien, recibe la
 * misma respuesta — un documento firmado no cambia de texto por ningún camino.
 *
 *   **Firmar** congela el texto. La hora la pone la base, no el navegador, y la
 *   base guarda una copia de lo firmado en el historial.
 *   **Corregir** vuelve a abrir el texto como borrador. La copia firmada queda en
 *   el historial para siempre: es la prueba de qué se entregó.
 *   **Anular** es el final, y exige un motivo. Sólo se anula lo que se firmó
 *   alguna vez; un borrador se manda a la papelera (`trash.ts`).
 */

/**
 * Lo que la base contestó cuando una regla del ciclo de vida no se cumplió.
 *
 * El mensaje ya está en castellano —lo escribe el trigger— y se puede mostrar
 * tal cual: le dice a la profesional qué hacer ("primero corregilo").
 */
export class DocumentLifecycleError extends Error {}

const LIFECYCLE_HINTS = new Set([
  'document_signed',
  'document_voided',
  'document_empty',
  'document_not_signed',
])

/** Traduce un error del trigger a `DocumentLifecycleError`; el resto sigue igual. */
export function lifecycleError(error: { message: string; hint?: string | null }) {
  if (error.hint && LIFECYCLE_HINTS.has(error.hint)) {
    return new DocumentLifecycleError(error.message)
  }
  return error
}

export const VoidReason = z
  .string()
  .trim()
  .min(3, 'Escribí por qué lo anulás.')
  .max(500, 'El motivo puede tener hasta 500 caracteres.')

type Change = { signed_at?: string | null; voided_at?: string; void_reason?: string }

async function change(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
  values: Change,
) {
  const db = await getDb()
  const query =
    kind === 'report'
      ? db.from('reports').update(values)
      : db.from('assessments').update(values)

  const { data, error } = await query
    .eq('id', documentId)
    .eq('practitioner_id', practitionerId)
    .select('id, signed_at, voided_at')
    .maybeSingle()

  if (error) throw lifecycleError(error)
  return data
}

/** "Revisé y firmo". Devuelve la hora que puso la base. */
export async function signDocument(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
) {
  const db = await getDb()
  const { data: current, error: readError } =
    kind === 'report'
      ? await db
          .from('reports')
          .select('body:content')
          .eq('id', documentId)
          .eq('practitioner_id', practitionerId)
          .maybeSingle()
      : await db
          .from('assessments')
          .select('body:analysis')
          .eq('id', documentId)
          .eq('practitioner_id', practitionerId)
          .maybeSingle()
  if (readError) throw readError
  if (!current) return null
  if (current.body?.includes(TO_COMPLETE)) {
    throw new DocumentLifecycleError(
      `Quedan partes marcadas ${TO_COMPLETE}. Completalas o sacalas antes de firmar.`,
    )
  }

  // El valor no importa: el trigger lo reemplaza por `now()`. Mandarlo es lo
  // que dice "firmá".
  const row = await change(practitionerId, kind, documentId, {
    signed_at: new Date().toISOString(),
  })
  if (!row) return null
  await logAction(practitionerId, 'sign', kind, documentId)
  return row.signed_at
}

/** "Corregir": el texto vuelve a ser un borrador; lo firmado queda en el historial. */
export async function reopenDocument(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
) {
  const row = await change(practitionerId, kind, documentId, { signed_at: null })
  if (!row) return false
  await logAction(practitionerId, 'reopen', kind, documentId)
  return true
}

/** "Anular", con su motivo. Definitivo. */
export async function voidDocument(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
  reason: unknown,
) {
  const why = VoidReason.parse(reason)
  const row = await change(practitionerId, kind, documentId, {
    voided_at: new Date().toISOString(),
    void_reason: why,
  })
  if (!row) return false
  await logAction(practitionerId, 'void', kind, documentId)
  return true
}

/** En qué punto está un documento, para decidir qué botones mostrar. */
export type DocumentState = 'draft' | 'signed' | 'voided'

export function documentState(row: {
  signed_at: string | null
  voided_at: string | null
}): DocumentState {
  if (row.voided_at) return 'voided'
  if (row.signed_at) return 'signed'
  return 'draft'
}

/**
 * Si el documento se firmó alguna vez, aunque ahora esté abierto para corregir.
 *
 * Decide qué se ofrece para sacarlo de la vista: lo que se firmó se anula, un
 * borrador que nunca se entregó va a la papelera. Pregunta al historial y no a
 * `signed_at` por lo mismo que `document_was_signed` en la base.
 */
export async function wasEverSigned(
  practitionerId: string,
  kind: DocumentKind,
  documentId: string,
) {
  const db = await getDb()
  const { count, error } = await db
    .from('document_versions')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .eq(kind === 'report' ? 'report_id' : 'assessment_id', documentId)
    .eq('replaced_by', 'signed')
  if (error) throw error
  return (count ?? 0) > 0
}

/** Lo que la hoja impresa dice de sí misma. Ver `ClinicalDocument`. */
export function documentSeal(row: {
  signed_at: string | null
  voided_at: string | null
  void_reason: string | null
}) {
  if (row.voided_at) {
    return { state: 'voided' as const, voidedAt: row.voided_at, reason: row.void_reason ?? '' }
  }
  if (row.signed_at) return { state: 'signed' as const, signedAt: row.signed_at }
  return { state: 'draft' as const }
}
