'use server'

import { revalidatePath } from 'next/cache'

import { requireUser } from '@/server/auth'
import { listVersions, restoreVersion } from '@/server/document-versions'

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
