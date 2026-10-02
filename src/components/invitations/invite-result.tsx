'use client'

import { FormMessage } from '@/components/auth/form-message'
import type { InviteState } from '@/app/(app)/invitaciones/state'

/**
 * Lo que contestó la última acción de invitaciones, en una franja.
 *
 * Tres resultados y no dos, y ése es el motivo de que exista: **"salió bien" y
 * "salió a medias" no son lo mismo acá**. El correo puede no haber salido con la
 * invitación igualmente creada, y pintar eso de verde manda a alguien a esperar
 * un mail que nunca va a llegar.
 *
 * Estaba escrito dos veces —en el formulario y en la lista— con las mismas
 * clases a mano y condiciones distintas (`state.emailed` contra
 * `emailed === false`). Las dos eran correctas por accidente: en la lista,
 * «Generar enlace» no manda ningún correo y por eso no trae `emailed`, así que
 * la versión estricta era la única que no lo pintaba de ámbar. Una de las dos
 * copias iba a perder esa distinción en el primer retoque.
 *
 * `emailed === false` y no `!emailed`: ausente significa "acá no había ningún
 * correo que mandar", que es un éxito liso.
 */
export function InviteResult({ state }: { state: InviteState }) {
  if (!state.message) return null

  if (!state.ok) return <FormMessage message={state.message} />

  return (
    <p
      role="status"
      className={
        state.emailed === false
          ? 'rounded-[11px] bg-amber-soft px-3.5 py-2.5 text-meta text-[#8a5a00]'
          : 'rounded-[11px] bg-green-soft px-3.5 py-2.5 text-meta text-green-ink'
      }
    >
      {state.message}
    </p>
  )
}
