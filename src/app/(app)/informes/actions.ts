'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { env } from '@/lib/env'
import { formError, formOk, type FormState } from '@/lib/form-state'
import type { RecipientId } from '@/lib/recipients'
import { requireUser } from '@/server/auth'
import { createFormatRequest, TooManyFormatRequests } from '@/server/format-requests'
import { sendFormatRequestNotification } from '@/server/notifications'
import { recordUsage } from '@/server/ai-usage'
import { QuotaExceededError, assertQuota, quotaMessage } from '@/server/plans'
import { getPractitioner } from '@/server/practitioners'
import { gatherReportContext, reportFallback } from '@/server/report-prompt'
import {
  createReport,
  deleteReport,
  titleFor,
  updateReportContent,
} from '@/server/reports'

/**
 * Creating a report.
 *
 * The row is created with the offline draft already in it, *before* any AI call.
 * Two reasons, and both are about what happens when something goes wrong: the
 * practitioner always has a document to edit and sign even if Anthropic is down,
 * and the quota is charged at the moment of creation rather than at the moment
 * of success — so a retry loop cannot mint free generations.
 *
 * The AI then streams over it from `/api/ai/informe`.
 */
export async function createReportAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  const patientId = String(formData.get('patientId') ?? '')
  const recipient = String(formData.get('recipient') ?? '') as RecipientId
  const inputNotes = String(formData.get('inputNotes') ?? '').trim() || null

  if (!patientId) return formError('Elegí un paciente.')
  if (!recipient) return formError('Elegí para quién es el informe.')

  try {
    await assertQuota(user.id, practitioner.plan, 'reports')
  } catch (error) {
    if (error instanceof QuotaExceededError) return formError(quotaMessage(error.status))
    throw error
  }

  const context = await gatherReportContext(user.id, patientId)

  // Una unidad por informe creado. Antes la contaba la fila de `reports`, que
  // la profesional puede borrar; ahora la cuenta `ai_usage`, que no.
  await recordUsage(user.id, 'reports')

  const report = await createReport(user.id, {
    patientId,
    recipient,
    title: titleFor(recipient, practitioner.discipline, context.patientName),
    content: reportFallback({
      context,
      recipient,
      disciplineId: practitioner.discipline,
    }),
    inputNotes,
    aiGenerated: false,
  })

  revalidatePath('/informes')
  redirect(`/informes/${report.id}?ia=1`)
}

export async function saveReportAction(reportId: string, content: string) {
  const user = await requireUser()
  await updateReportContent(user.id, reportId, content)
  revalidatePath(`/informes/${reportId}`)
}

export async function deleteReportAction(formData: FormData) {
  const user = await requireUser()

  await deleteReport(user.id, String(formData.get('reportId')))
  revalidatePath('/informes')
  redirect('/informes')
}

/**
 * "Me falta este formato de informe."
 *
 * Guarda primero y avisa después, y el aviso no puede voltear lo guardado: si
 * Resend está caído, el pedido igual queda en la tabla y se puede leer. Al revés
 * —mandar el mail y que falle el insert— el pedido existiría sólo en una casilla
 * de correo, que es el peor lugar donde puede vivir algo que hay que atender.
 */
export async function requestFormatAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()
  const detail = String(formData.get('detail') ?? '')

  try {
    await createFormatRequest(user.id, { detail })
  } catch (error) {
    // El tope es una respuesta y se dice con sus palabras; un fallo de Zod
    // también. Cualquier otra cosa es un problema nuestro y no se le cuenta a
    // quien está del otro lado.
    const message =
      error instanceof TooManyFormatRequests
        ? error.message
        : error && typeof error === 'object' && 'issues' in error
          ? ((error as { issues: { message: string }[] }).issues[0]?.message ??
            'Revisá lo que escribiste.')
          : 'No pudimos guardar tu pedido. Probá de nuevo en un momento.'

    return formError(message, { detail })
  }

  // Sin `OWNER_EMAIL` configurado el pedido queda guardado igual y no se avisa.
  // Ver la nota en `src/lib/env.ts`: es una notificación sin destinatario, no un
  // control que se apaga solo.
  if (env.OWNER_EMAIL) {
    const practitioner = await getPractitioner(user.id)

    await sendFormatRequestNotification({
      to: env.OWNER_EMAIL,
      practitionerName: practitioner.full_name,
      practitionerEmail: practitioner.email,
      discipline: practitioner.discipline,
      detail: detail.trim(),
    })
  }

  revalidatePath('/informes')

  return formOk('Listo, nos llegó tu pedido. Te escribimos cuando esté.')
}
