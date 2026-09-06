'use server'

import { requireUser } from '@/server/auth'
import { markTourSeen } from '@/server/practitioners'

/**
 * "Ya vi el recorrido."
 *
 * Sin `revalidatePath`: el recorrido ya se cerró en la pantalla cuando esto
 * corre, y volver a pedir Inicio entero para enterarse de algo que el navegador
 * acaba de decidir sería trabajo por nada. Lo que importa es que quede escrito
 * para la próxima vez que entre, desde donde sea.
 */
export async function markTourSeenAction() {
  const user = await requireUser()
  await markTourSeen(user.id)
}
