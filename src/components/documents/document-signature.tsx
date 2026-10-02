'use client'

import { useActionState, useState, useTransition } from 'react'

import { Ban, Check, Pencil } from '@/components/icons'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  reopenDocumentAction,
  signDocumentAction,
  voidDocumentAction,
} from '@/app/(app)/document-actions'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import type { DocumentKind } from '@/server/document-versions'
import { useOkToast } from '@/components/done-toast'

/**
 * Los tres pasos que cambian qué es un documento: firmarlo, abrirlo para
 * corregir, anularlo.
 *
 * Los tres preguntan antes. Firmar congela el texto con la hora de hoy; anular
 * es para siempre; y corregir, aunque se deshace firmando de nuevo, cambia lo
 * que se imprime ("borrador" en vez de la firma). Qué se puede y qué no lo
 * decide la base (`document-lifecycle.ts`); esto sólo lo pide y muestra la
 * respuesta.
 */

const NOUN: Record<DocumentKind, string> = {
  report: 'este informe',
  assessment: 'esta evaluación',
}

export function SignButton({
  kind,
  documentId,
  disabled,
}: {
  kind: DocumentKind
  documentId: string
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Check className="size-4" />
          Revisé y firmo
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Firmar {NOUN[kind]}?</DialogTitle>
          <DialogDescription>
            El texto queda congelado con la fecha y la hora de ahora, y se imprime con tu firma.
            Si después hay que cambiar algo, lo corregís y lo volvés a firmar: esta versión
            queda guardada igual.
          </DialogDescription>
        </DialogHeader>

        {error ? <FormMessage message={error} /> : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Todavía no</Button>
          </DialogClose>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await signDocumentAction(kind, documentId)
                if (result.ok) {
                  setError(null)
                  setOpen(false)
                } else {
                  setError(result.message)
                }
              })
            }
          >
            {pending ? 'Firmando…' : 'Firmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ReopenButton({ kind, documentId }: { kind: DocumentKind; documentId: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" />
          Corregir
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Abrir {NOUN[kind]} para corregir?</DialogTitle>
          <DialogDescription>
            Vuelve a ser un borrador que podés editar. La versión firmada queda guardada en
            &quot;Versiones anteriores&quot;, con su fecha: es la que se entregó. Cuando
            termines, firmalo de nuevo.
          </DialogDescription>
        </DialogHeader>

        {error ? <FormMessage message={error} /> : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await reopenDocumentAction(kind, documentId)
                if (result.ok) {
                  setError(null)
                  setOpen(false)
                } else {
                  setError(result.message)
                }
              })
            }
          >
            {pending ? 'Abriendo…' : 'Abrir para corregir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function VoidDialog({ kind, documentId }: { kind: DocumentKind; documentId: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    voidDocumentAction.bind(null, kind, documentId),
    EMPTY_FORM_STATE,
  )
  useOkToast(state, 'Listo.')

  return (
    <Dialog open={open && !state.ok} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Ban className="size-4" />
          Anular
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Anular {NOUN[kind]}?</DialogTitle>
          <DialogDescription>
            Lo que se firmó no se borra: queda en la historia clínica marcado como anulado,
            con el motivo que escribas. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="void-reason">Motivo</Label>
            <Textarea
              id="void-reason"
              name="reason"
              required
              minLength={3}
              maxLength={500}
              rows={3}
              defaultValue={state.values?.reason}
              placeholder="Ej: se emitió con datos de otro período"
            />
          </div>

          {state.message && !state.ok ? <FormMessage message={state.message} /> : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Anulando…' : 'Anular'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
