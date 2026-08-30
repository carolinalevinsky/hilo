import type { Metadata } from 'next'
import Link from 'next/link'

import { PasswordResetForm } from '@/components/auth/password-reset-form'

export const metadata: Metadata = { title: 'Recuperar tu cuenta · Hilo' }

export default function PasswordResetPage() {
  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">¿Olvidaste la contraseña?</h1>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">
        Poné tu correo y te mandamos un enlace para poner una nueva.
      </p>

      <PasswordResetForm />

      <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
        <Link href="/entrar" className="font-semibold text-violet underline">
          Volver a entrar
        </Link>
      </p>
    </>
  )
}
