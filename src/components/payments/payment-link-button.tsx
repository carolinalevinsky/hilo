'use client'

import { Copy, Link2 } from '@/components/icons'
import { useActionState, useState } from 'react'

import { createPaymentLinkAction } from '@/app/(app)/cobros/actions'
import { Button } from '@/components/ui/button'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { firstName, whatsappLink } from '@/lib/whatsapp'

/**
 * Builds a Mercado Pago link for one patient's outstanding amount and offers the
 * two things a practitioner does with it: copy it, or send it over WhatsApp.
 *
 * The message carries the amount and the month and nothing else. A payment
 * reminder is not a place for clinical content.
 */
export function PaymentLinkButton({
  patientId,
  patientName,
  patientPhone,
  period,
  periodName,
  amount,
}: {
  patientId: string
  patientName: string
  patientPhone: string | null
  period: string
  periodName: string
  amount: number
}) {
  const [state, formAction, pending] = useActionState(
    createPaymentLinkAction,
    EMPTY_FORM_STATE,
  )
  const [copied, setCopied] = useState(false)

  const link = state.ok ? state.message : null

  if (link) {
    const message = `Hola! Te paso el link para abonar las sesiones de ${firstName(patientName)} de ${periodName.toLowerCase()}: ${link}`

    return (
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
        >
          <Copy className="size-3.5" />
          {copied ? '¡Copiado!' : 'Copiar link'}
        </Button>
        <Button asChild size="sm">
          <a
            href={whatsappLink(patientPhone, message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enviar por WhatsApp
          </a>
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="patientName" value={patientName} />
      <input type="hidden" name="period" value={period} />
      <input type="hidden" name="amount" value={amount} />

      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        <Link2 className="size-3.5" />
        {pending ? 'Creando…' : 'Link de pago'}
      </Button>

      {state.message && !state.ok ? (
        <p className="mt-1 text-[11.5px] text-[#c0392b]">{state.message}</p>
      ) : null}
    </form>
  )
}
