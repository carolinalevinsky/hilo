import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { CompleteProfileForm } from '@/components/auth/complete-profile-form'
import { requireUser } from '@/server/auth'
import { findPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Completá tu perfil · Hilo' }

/**
 * Where a signed-in account without a profile lands.
 *
 * It sits in the `(auth)` group on purpose, outside the app shell — the shell is
 * what redirects here, so rendering inside it would loop.
 *
 * The guard below is the mirror image: somebody who *does* have a profile and
 * types this address gets sent to `/inicio` rather than shown a form that would
 * fail on the primary key. Both directions matter, because this page is
 * reachable by hand.
 */
export default async function CompleteProfilePage() {
  const user = await requireUser()
  if (await findPractitioner(user.id)) redirect('/inicio')

  return (
    <>
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">Completá tu perfil</h1>
      <p className="mt-1 mb-5 text-[13px] leading-relaxed text-muted-foreground">
        Tu cuenta existe, pero le falta la ficha profesional. Con estos dos datos
        queda lista y entrás.
      </p>

      <CompleteProfileForm />

      <p className="mt-5 text-center text-[11.5px] text-muted-foreground">
        Los podés cambiar después desde tu perfil.
      </p>
    </>
  )
}
