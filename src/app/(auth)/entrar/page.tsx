import type { Metadata } from 'next'

import { AuthTabs } from '@/components/auth/auth-tabs'
import { SignInForm } from '@/components/auth/sign-in-form'

export const metadata: Metadata = { title: 'Entrar · Hilo' }

export default async function SignInPage({ searchParams }: PageProps<'/entrar'>) {
  const { volver } = await searchParams
  const back = typeof volver === 'string' ? volver : undefined

  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Entrá a tu cuenta</h1>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">
        Qué bueno tenerte de vuelta.
      </p>

      <AuthTabs />

      <SignInForm back={back} />

      <p className="mt-5 text-center text-[11.5px] text-muted-foreground">
        Tus datos están protegidos y encriptados.
      </p>
    </>
  )
}
