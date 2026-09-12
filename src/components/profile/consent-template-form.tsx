'use client'

import { useActionState } from 'react'

import { updateConsentTemplateAction } from '@/app/(app)/perfil/actions'
import { FormMessage } from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_CONSENT_TEMPLATE } from '@/lib/consent-template'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * The consent a family signs from "Antes de empezar", editable.
 *
 * It opens with Hilo's model already in the box rather than an empty one: the
 * point of shipping a model is that nobody starts from a blank page. Saving a
 * text identical to the model stores nothing (the action turns it into null),
 * so a practitioner who never touched it keeps receiving the model's fixes.
 *
 * `key` on the textarea: after "Volver al modelo de Hilo" the server sends the
 * model back, and an uncontrolled textarea would otherwise keep showing the old
 * text until a reload.
 */
export function ConsentTemplateForm({ current }: { current: string | null }) {
  const [state, formAction, pending] = useActionState(
    updateConsentTemplateAction,
    EMPTY_FORM_STATE,
  )

  return (
    <form action={formAction} className="space-y-3">
      {state.ok ? (
        <p role="status" className="rounded-[11px] bg-green-soft px-3.5 py-2.5 text-meta text-[#1a8f57]">
          {state.message}
        </p>
      ) : (
        <FormMessage message={state.message} />
      )}

      <Textarea
        key={current ?? 'modelo'}
        name="template"
        rows={14}
        maxLength={8000}
        defaultValue={current ?? DEFAULT_CONSENT_TEMPLATE}
        className="min-h-72 text-body leading-relaxed"
        aria-label="Texto del consentimiento"
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar'}
        </Button>
        {current ? (
          <Button type="submit" name="reset" value="1" variant="outline" disabled={pending}>
            Volver al modelo de Hilo
          </Button>
        ) : null}
      </div>
    </form>
  )
}
