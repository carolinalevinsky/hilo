'use server'

import { revalidatePath } from 'next/cache'

import { formError, formOk, type FormState } from '@/lib/form-state'
import { firstName } from '@/lib/whatsapp'
import { requireUser } from '@/server/auth'
import {
  MercadoPagoError,
  buildExternalReference,
  connectMercadoPago,
  createPaymentLink,
  disconnectMercadoPago,
} from '@/server/mercadopago'
import { updatePatientBilling } from '@/server/patients'
import { deletePayment, recordPayment } from '@/server/payments'

function messageFor(error: unknown): string {
  if (error instanceof MercadoPagoError) return error.message
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: { message: string }[] }).issues
    return issues[0]?.message ?? 'Revisá los datos.'
  }
  return 'No pudimos guardar. Probá de nuevo.'
}

/**
 * The `···` on a Cobros row. v1 edited these three fields in place; this is the
 * same three, through a function that can only write those columns.
 */
export async function updateBillingAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser()

  try {
    await updatePatientBilling(user.id, String(formData.get('patientId')), {
      sessionFee: formData.get('sessionFee'),
      billingFrequency: formData.get('billingFrequency') ?? 'monthly',
      expectedSessionsPerMonth: formData.get('expectedSessionsPerMonth'),
    })
  } catch (error) {
    return formError(messageFor(error))
  }

  revalidatePath('/cobros')
  revalidatePath('/pacientes')
  return formOk()
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
      // El nombre de pila y no el completo, y el motivo es el mismo que el de
      // `calendar_privacy`: esto queda escrito en un servidor de Mercado Pago y
      // se muestra en la pantalla de pago que abre la familia, que después se
      // reenvía. "Sesiones de Tomás Pérez" deja asentado en un tercero que esa
      // persona con nombre y apellido recibe sesiones de esta profesional; el
      // nombre de pila alcanza para que la familia sepa qué está pagando.
      //
      // `external_reference` sigue llevando el `patient_id`, así que dos Tomás
      // en el mismo mes se distinguen donde hace falta distinguirlos, que es
      // del lado de Hilo y no del lado de Mercado Pago.
      title: `Sesiones de ${firstName(patientName)}`,
      externalReference: buildExternalReference(user.id, patientId, period),
    })
    // The link travels back in the form message so the practitioner can copy it.
    return formOk(link)
  } catch (error) {
    return formError(messageFor(error))
  }
}
