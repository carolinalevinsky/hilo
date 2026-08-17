'use client'

import { useActionState, useEffect, useRef } from 'react'

import { signInAction } from '@/app/(auth)/actions'
import { FormMessage } from '@/components/auth/form-message'
import { PasswordField } from '@/components/auth/password-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EMPTY_FORM_STATE } from '@/lib/form-state'

/**
 * Where the remembered address lives. v1 used the same key
 * (`legacy/index.html:3000`), so anyone signing in on a device that ran v1 finds
 * their email already there.
 *
 * The address only — never the password, and nothing that could stand in for
 * one. It is the practitioner's own email on their own device, which is the same
 * thing the browser's autofill already keeps.
 */
const REMEMBERED_EMAIL = 'hilo_email'

export function SignInForm({ back }: { back?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, EMPTY_FORM_STATE)
  const emailRef = useRef<HTMLInputElement>(null)
  const rememberRef = useRef<HTMLInputElement>(null)

  /**
   * Both fields stay uncontrolled and the remembered address is written straight
   * into the DOM after mount.
   *
   * `localStorage` does not exist on the server, so it cannot be read while
   * rendering without the markup differing between server and client. Putting it
   * in React state instead would mean a second render on every visit to this
   * screen for a value that never changes again. Writing to the input *is* the
   * effect — synchronising React with an external system, which is what effects
   * are for.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL)
      if (!saved) return
      if (emailRef.current) emailRef.current.value = saved
      if (rememberRef.current) rememberRef.current.checked = true
    } catch {
      // Private browsing, or storage disabled. Nothing here is important enough
      // to interrupt somebody signing in.
    }
  }, [])

  function persist() {
    try {
      const email = emailRef.current?.value.trim()
      if (rememberRef.current?.checked && email) {
        localStorage.setItem(REMEMBERED_EMAIL, email)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL)
      }
    } catch {
      // As above.
    }
  }

  return (
    <form action={formAction} onSubmit={persist} className="space-y-4">
      <FormMessage message={state.message} />

      {/* Where to land after signing in — set by the proxy when it bounced
          someone off a page they were trying to reach. */}
      {back ? <input type="hidden" name="volver" value={back} /> : null}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />
      </div>

      <PasswordField
        id="password"
        label="Contraseña"
        placeholder="Tu contraseña"
        autoComplete="current-password"
      />

      <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#3a4256]">
        <input
          ref={rememberRef}
          type="checkbox"
          name="recordar"
          className="size-4 accent-violet"
        />
        Recordar mi correo en este dispositivo
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
