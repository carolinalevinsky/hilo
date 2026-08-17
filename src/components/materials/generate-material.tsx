'use client'

import { Sparkles } from '@/components/icons'
import { useActionState, useState } from 'react'

import { generateMaterialAction } from '@/app/(app)/materiales/actions'
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
import { AGE_RANGES } from '@/lib/material-areas'

/**
 * v1's "Generar con IA" (`legacy/index.html:815`): three fields and a button.
 *
 * Deliberately the same three, and no patient among them. A material is a
 * worksheet — it does not need to know who it is for, and keeping every patient
 * out of the request is what makes a generated activity safe to publish to the
 * community afterwards.
 *
 * Submitting saves the material and lands on its edit form, where the model
 * writes into the field in front of you. See `generateMaterialAction` for why it
 * is saved before it is generated.
 */
export function GenerateMaterial({ areas }: { areas: string[] }) {
  const [state, formAction, pending] = useActionState(
    generateMaterialAction,
    EMPTY_FORM_STATE,
  )
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <Sparkles className="size-[18px]" />
          Generar con IA
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar material con IA</DialogTitle>
          <DialogDescription>
            Decile a Hilo qué necesitás y te arma una actividad original, a medida del
            objetivo y la edad.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormMessage message={state.message} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gen-area">Área</Label>
              <Select id="gen-area" name="area" required>
                {areas.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gen-age">Edad</Label>
              <Select id="gen-age" name="ageRange" defaultValue="6-7 años">
                {AGE_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gen-request">¿Qué necesitás trabajar?</Label>
            <Input
              id="gen-request"
              name="request"
              required
              minLength={5}
              placeholder="Ej: cálculo mental de sumas hasta 20 para un nene que se distrae"
            />
          </div>

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            <Sparkles className="size-4" />
            {pending ? 'Generando…' : 'Generar actividad'}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Queda en tu biblioteca marcada como generada con IA, y privada. Revisala antes
            de usarla.
          </p>
        </form>
      </DialogContent>
    </Dialog>
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
