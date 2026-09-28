import type { Metadata } from 'next'
import Link from 'next/link'

import { PasswordResetForm } from '@/components/auth/password-reset-form'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Recuperar tu cuenta') }

export default function PasswordResetPage() {
  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.8px]">¿Olvidaste la contraseña?</h1>
      <p className="mt-2 mb-7 text-sm leading-relaxed text-muted-foreground">
        Poné tu correo y te mandamos un enlace para poner una nueva.
      </p>

      <PasswordResetForm />

      <p className="mt-5 text-center text-meta text-muted-foreground">
        <Link href="/entrar" className="font-semibold text-violet underline">
          Volver a entrar
        </Link>
      </p>
    </>
  )
}
