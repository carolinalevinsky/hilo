import type { Metadata } from 'next'

import { FormMessage } from '@/components/auth/form-message'
import { SignInForm } from '@/components/auth/sign-in-form'
import { Lock } from '@/components/icons'

import { noticeFor } from '../notices'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Entrar') }

export default async function SignInPage({ searchParams }: PageProps<'/entrar'>) {
  const { volver, aviso } = await searchParams
  const back = typeof volver === 'string' ? volver : undefined
  const notice = noticeFor(aviso)

  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.8px] sm:text-[32px]">
        Qué bueno verte de nuevo
      </h1>
      <p className="mt-2 mb-7 text-sm leading-relaxed text-muted-foreground">
        Ingresá tus credenciales para acceder a tu panel de pacientes, sesiones y
        materiales.
      </p>

      {/* Las dos pestañas del diseño. "Crear cuenta" está deshabilitada y no
          lleva a ningún lado: Ombúa es por invitación, así que no hay alta que
          abrir. Lo que cierra el alta de verdad es `enable_signup = false` en
          Supabase —ver `src/server/invitations.ts`—; esto es lo que se ve. */}
      <nav
        aria-label="Entrar o crear cuenta"
        className="mb-6 flex items-center gap-1.5 rounded-[16px] bg-muted p-1.5"
      >
        <span className="flex-1 rounded-[10px] bg-card py-2.5 text-center text-sm font-semibold text-violet shadow-xs">
          Iniciar sesión
        </span>
        <button
          type="button"
          disabled
          title="Ombúa es por invitación: la cuenta la abre quien te invita."
          className="flex-1 cursor-not-allowed rounded-[10px] py-2.5 text-center text-sm font-medium text-muted-foreground"
        >
          Crear cuenta
        </button>
      </nav>

      {notice ? <FormMessage message={notice} className="mb-4" /> : null}

      <SignInForm back={back} />

      <p className="mt-7 flex items-center justify-center gap-2 text-micro text-muted-foreground">
        <Lock className="size-3.5 shrink-0 text-green-ink" aria-hidden />
        Tu información y la de tus pacientes está protegida.
      </p>
    </>
  )
}
