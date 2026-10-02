'use client'

import { useActionState, useState } from 'react'

import { confirmBookingAction } from '@/app/(app)/reservas/actions'
import { FormMessage } from '@/components/auth/form-message'
import { UserPlus } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

/**
 * "Convertir en paciente", con el nombre confirmado antes.
 *
 * Era un botón que creaba el paciente con el nombre de quien escribió la
 * reserva, que casi siempre es la madre o el padre. Ahora propone el nombre de
 * "¿Para quién es la consulta?" si la familia lo dijo, deja corregirlo, y guarda
 * a quien escribió como responsable.
 *
 * Si el horario pedido se pisa con otra sesión, la acción vuelve con el aviso y
 * acá aparecen las dos salidas: convertir sin agendar, o agendar igual.
 */
export function ConvertBookingDialog({
  requestId,
  writerName,
  patientName,
}: {
  requestId: string
  writerName: string
  patientName: string | null
}) {
  const [state, formAction, pending] = useActionState(confirmBookingAction, EMPTY_FORM_STATE)
  const [open, setOpen] = useState(false)
  const clash = state.values?.clash === '1'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <UserPlus className="size-3.5" />
          Convertir en paciente
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convertir en paciente</DialogTitle>
          <DialogDescription>
            La reserva la mandó {writerName}. Revisá a nombre de quién queda la ficha.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="requestId" value={requestId} />
          <FormMessage message={state.message} />

          <div className="space-y-1.5">
            <Label htmlFor={`patient-name-${requestId}`}>Nombre del paciente</Label>
            <Input
              id={`patient-name-${requestId}`}
              name="patientName"
              required
              maxLength={120}
              defaultValue={state.values?.patientName ?? patientName ?? writerName}
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id={`writer-guardian-${requestId}`}
              name="writerIsGuardian"
              defaultChecked={
                state.values ? state.values.writerIsGuardian === 'on' : patientName !== null
              }
            />
            <Label
              htmlFor={`writer-guardian-${requestId}`}
              className="text-body leading-snug font-normal"
            >
              {writerName} es madre, padre o responsable del paciente
            </Label>
          </div>

          {clash ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="submit" name="scheduling" value="skip" disabled={pending}>
                Convertir sin agendar
              </Button>
              <Button
                type="submit"
                name="scheduling"
                value="force"
                variant="outline"
                disabled={pending}
              >
                Agendar igual
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button type="submit" name="scheduling" value="check" disabled={pending}>
                {pending ? 'Creando…' : 'Crear paciente'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
