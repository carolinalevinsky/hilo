'use client'

import { useState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

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

/**
 * Un botón que pregunta antes de hacer algo que saca información de la vista.
 *
 * Una sola forma de confirmar en toda la aplicación. Antes había tres —un
 * `window.confirm`, un campo donde escribir el nombre, y nada— y la mayoría de
 * los botones que mandaban historia clínica a la nada eran el tercero.
 *
 * La pregunta dice qué pasa y qué no: "va a la papelera, se recupera desde la
 * ficha". Un "¿Estás segura?" sin consecuencias entrena a apretar "sí" sin leer.
 */
export function ConfirmAction({
  action,
  fields,
  trigger,
  triggerVariant = 'ghost',
  title,
  description,
  confirmLabel,
  pendingLabel = 'Un momento…',
}: {
  action: (formData: FormData) => Promise<void>
  fields: Record<string, string>
  trigger: ReactNode
  triggerVariant?: 'ghost' | 'outline' | 'destructive'
  title: string
  description: ReactNode
  confirmLabel: string
  pendingLabel?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size="sm">
          {trigger}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          action={async (formData) => {
            await action(formData)
            setOpen(false)
          }}
        >
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <ConfirmButton label={confirmLabel} pendingLabel={pendingLabel} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}
