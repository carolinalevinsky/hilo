import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'

import { NewPasswordForm } from '@/components/auth/new-password-form'

import { RECOVERY_COOKIE } from '../recovery-cookie'

export const metadata: Metadata = { title: 'Contraseña nueva · Hilo' }

/**
 * Where a recovery link lands after `/confirmar` has turned it into a session.
 *
 * The session alone does not open this screen — the marker cookie does. See
 * `../recovery-cookie.ts`: without that distinction, any signed-in tab left open
 * is a way to take the account over without knowing the current password.
 */
export default async function NewPasswordPage() {
  const store = await cookies()

  if (store.get(RECOVERY_COOKIE)?.value !== '1') {
    return (
      <>
        <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Ese enlace ya no sirve</h1>
        <p className="mt-1 mb-5 text-[13px] leading-relaxed text-muted-foreground">
          Los enlaces para cambiar la contraseña se usan una sola vez y vencen en una hora.
          Pedí uno nuevo y listo.
        </p>

        <Link
          href="/recuperar"
          className="flex h-11 w-full items-center justify-center rounded-lg bg-violet text-[14px] font-bold text-white"
        >
          Pedir un enlace nuevo
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Poné tu contraseña nueva</h1>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">
        Elegí una que no uses en otro lado.
      </p>

      <NewPasswordForm />
    </>
  )
}
