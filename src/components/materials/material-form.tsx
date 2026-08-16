'use client'

import { useActionState, useState } from 'react'

import { createMaterialAction } from '@/app/(app)/materiales/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { AGE_RANGES, MATERIAL_KIND_LABELS } from '@/lib/material-areas'

export function MaterialForm({ areas }: { areas: Record<string, string[]> }) {
  const [state, formAction, pending] = useActionState(createMaterialAction, EMPTY_FORM_STATE)
  const [area, setArea] = useState(Object.keys(areas)[0] ?? '')

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <FormMessage message={state.message} />

      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ej: Bingo de sonidos iniciales"
          required
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="area">Área</Label>
          <Select
            id="area"
            name="area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            required
          >
            {Object.keys(areas).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="focus">
            Dentro del área
            <span className="font-normal text-muted-foreground"> · opcional</span>
          </Label>
          <Select id="focus" name="focus" defaultValue="">
            <option value="">Sin especificar</option>
            {(areas[area] ?? []).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kind">Tipo</Label>
          <Select id="kind" name="kind" defaultValue="activity">
            {Object.entries(MATERIAL_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ageRange">
            Edad
            <span className="font-normal text-muted-foreground"> · opcional</span>
          </Label>
          <Select id="ageRange" name="ageRange" defaultValue="">
            <option value="">Cualquier edad</option>
            {AGE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="objective">¿Para qué sirve?</Label>
        <Input
          id="objective"
          name="objective"
          placeholder="Ej: Identificar con qué sonido empieza cada palabra"
        />
        <p className="text-xs text-muted-foreground">
          Con esto Hilo te lo sugiere solo cuando tenés un objetivo parecido.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">La actividad</Label>
        <Textarea
          id="content"
          name="content"
          rows={12}
          required
          placeholder={`Cómo se juega:\nSe dice una palabra en voz alta y el niño marca la imagen que empieza con el mismo sonido.\n\nMateriales:\nCartones impresos y fichas.`}
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Una línea corta terminada en dos puntos se ve como subtítulo. El resto, párrafos.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="max-sm:w-full">
        {pending ? 'Guardando…' : 'Guardar material'}
      </Button>
    </form>
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
