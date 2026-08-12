import type { Metadata } from 'next'
import Link from 'next/link'

import { SignInForm } from '@/components/auth/sign-in-form'

export const metadata: Metadata = { title: 'Entrar · Hilo' }

export default async function SignInPage({ searchParams }: PageProps<'/entrar'>) {
  const { volver } = await searchParams
  const back = typeof volver === 'string' ? volver : undefined

  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Hola de nuevo</h1>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">
        Entrá para seguir con tus pacientes.
      </p>

      <SignInForm back={back} />

      <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
        ¿Todavía no tenés cuenta?{' '}
        <Link href="/crear-cuenta" className="font-semibold text-violet underline">
          Creá una
        </Link>
      </p>

      <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
        Tus datos están protegidos y encriptados.
      </p>
    </>
  )
}
