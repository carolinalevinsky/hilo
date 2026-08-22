'use client'

import { Plus } from '@/components/icons'
import { useActionState, useState } from 'react'

import { recordPaymentAction } from '@/app/(app)/cobros/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { today } from '@/lib/dates'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { PAYMENT_METHOD_LABELS } from '@/lib/patient-labels'
import { periodLabel } from '@/lib/periods'

/**
 * Recording a payment that arrived outside Mercado Pago — cash after a session,
 * a bank transfer. Most payments in this practice are one of those two.
 *
 * The month is fixed to the ledger being viewed and shown, not chosen. A payment
 * filed against the wrong month is the mistake this screen exists to prevent,
 * and it is invisible until the totals stop making sense.
 */
export function PaymentDialog({
  period,
  patients,
  defaultPatientId,
  defaultAmount,
  trigger,
}: {
  period: string
  patients: { id: string; full_name: string }[]
  defaultPatientId?: string
  defaultAmount?: number | null
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(recordPaymentAction, EMPTY_FORM_STATE)

  // Close on a successful save, decided during render rather than in an effect.
  // Both state values belong to this component, so React's "adjust state when
  // something changes" pattern applies: an effect would render the dialog open
  // once more before closing it, which reads as a flicker.
  const [seenState, setSeenState] = useState(state)
  if (state !== seenState) {
    setSeenState(state)
    if (state.ok) setOpen(false)
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button size="lg">
            <Plus className="size-[18px]" />
            Registrar pago
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago · {periodLabel(period)}</DialogTitle>
          </DialogHeader>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="period" value={period} />
            <FormMessage message={state.ok ? null : state.message} />

            <div className="space-y-1.5">
              <Label htmlFor="payment-patient">Paciente</Label>
              <Select
                id="payment-patient"
                name="patientId"
                required
                defaultValue={defaultPatientId ?? ''}
              >
                <option value="" disabled>
                  Elegí un paciente
                </option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="payment-amount">Monto ($)</Label>
                <Input
                  id="payment-amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  defaultValue={defaultAmount ?? ''}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment-date">Fecha</Label>
                <Input
                  id="payment-date"
                  name="paidOn"
                  type="date"
                  defaultValue={today()}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-method">Medio</Label>
              <Select id="payment-method" name="method" defaultValue="cash">
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-note">
                Nota
                <span className="font-normal text-muted-foreground"> · opcional</span>
              </Label>
              <Input id="payment-note" name="note" placeholder="Ej: pagó dos sesiones juntas" />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? 'Guardando…' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Select(props: React.ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}
