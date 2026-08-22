'use client'

import { Globe, MessageCircle, Video } from '@/components/icons'
import { useActionState, useState } from 'react'

import { openConsultationAction, saveVideoUrlAction } from '@/app/(app)/pacientes/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { firstName, whatsappLink } from '@/lib/whatsapp'

/**
 * "Consulta online" — v1's button, on a link that is safe to send.
 *
 * What v1 got right: one click, a room that needs no account from the family,
 * and a WhatsApp button to send it. What it got wrong is the whole reason this
 * took a migration — the URL contained the child's name, and `meet.jit.si` rooms
 * are open to whoever holds the link. See the migration for the full account.
 *
 * Two ways to run the call, and the practitioner's own wins. Someone with a Zoom
 * account, or a room their institution gave them, should not be nudged onto a
 * service Hilo happens to have picked.
 *
 * **The message carries no clinical content** — a first name, and a link. Same
 * rule as the appointment reminder and the fortnightly digest.
 */
export function OnlineConsultation({
  patientId,
  patientName,
  patientPhone,
  roomUrl,
  videoUrl,
}: {
  patientId: string
  patientName: string
  patientPhone: string | null
  /** Hilo's room. Null until the first time this is opened. */
  roomUrl: string | null
  /** The practitioner's own link, if they set one. */
  videoUrl: string | null
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(saveVideoUrlAction, EMPTY_FORM_STATE)

  const url = videoUrl ?? roomUrl
  const message = url
    ? `¡Hola! Nos encontramos en la videollamada de ${firstName(patientName)} por acá: ${url}`
    : ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-transparent bg-white/16 text-white hover:bg-white/26 hover:text-white max-sm:flex-1"
        >
          <Video className="size-4" />
          Consulta online
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Consulta online</DialogTitle>
          <DialogDescription>
            {videoUrl
              ? 'Tu sala de siempre. Compartí el link con la familia para que entren.'
              : 'Una sala privada para esta sesión. El link no dice el nombre del paciente, así que se puede compartir sin problema.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {url ? (
            <>
              <Button asChild className="w-full">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4" />
                  Entrar a la videollamada
                </a>
              </Button>

              <Button
                asChild
                className="w-full bg-[#25d366] text-white hover:bg-[#25d366]/90"
              >
                <a
                  href={whatsappLink(patientPhone, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  Enviar el link a la familia
                </a>
              </Button>

              <p className="text-xs leading-relaxed text-muted-foreground">
                El link es siempre el mismo, así que la familia puede guardarlo. Se abre en
                una pestaña nueva.
              </p>
            </>
          ) : (
            // Created on request rather than on every ficha that loads: most
            // patients never have an online session, and a room made for them
            // anyway is a row written for nothing. Once made it is kept — a
            // family saves the link, and v1's regenerated-every-reload id is
            // exactly what broke that.
            <form action={openConsultationAction}>
              <input type="hidden" name="patientId" value={patientId} />
              <Button type="submit" className="w-full">
                <Video className="size-4" />
                Crear la sala de video
              </Button>
            </form>
          )}
        </div>

        <form action={formAction} className="space-y-1.5 border-t border-border pt-4">
          <input type="hidden" name="patientId" value={patientId} />
          <FormMessage message={state.message} />

          <Label htmlFor="videoUrl">
            ¿Usás otra sala?
            <span className="font-normal text-muted-foreground"> · opcional</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              defaultValue={videoUrl ?? ''}
              placeholder="https://meet.google.com/…"
              className="flex-1"
            />
            <Button type="submit" variant="outline" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Pegá tu Zoom, tu Meet o el de tu institución y Hilo usa ese. Vacío, vuelve al
            suyo.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
