'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { formError, type FormState } from '@/lib/form-state'
import type { RecipientId } from '@/lib/recipients'
import { requireUser } from '@/server/auth'
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
