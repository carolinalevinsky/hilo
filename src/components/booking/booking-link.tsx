'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { firstName, whatsappLink } from '@/lib/whatsapp'

/**
 * The link a practitioner hands to families, with the two things they do with
 * it: copy it, or send it.
 *
 * Shown in full and readable — `hilo.uy/reservar/lucia-fernandez` — because it
 * gets pasted into an Instagram bio and read off a card. That is also why the
 * slug exists at all: v1's link carried a UUID.
 */
export function BookingLink({ url, practitionerName }: { url: string; practitionerName: string }) {
  const [copied, setCopied] = useState(false)

  const message = `Hola! Te paso el link para pedir un turno conmigo: ${url}`

  return (
    <div className="space-y-2.5">
      <code className="block overflow-x-auto rounded-xl bg-muted px-3.5 py-2.5 text-[13px] whitespace-nowrap">
        {url}
      </code>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
        >
          <Copy className="size-3.5" />
          {copied ? '¡Copiado!' : 'Copiar link'}
        </Button>

        <Button asChild size="sm" variant="outline">
          <a
            href={whatsappLink(null, message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Compartir por WhatsApp
          </a>
        </Button>

        <Button asChild size="sm" variant="ghost">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Ver cómo lo ven ellos
          </a>
        </Button>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Ponelo en tu Instagram o mandáselo a quien te consulte. {firstName(practitionerName)},
        las solicitudes te llegan acá y también por mail.
      </p>
    </div>
  )
}
