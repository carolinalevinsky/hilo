'use server'

import { revalidatePath } from 'next/cache'

import { formErrorFor, formOk, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import { updatePatientBilling } from '@/server/patients'
import { recordPayment } from '@/server/payments'
import { trashRecord } from '@/server/trash'

function failed(error: unknown): FormState {
  return formErrorFor(error, 'No pudimos guardar. Probá de nuevo.')
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
    return failed(error)
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
    return failed(error)
  }

  revalidatePath('/cobros')
  return formOk('Pago registrado.')
}

export async function trashPaymentAction(formData: FormData) {
  const user = await requireUser()

  await trashRecord(user.id, 'payment', String(formData.get('paymentId')))
  revalidatePath('/cobros')
}
