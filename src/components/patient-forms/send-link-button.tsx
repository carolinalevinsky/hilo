'use client'

import { Copy, MessageCircle, Send } from '@/components/icons'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/lib/whatsapp'

/**
 * Makes a link for the family or the patient, and offers the two ways to send
 * it. Used by "Antes de empezar" and by each questionnaire.
 *
 * The link is shown once. Only its hash is stored, so after a reload it cannot
 * be shown again — and saying so, next to it, is cheaper than a practitioner
 * wondering where it went. Making another one retires this one.
 *
 * `create` is a Server Action already bound to its patient (and scale), handed
 * down from a Server Component. `message` has `{url}` where the link goes, and
 * nothing clinical — same rule as every other message Hilo writes
 * (`@/lib/whatsapp`).
 */
export function SendLinkButton({
  create,
  message,
  phone,
  label,
  againLabel = 'Mandar un link nuevo',
  again = false,
  lifetime,
}: {
  create: () => Promise<{ url: string } | { error: string }>
  message: string
  phone: string | null
  label: string
  againLabel?: string
  /** A link was already sent: the button is quieter and says it replaces it. */
  again?: boolean
  /** "14 días", for the line under the link. */
  lifetime: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  function makeLink() {
    setError(null)
    startTransition(async () => {
      const result = await create()
      if ('url' in result) setUrl(result.url)
      else setError(result.error)
    })
  }

  if (url) {
    const text = message.replace('{url}', url)

    return (
      <div className="space-y-2.5 rounded-xl bg-violet-soft px-3.5 py-3">
        <p className="text-meta font-semibold text-violet">
          Link listo. Vence en {lifetime} y se muestra sólo esta vez.
        </p>
        <div className="flex flex-wrap gap-2">
          {phone ? (
            <Button asChild size="sm" className="bg-[#25d366] text-white hover:bg-[#25d366]/90">
              <a href={whatsappLink(phone, text)} target="_blank" rel="noopener noreferrer">
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
              void navigator.clipboard.writeText(text)
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
      <Button
        type="button"
        size="sm"
        variant={again ? 'outline' : 'default'}
        onClick={makeLink}
        disabled={pending}
      >
        <Send className="size-4" />
        {pending ? 'Creando…' : again ? againLabel : label}
      </Button>
      {error ? <p className="text-meta text-[#c0392b]">{error}</p> : null}
    </div>
  )
}
