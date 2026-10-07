'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { withDone } from '@/lib/done'
import { requireUser } from '@/server/auth'
import { firstSteps } from '@/server/first-steps'
import { markPaymentsSeen, markTourSeen } from '@/server/practitioners'

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

/**
 * "Ver pagos", the third of "Primeros pasos". The step is the visit, so the
 * button is this action and not a link: it remembers the visit and then opens
 * the screen. When it was the last step left, the screen says so.
 */
export async function openPaymentsStepAction() {
  const user = await requireUser()
  const before = await firstSteps(user.id)
  await markPaymentsSeen(user.id)
  revalidatePath('/inicio')

  const last = before.hasPatient && before.hasPlan
  redirect(last ? withDone('/cobros?pasos=pagos', 'primeros-pasos-listos') : '/cobros?pasos=pagos')
}
