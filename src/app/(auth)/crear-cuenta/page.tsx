import type { Metadata } from 'next'

import { AuthTabs } from '@/components/auth/auth-tabs'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = { title: 'Creá tu cuenta · Hilo' }

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Creá tu cuenta</h1>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">
        Tu espacio de trabajo, con tus pacientes guardados y seguros.
      </p>

      <AuthTabs />

      <SignUpForm />

      <p className="mt-5 text-center text-[11.5px] text-muted-foreground">
        Tus datos están protegidos y encriptados.
      </p>
    </>
  )
}
