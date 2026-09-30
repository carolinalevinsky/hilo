import { logAction } from './audit'
import { getDb } from './db'
import { lifecycleError } from './document-lifecycle'

/**
 * La papelera: lo clínico no se borra, se aparta.
 *
 * Registros de sesión, informes, evaluaciones y pagos. Mandar algo a la
 * papelera lo saca de todas las pantallas y de todas las cuentas —informes,
 * estadísticas, saldo del mes— y se puede recuperar cuando sea, sin
 * vencimiento: la historia clínica tiene obligación de conservación, y un
 * "borrar" que no se puede deshacer es el error más caro que tiene esta
 * aplicación.
 *
 * Esconderlo no depende de que cada consulta se acuerde de filtrar. Lo esconde
 * la política de lectura de cada tabla (migración `20260930020950`), así que un
 * `select` que alguien escriba mañana ya sale sin la papelera. Por eso mandar,
 * recuperar y listar pasan por funciones de la base: una fila que la política
 * no deja ver tampoco se deja actualizar desde una sesión.
 *
 * Lo que se firmó no pasa por acá: se anula (`document-lifecycle.ts`). El
 * trigger lo rechaza si alguien lo intenta.
 */

export type TrashKind = 'session' | 'report' | 'assessment' | 'payment'

export type TrashItem = {
  kind: TrashKind
  id: string
  label: string
  happened_on: string
  deleted_at: string
}

export async function trashRecord(practitionerId: string, kind: TrashKind, recordId: string) {
  const db = await getDb()
  const { data, error } = await db.rpc('trash_record', { kind, record_id: recordId })
  if (error) throw lifecycleError(error)
  if (data) await logAction(practitionerId, 'trash', kind, recordId)
  return Boolean(data)
}

export async function restoreRecord(practitionerId: string, kind: TrashKind, recordId: string) {
  const db = await getDb()
  const { data, error } = await db.rpc('restore_record', { kind, record_id: recordId })
  if (error) throw error
  if (data) await logAction(practitionerId, 'restore', kind, recordId)
  return Boolean(data)
}

/**
 * Lo que hay en la papelera de un paciente, lo último primero.
 *
 * `practitionerId` no viaja a la base —la función filtra por la sesión— pero
 * está en la firma como en todo `src/server/`, para que quien llama diga de
 * quién está hablando.
 */
export async function listTrash(_practitionerId: string, patientId: string) {
  const db = await getDb()
  const { data, error } = await db.rpc('list_trash', { patient: patientId })
  if (error) throw error
  return (data ?? []) as TrashItem[]
}
