'use client'

import { Plus } from '@/components/icons'
import { useActionState, useEffect, useState } from 'react'

import { requestFormatAction } from '@/app/(app)/informes/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * La séptima tarjeta: pedir un formato que no está.
 *
 * Los formatos que ofrece esta pantalla salen de una lista escrita a mano, con
 * el tono de cada destinatario redactado uno por uno. Eso es lo que los hace
 * buenos y es también por qué no se pueden agregar solos. Sin esta tarjeta, a
 * quien le falta el informe para el juzgado no le queda ningún camino adentro de
 * la app: la pantalla le dice que no, y ahí termina.
 *
 * Se parece a las otras seis a propósito —mismo tamaño, misma grilla— pero con
 * el borde punteado, que es como se dibuja un lugar vacío que se puede llenar.
 */
export function RequestFormat() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    requestFormatAction,
    EMPTY_FORM_STATE,
  )

  // Se cierra solo cuando salió bien, después de que se vea el mensaje.
  useEffect(() => {
    if (!state.ok) return
    const timer = setTimeout(() => setOpen(false), 1800)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-col items-start rounded-2xl border border-dashed border-border bg-card p-4 text-left transition-colors hover:border-violet"
      >
        <span
          aria-hidden
          className="mb-2.5 inline-flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground"
        >
          <Plus className="size-[18px]" />
        </span>

        <span className="text-[14.5px] font-bold">¿Te falta un formato?</span>
        <span className="mt-1 text-[12.5px] text-muted-foreground">
          Contanos cuál necesitás y lo agregamos
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedir un formato</DialogTitle>
          </DialogHeader>

          <form action={formAction} className="space-y-4">
            <FormMessage ok={state.ok} message={state.message} />

            <div className="space-y-1.5">
              <Label htmlFor="detail">¿Para quién es el informe?</Label>
              <textarea
                id="detail"
                name="detail"
                required
                minLength={5}
                maxLength={500}
                rows={4}
                defaultValue={state.values?.detail ?? ''}
                placeholder="Ej: uno para presentar en el juzgado, con el motivo de derivación y las sesiones hechas."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {/* Lo pide expresamente, y no es una formalidad: este texto es lo
                  único de Hilo que sale por correo, y alcanza con que alguien
                  escriba un nombre sin pensar. */}
              <p className="text-xs leading-relaxed text-muted-foreground">
                Contanos del formato, no del paciente: no escribas nombres ni datos
                de nadie acá.
              </p>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending || state.ok}>
                {pending ? 'Enviando…' : 'Enviar pedido'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
