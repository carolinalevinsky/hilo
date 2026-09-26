'use client'

import { useState } from 'react'

import { Copy } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/lib/whatsapp'

/**
 * The link, offered for copying, right after it was minted.
 *
 * ─── Why this is always on screen and not only when the mail fails ─────────
 *
 * Because "the mail failed" is not a state we can see. `send()` in
 * `notifications.ts` returns false when Resend refuses the request, and that is
 * the easy half. The common half is silent: Resend accepts the message, and it
 * lands in spam, or the address had a typo that is a real mailbox, or the
 * domain's DMARC drops it. Nothing comes back, and the invitation looks sent.
 *
 * The link only exists in this one response — the database has its SHA-256 and
 * nothing else — so if the screen does not offer it now, the only way back to a
 * working link is to resend, which mints a different one. Showing it always
 * costs a line of interface and removes the dead end.
 */
export function InviteLink({ link, invitee }: { link: string; invitee?: string }) {
  const [copied, setCopied] = useState(false)

  const message = invitee
    ? `¡Hola ${invitee}! Te invito a Ombúa, la uso para llevar mis pacientes y sesiones. Entrá acá y elegís tu contraseña: ${link}`
    : `Te invito a Ombúa. Entrá acá y elegís tu contraseña: ${link}`

  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-muted/40 p-3.5">
      {/* Puede haber dos de estos en pantalla a la vez —el de "Invitar a
          alguien" y el que deja "Generar enlace" en la lista— y llevan enlaces
          distintos. Sin el nombre son indistinguibles, y mandar el equivocado es
          mandar uno que ya no sirve. */}
      {invitee ? (
        <p className="text-meta font-bold">Enlace para {invitee}</p>
      ) : null}

      <p className="text-meta text-muted-foreground">
        Este enlace vence en catorce días y se usa una sola vez. Copialo ahora: no
        queda guardado en ningún lado, así que para volver a tener uno hay que tocar
        «Generar enlace» en la lista — y eso lo cambia por otro, dejando éste sin
        efecto.
      </p>

      <code className="block overflow-x-auto rounded-xl bg-background px-3.5 py-2.5 text-meta whitespace-nowrap">
        {link}
      </code>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
        >
          <Copy className="size-3.5" />
          {copied ? '¡Copiado!' : 'Copiar enlace'}
        </Button>

        <Button asChild size="sm" variant="outline">
          <a href={whatsappLink(null, message)} target="_blank" rel="noopener noreferrer">
            Mandar por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}
