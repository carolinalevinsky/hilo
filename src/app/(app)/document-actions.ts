'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { formError, formErrorFor, formOk, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import {
  DocumentLifecycleError,
  reopenDocument,
  signDocument,
  voidDocument,
} from '@/server/document-lifecycle'
import { listVersions, restoreVersion, type DocumentKind } from '@/server/document-versions'

/**
 * Volver a una versión anterior de un documento clínico.
 *
 * Una sola acción para los dos —el informe y el análisis de una evaluación—
 * porque `restoreVersion` ya sabe de cuál se trata leyendo la fila: la versión
 * dice a qué documento pertenece, así que el navegador no manda ni el tipo ni el
 * id del documento, sólo el de la versión. Un dato menos que viene de afuera es
 * un dato menos que hay que desconfiar.
 *
 * Vive acá y no adentro de `informes/` o de `evaluaciones/` porque no es de
 * ninguna de las dos pantallas. Un archivo que no es `page`, `layout` ni `route`
 * no crea una ruta; el precedente es `pacientes/session-actions.ts`.
 *
 * Devuelve el texto restaurado y el historial ya actualizado, para que el editor
 * se acomode sin recargar la página — recargarla volvería a disparar el `?ia=1`
 * que trae la URL de un documento recién creado.
 */
export async function restoreVersionAction(versionId: string) {
  const user = await requireUser()

  const restored = await restoreVersion(user.id, versionId)
  // RLS ya limita a las propias; esto cubre el id que no existe.
  if (!restored) throw new Error('No encontramos esa versión.')

  const versions = await listVersions(user.id, restored.kind, restored.documentId)

  revalidatePath(
    restored.kind === 'report'
      ? `/informes/${restored.documentId}`
      : `/evaluaciones/${restored.documentId}`,
  )

  return { body: restored.body, versions }
}

// ─── Firmar, corregir, anular ───────────────────────────────────────────────
//
// Las reglas las hace cumplir la base (ver `document-lifecycle.ts`); estas
// acciones sólo traducen la respuesta a algo que se pueda mostrar. El tipo de
// documento viene del navegador, así que se valida: un valor que no es ninguno
// de los dos no llega a la base.

const Kind = z.enum(['report', 'assessment'])

function pathFor(kind: DocumentKind, documentId: string) {
  return kind === 'report' ? `/informes/${documentId}` : `/evaluaciones/${documentId}`
}

function lifecycleFailure(error: unknown, fallback: string): FormState {
  if (error instanceof DocumentLifecycleError) return formError(error.message)
  return formErrorFor(error, fallback)
}

export async function signDocumentAction(kind: DocumentKind, documentId: string) {
  const user = await requireUser()
  const which = Kind.parse(kind)
  try {
    await signDocument(user.id, which, documentId)
  } catch (error) {
    return lifecycleFailure(error, 'No pudimos firmarlo. Probá de nuevo.')
  }
  revalidatePath(pathFor(which, documentId))
  revalidatePath('/informes')
  return formOk('Firmado.')
}

export async function reopenDocumentAction(kind: DocumentKind, documentId: string) {
  const user = await requireUser()
  const which = Kind.parse(kind)
  try {
    await reopenDocument(user.id, which, documentId)
  } catch (error) {
    return lifecycleFailure(error, 'No pudimos abrirlo para corregir. Probá de nuevo.')
  }
  revalidatePath(pathFor(which, documentId))
  revalidatePath('/informes')
  return formOk(null)
}

export async function voidDocumentAction(
  kind: DocumentKind,
  documentId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const which = Kind.parse(kind)
  const reason = String(formData.get('reason') ?? '')
  try {
    await voidDocument(user.id, which, documentId, reason)
  } catch (error) {
    const failure = lifecycleFailure(error, 'No pudimos anularlo. Probá de nuevo.')
    return { ...failure, values: { reason } }
  }
  revalidatePath(pathFor(which, documentId))
  revalidatePath('/informes')
  return formOk('Anulado.')
}
