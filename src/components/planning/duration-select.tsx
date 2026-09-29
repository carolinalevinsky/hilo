'use client'

import { NativeSelect } from '@/components/ui/native-select'
import { PLAN_DURATIONS } from '@/lib/plan-durations'
import { cn } from '@/lib/utils'

/**
 * Cuánto dura una actividad, elegido de una lista corta.
 *
 * Guarda al elegir, como el selector de objetivo de "Plan de la semana"
 * (`focus-select.tsx`) y por el mismo motivo: un desplegable con su propio
 * botón de guardar al lado, repetido en cada fila del plan, es una pantalla
 * peor. Existe como isla de cliente sólo porque un `<select>` no puede enviar
 * su formulario sin JavaScript.
 *
 * Sin `onChange` cuando no está adentro de un formulario que se envía solo
 * —el de "Sumá una actividad propia", donde el valor viaja con el resto al
 * apretar "Sumar al plan"—: ahí alcanza con que sea un campo más.
 */
export function DurationSelect({
  defaultValue,
  submitOnChange = false,
  className,
}: {
  defaultValue: number
  /** En la lista del plan, guardar al elegir. En el formulario de agregar, no. */
  submitOnChange?: boolean
  className?: string
}) {
  return (
    <NativeSelect
      name="durationMinutes"
      defaultValue={String(defaultValue)}
      aria-label="Duración"
      onChange={
        submitOnChange
          ? (event) => event.currentTarget.form?.requestSubmit()
          : undefined
      }
      wrapperClassName="w-fit"
      className={cn('h-9 rounded-lg pl-3 text-sm', className)}
    >
      {PLAN_DURATIONS.map((minutes) => (
        <option key={minutes} value={minutes}>
          {minutes} min
        </option>
      ))}
    </NativeSelect>
  )
}
