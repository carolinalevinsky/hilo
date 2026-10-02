import type { Metadata } from 'next'

import { VerifyCodeForm } from '@/components/auth/verify-code-form'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Verificar') }

/**
 * El segundo paso de la entrada, para quien activó la verificación en dos
 * pasos. El proxy trae acá a toda sesión que pasó la contraseña y no el código.
 */
export default async function VerifyPage({ searchParams }: PageProps<'/verificar'>) {
  const { volver } = await searchParams

  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.8px] sm:text-[32px]">
        Un paso más
      </h1>
      <p className="mt-2 mb-7 text-sm leading-relaxed text-muted-foreground">
        Tenés la verificación en dos pasos activada. Abrí tu app autenticadora y escribí el
        código de Ombúa.
      </p>

      <VerifyCodeForm back={typeof volver === 'string' ? volver : undefined} />
    </>
  )
}
