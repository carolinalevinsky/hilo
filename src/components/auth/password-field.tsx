'use client'

import { Eye, EyeOff } from '@/components/icons'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * A password input with the show/hide eye v1 had.
 *
 * It is not decoration: practitioners type these on phones, where a mistyped
 * password is invisible and the only feedback is a rejection.
 */
export function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  hint,
}: {
  id: string
  label: string
  placeholder?: string
  autoComplete: 'new-password' | 'current-password'
  hint?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name="password"
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="pr-11"
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
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
