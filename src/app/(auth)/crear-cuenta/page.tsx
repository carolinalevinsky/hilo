import type { Metadata } from 'next'
import Link from 'next/link'

import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = { title: 'Creá tu cuenta · Hilo' }

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Creá tu cuenta</h1>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">
        Tu espacio de trabajo, con tus pacientes guardados y seguros.
      </p>

      <SignUpForm />

      <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
        ¿Ya tenés cuenta?{' '}
        <Link href="/entrar" className="font-semibold text-violet underline">
          Entrá acá
        </Link>
      </p>

      <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
        Tus datos están protegidos y encriptados.
      </p>
    </>
  )
}
