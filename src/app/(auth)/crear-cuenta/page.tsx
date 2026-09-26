import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { pageTitle } from '@/lib/brand'

export const metadata: Metadata = { title: pageTitle('Ombúa es por invitación') }

/**
 * There is no sign-up form any more. **Ombúa is by invitation.**
 *
 * The route stays because it is printed in people's heads and linked from the
 * landing page, and a 404 is a worse answer than an explanation: somebody who
 * arrives here is interested, and the only thing they need is to know what to do
 * next.
 *
 * What actually closes sign-up is `enable_signup = false` in Supabase, not the
 * absence of this form — see `src/server/invitations.ts`. This page is the
 * courtesy; that is the lock.
 */
export default function SignUpPage() {
  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">
        Ombúa es por invitación
      </h1>
      <p className="mt-2 text-body leading-relaxed text-muted-foreground">
        Por ahora las cuentas se abren de a una. Si alguien te invitó, buscá el correo de
        Ombúa —fijate también en spam— y entrá desde el enlace que te mandó: ahí elegís tu
        contraseña.
      </p>

      <Button asChild size="lg" className="mt-5 w-full">
        <Link href="/entrar">Ya tengo cuenta</Link>
      </Button>

      <p className="mt-5 text-center text-micro text-muted-foreground">
        Tus datos están protegidos y encriptados.
      </p>
    </>
  )
}
