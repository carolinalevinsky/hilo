'use client'

import { Copy, MessageCircle, Send } from '@/components/icons'
import { useState, useTransition } from 'react'

import { createIntakeLinkAction } from '@/app/(app)/pacientes/intake-actions'
import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/lib/whatsapp'

/**
 * Makes the "Antes de empezar" link and offers the two ways to send it.
 *
 * The link is shown once. Only its hash is stored, so after a reload it cannot
 * be shown again — and saying so, next to it, is cheaper than a practitioner
 * wondering where it went. Making another one retires this one.
 *
 * The WhatsApp message says who it is about and what to do, and nothing
 * clinical — same rule as every other message Hilo writes (`@/lib/whatsapp`).
 */
export function IntakeLinkButton({
  patientId,
  phone,
  patientFirstName,
  practitionerFirstName,
  again = false,
}: {
  patientId: string
  phone: string | null
  patientFirstName: string
  practitionerFirstName: string
  /** A link was already sent: the button says it replaces that one. */
  again?: boolean
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  function create() {
    setError(null)
    startTransition(async () => {
      const result = await createIntakeLinkAction(patientId)
      if ('url' in result) setUrl(result.url)
      else setError(result.error)
    })
  }

  if (url) {
    const message = `¡Hola! Antes de la primera sesión de ${patientFirstName}, te pido que completes estos datos y firmes el consentimiento. Lleva unos minutos: ${url} Gracias, ${practitionerFirstName}.`

    return (
      <div className="space-y-2.5 rounded-xl bg-violet-soft px-3.5 py-3">
        <p className="text-meta font-semibold text-violet">
          Link listo. Vence en 14 días y se muestra sólo esta vez.
        </p>
        <div className="flex flex-wrap gap-2">
          {phone ? (
            <Button asChild size="sm" className="bg-[#25d366] text-white hover:bg-[#25d366]/90">
              <a href={whatsappLink(phone, message)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                Mandar por WhatsApp
              </a>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(message)
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            }}
          >
            <Copy className="size-3.5" />
            {copied ? '¡Copiado!' : 'Copiar mensaje'}
          </Button>
        </div>
        {phone ? null : (
          <p className="text-meta text-muted-foreground">
            No hay teléfono en la ficha: copiá el mensaje y mandalo por donde hablen.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <Button type="button" size="sm" variant={again ? 'outline' : 'default'} onClick={create} disabled={pending}>
        <Send className="size-4" />
        {pending ? 'Creando…' : again ? 'Mandar un link nuevo' : 'Mandar “Antes de empezar”'}
      </Button>
      {error ? <p className="text-meta text-[#c0392b]">{error}</p> : null}
    </div>
  )
}
