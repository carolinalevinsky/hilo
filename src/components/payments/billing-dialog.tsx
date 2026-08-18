'use client'

import { MoreHorizontal } from '@/components/icons'
import { useActionState, useState } from 'react'

import { updateBillingAction } from '@/app/(app)/cobros/actions'
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
import { BILLING_FREQUENCY_LABELS } from '@/lib/patient-labels'

/**
 * The `···` on a Cobros row: what this patient's session costs and how often it
 * is charged.
 *
 * v1 had exactly this button, opening exactly these three fields in place
 * (`legacy/index.html:2421`). Until now the only way to change a fee in v2 was
 * to open the patient's ficha, find the billing section and come back — three
 * screens for a number you are looking straight at while doing the month's
 * accounts.
 *
 * The action writes through `updatePatientBilling`, which touches these three
 * columns and nothing else. A form that posted the whole patient would blank
 * every field it did not happen to include.
 */
export function BillingDialog({
  patientId,
  patientName,
  sessionFee,
  billingFrequency,
  expectedSessionsPerMonth,
}: {
  patientId: string
  patientName: string
  sessionFee: number | null
  billingFrequency: string
  expectedSessionsPerMonth: number | null
}) {
  const [state, formAction, pending] = useActionState(updateBillingAction, EMPTY_FORM_STATE)
  const [open, setOpen] = useState(false)

  // Close on a successful save, decided during render rather than in an effect —
  // the same pattern as `PaymentDialog` next door, for the same reason: an
  // effect renders the dialog open one more time before closing it, and that
  // extra frame reads as a flicker.
  const [seenState, setSeenState] = useState(state)
  if (state !== seenState) {
    setSeenState(state)
    if (state.ok) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          title="Editar arancel o frecuencia"
          aria-label={`Editar arancel o frecuencia de ${patientName}`}
        >
          <MoreHorizontal className="size-[18px]" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arancel de {patientName}</DialogTitle>
          <DialogDescription>
            Lo que Hilo usa para calcular cuánto tendría que entrar cada mes.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="patientId" value={patientId} />
          <FormMessage message={state.message} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="billing-fee">Honorario</Label>
              <Input
                id="billing-fee"
                name="sessionFee"
                type="number"
                min="0"
                inputMode="numeric"
                defaultValue={sessionFee ?? ''}
                placeholder="monto"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-frequency">Frecuencia</Label>
              <select
                id="billing-frequency"
                name="billingFrequency"
                defaultValue={billingFrequency}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {Object.entries(BILLING_FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="billing-sessions">
              Sesiones por mes
              <span className="font-normal text-muted-foreground"> · opcional</span>
            </Label>
            <Input
              id="billing-sessions"
              name="expectedSessionsPerMonth"
              type="number"
              min="0"
              max="62"
              inputMode="numeric"
              defaultValue={expectedSessionsPerMonth ?? ''}
              placeholder="4"
            />
            <p className="text-xs text-muted-foreground">
              Solo cambia el cálculo cuando cobrás por sesión, por semana o por quincena.
            </p>
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
