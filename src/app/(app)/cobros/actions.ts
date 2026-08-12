'use server'

import { revalidatePath } from 'next/cache'

import { formError, formOk, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import {
  MercadoPagoError,
  buildExternalReference,
  connectMercadoPago,
  createPaymentLink,
  disconnectMercadoPago,
} from '@/server/mercadopago'
import { deletePayment, recordPayment } from '@/server/payments'

function messageFor(error: unknown): string {
  if (error instanceof MercadoPagoError) return error.message
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: { message: string }[] }).issues
    return issues[0]?.message ?? 'Revisá los datos.'
  }
  return 'No pudimos guardar. Probá de nuevo.'
}

export async function recordPaymentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await recordPayment(user.id, {
      patientId: formData.get('patientId'),
      paidOn: formData.get('paidOn'),
      period: formData.get('period'),
      amount: formData.get('amount'),
      method: formData.get('method') ?? 'cash',
      note: formData.get('note'),
    })
  } catch (error) {
    return formError(messageFor(error))
  }

  revalidatePath('/cobros')
  return formOk('Pago registrado.')
}

export async function deletePaymentAction(formData: FormData) {
  const user = await requireUser()

  await deletePayment(user.id, String(formData.get('paymentId')))
  revalidatePath('/cobros')
}

export async function connectMercadoPagoAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await connectMercadoPago(user.id, { accessToken: formData.get('accessToken') })
  } catch (error) {
    return formError(messageFor(error))
  }

  revalidatePath('/cobros')
  return formOk('Mercado Pago quedó conectado.')
}

export async function disconnectMercadoPagoAction() {
  const user = await requireUser()

  await disconnectMercadoPago(user.id)
  revalidatePath('/cobros')
}

/**
 * Builds a Checkout Pro link for one patient and one month.
 *
 * Returns the link rather than redirecting to it: the practitioner sends it to
 * the family over WhatsApp, they do not open it themselves.
 */
export async function createPaymentLinkAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  const patientId = String(formData.get('patientId'))
  const period = String(formData.get('period'))
  const amount = Number(formData.get('amount'))
  const patientName = String(formData.get('patientName'))

  try {
    const link = await createPaymentLink(user.id, {
      amount,
      title: `Sesiones de ${patientName}`,
      externalReference: buildExternalReference(user.id, patientId, period),
    })
    // The link travels back in the form message so the practitioner can copy it.
    return formOk(link)
  } catch (error) {
    return formError(messageFor(error))
  }
}
