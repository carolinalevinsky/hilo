'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireUser } from '@/server/auth'
import { restoreRecord } from '@/server/trash'

/**
 * Sacar algo de la papelera.
 *
 * Una acción para los cuatro tipos, porque la papelera es una sola y vive en la
 * ficha del paciente. Mandar a la papelera, en cambio, tiene una acción por
 * pantalla: cada una sabe adónde volver después.
 */

const Restore = z.object({
  kind: z.enum(['session', 'report', 'assessment', 'payment']),
  id: z.uuid(),
  patientId: z.uuid(),
})

export async function restoreFromTrashAction(formData: FormData) {
  const user = await requireUser()
  const { kind, id, patientId } = Restore.parse(Object.fromEntries(formData))

  await restoreRecord(user.id, kind, id)

  revalidatePath(`/pacientes/${patientId}`)
  if (kind === 'report' || kind === 'assessment') revalidatePath('/informes')
  if (kind === 'payment') revalidatePath('/cobros')
}
