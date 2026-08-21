'use client'

import { useActionState } from 'react'

import { updateCalendarPrivacyAction } from '@/app/(app)/perfil/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import {
  CALENDAR_PRIVACY,
  CALENDAR_PRIVACY_EXAMPLES,
  CALENDAR_PRIVACY_HINTS,
  CALENDAR_PRIVACY_LABELS,
} from '@/lib/calendar-privacy'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * Qué se ve de un paciente en Google Calendar.
 *
 * Botones de radio y no un desplegable, a propósito: las tres opciones tienen
 * que estar a la vista a la vez, con su ejemplo al lado. Un desplegable esconde
 * dos de las tres detrás de un click, y la que queda visible pasa por "lo
 * normal" — que para una decisión sobre datos de terceros es justo lo que no
 * conviene.
 *
 * El ejemplo (`Ocupado`, `T. P.`, `Tomás`) hace más que la etiqueta. "Iniciales"
 * es una palabra; ver `T. P.` es entender de una qué queda escrito en un
 * servidor ajeno.
 */
export function CalendarPrivacyForm({ value }: { value: string }) {
  const [state, formAction, pending] = useActionState(
    updateCalendarPrivacyAction,
    EMPTY_FORM_STATE,
  )

  return (
    <form action={formAction} className="space-y-4">
      {state.ok ? (
        <p
          role="status"
          className="rounded-[11px] bg-green-soft px-3.5 py-2.5 text-[12.5px] text-[#1a8f57]"
        >
          {state.message}
        </p>
      ) : (
        <FormMessage message={state.message} />
      )}

      <fieldset className="space-y-2.5">
        <legend className="sr-only">Qué se ve en tu calendario</legend>

        {CALENDAR_PRIVACY.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer gap-3 rounded-xl border border-border bg-card p-3 has-checked:border-violet has-checked:bg-violet-soft"
          >
            <input
              type="radio"
              name="calendarPrivacy"
              value={option}
              defaultChecked={value === option}
              className="mt-0.5 size-4 shrink-0 accent-violet"
            />
            <span className="min-w-0">
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="text-[13.5px] font-bold">
                  {CALENDAR_PRIVACY_LABELS[option]}
                </span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11.5px]">
                  {CALENDAR_PRIVACY_EXAMPLES[option]}
                </span>
              </span>
              <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
                {CALENDAR_PRIVACY_HINTS[option]}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar'}
      </Button>
    </form>
  )
}
