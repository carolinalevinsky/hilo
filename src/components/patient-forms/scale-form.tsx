'use client'

import { useActionState, useState } from 'react'

import { submitScaleAction } from '@/app/(public)/antes/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { EMPTY_FORM_STATE } from '@/lib/form-state'
import { CRISIS_LINE, SCALES, SELF_HARM_ITEM_INDEX, type ScaleId } from '@/lib/scales'
import { cn } from '@/lib/utils'

/**
 * A questionnaire, as the patient sees it on their phone.
 *
 * The wording is exactly the instrument's — see `@/lib/scales` for why it is
 * not adapted to `vos` like the rest of Hilo. Four big targets per item rather
 * than a slider or a select: this is answered with a thumb, and the four
 * options are the whole scale.
 *
 * The crisis line is on the page from the start, not only after a worrying
 * answer. Somebody answering "casi todos los días" to the ninth item should not
 * have to finish the form to find a number to call. After sending, if that
 * item was anything but the first option, it comes first and bigger.
 */
export function ScaleForm({
  token,
  scale: scaleId,
  practitionerName,
}: {
  token: string
  scale: ScaleId
  practitionerName: string
}) {
  const scale = SCALES[scaleId]
  const [state, formAction, pending] = useActionState(
    submitScaleAction.bind(null, token),
    EMPTY_FORM_STATE,
  )
  const v = state.values ?? {}
  const [selfHarm, setSelfHarm] = useState(false)
  const selfHarmItem = scaleId === 'phq9' ? `item-${SELF_HARM_ITEM_INDEX}` : null

  if (state.ok) {
    return (
      <div className="space-y-4">
        {selfHarm ? <CrisisLine prominent /> : null}
        <div role="status" className="rounded-xl bg-green-soft px-4 py-5 text-center">
          <p className="text-lead font-bold text-[#1a8f57]">¡Gracias!</p>
          <p className="mt-1.5 text-body leading-relaxed text-[#1a8f57]">
            Tus respuestas le llegan sólo a {practitionerName}. Podés cerrar esta página.
          </p>
        </div>
        {selfHarm ? null : <CrisisLine />}
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="space-y-5"
      onChange={(event) => {
        const target = event.target
        if (!(target instanceof HTMLInputElement)) return
        if (selfHarmItem && target.name === selfHarmItem) setSelfHarm(target.value !== '0')
      }}
    >
      <FormMessage message={state.message} />

      <p className="text-body font-semibold">{scale.instruction}</p>

      {scale.items.map((item, index) => (
        <fieldset key={index} className="space-y-2">
          <legend className="text-body leading-snug">
            <span className="font-bold tabular-nums">{index + 1}.</span> {item}
          </legend>
          <Options name={`item-${index}`} labels={scale.options} required checked={v[`item-${index}`]} />
        </fieldset>
      ))}

      <fieldset className="space-y-2 border-t border-border pt-4">
        <legend className="text-body leading-snug">{scale.difficultyQuestion}</legend>
        <Options name="difficulty" labels={scale.difficultyOptions} checked={v.difficulty} />
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar respuestas'}
      </Button>

      <CrisisLine />
    </form>
  )
}

function Options({
  name,
  labels,
  required = false,
  checked,
}: {
  name: string
  labels: readonly string[]
  required?: boolean
  checked?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {labels.map((label, value) => (
        <label
          key={value}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-meta leading-tight has-checked:border-violet has-checked:bg-violet-soft has-checked:font-semibold"
        >
          <input
            type="radio"
            name={name}
            value={value}
            required={required}
            defaultChecked={checked === String(value)}
            className="size-4 shrink-0 accent-violet"
          />
          {label}
        </label>
      ))}
    </div>
  )
}

function CrisisLine({ prominent = false }: { prominent?: boolean }) {
  return (
    <p
      className={cn(
        'rounded-xl text-body leading-relaxed',
        prominent
          ? 'bg-coral-soft px-4 py-4 text-[#9b2c20]'
          : 'bg-muted/60 px-3.5 py-3 text-meta text-muted-foreground',
      )}
    >
      {prominent ? <b>Si estás pasando un momento muy difícil, no tenés que pasarlo sin ayuda. </b> : null}
      Si pensás en hacerte daño, llamá a la {CRISIS_LINE.name}:{' '}
      <a href="tel:08000767" className="font-bold underline">
        {CRISIS_LINE.landline}
      </a>{' '}
      desde un fijo o{' '}
      <a href="tel:*0767" className="font-bold underline">
        {CRISIS_LINE.mobile}
      </a>{' '}
      desde el celular. Es gratis y atiende las 24 horas.
    </p>
  )
}
