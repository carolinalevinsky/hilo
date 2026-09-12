import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthTabs } from '@/components/auth/auth-tabs'
import { FormMessage } from '@/components/auth/form-message'
import { SignInForm } from '@/components/auth/sign-in-form'

import { noticeFor } from '../notices'

export const metadata: Metadata = { title: 'Entrar · Hilo' }

export default async function SignInPage({ searchParams }: PageProps<'/entrar'>) {
  const { volver, aviso } = await searchParams
  const back = typeof volver === 'string' ? volver : undefined
  const notice = noticeFor(aviso)

  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Entrá a tu cuenta</h1>
      <p className="mt-1 mb-5 text-body text-muted-foreground">
        Qué bueno tenerte de vuelta.
      </p>

      <AuthTabs />

      {notice ? <FormMessage message={notice} className="mb-4" /> : null}

      <SignInForm back={back} />

      <p className="mt-3 text-center text-meta text-muted-foreground">
        <Link href="/recuperar" className="text-violet underline">
          Olvidé mi contraseña
        </Link>
      </p>

      <p className="mt-5 text-center text-micro text-muted-foreground">
        Tus datos están protegidos y encriptados.
      </p>
    </>
  )
}
