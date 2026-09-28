'use client'

import { Eye, EyeOff } from '@/components/icons'
import { useState } from 'react'

import { AUTH_FIELD, AUTH_LABEL } from '@/components/auth/field-styles'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * A password input with the show/hide eye v1 had.
 *
 * It is not decoration: practitioners type these on phones, where a mistyped
 * password is invisible and the only feedback is a rejection.
 */
export function PasswordField({
  id,
  name = 'password',
  label,
  placeholder,
  autoComplete,
  hint,
}: {
  id: string
  /** Defaults to `password`; the confirmation field on the reset screen is the
      one place that needs a second name in the same form. */
  name?: string
  label: string
  placeholder?: string
  autoComplete: 'new-password' | 'current-password'
  hint?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={AUTH_LABEL}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(AUTH_FIELD, 'pr-11')}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      {hint ? (
        <p className="text-meta leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
