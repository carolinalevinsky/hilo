'use server'

import { revalidatePath } from 'next/cache'

import { formErrorFor, type FormState } from '@/lib/form-state'
import { requireUser } from '@/server/auth'
import {
  InvitationError,
  inviteProfessional,
  renewInvitationLink,
  resendInvitation,
  revokeInvitation,
} from '@/server/invitations'
import { sendInvitation } from '@/server/notifications'

import type { InviteState } from './state'

/**
 * Server Actions for the invitations screen.
 *
 * Thin, like the rest: resolve the user, call `src/server/invitations.ts`,
 * revalidate. The admin check is **not** here — it is inside every function in
 * that file, because a Server Action is an endpoint and reaching it does not
 * require having rendered the page that hides the button.
 */

/**
 * `InvitationError` carries a sentence written to be read; anything else is a
 * bug and gets the neutral phrase plus a line in the server log. This is the
 * same split `formErrorFor` makes for Zod, extended to the one error class this
 * module throws on purpose.
 */
function failure(error: unknown, fallback: string): FormState {
  if (error instanceof InvitationError) return { ok: false, message: error.message }
  return formErrorFor(error, fallback)
}

export async function inviteAction(
  _previous: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await requireUser()

  const typed = {
    fullName: String(formData.get('fullName') ?? ''),
    email: String(formData.get('email') ?? ''),
    discipline: String(formData.get('discipline') ?? ''),
  }

  try {
    const { link, emailed, invitation } = await inviteProfessional(
      user.id,
      typed,
      sendInvitation,
    )

    revalidatePath('/invitaciones')

    return {
      ok: true,
      message: emailed
        ? `Listo, le mandamos la invitación a ${invitation.email}.`
        : `Creamos la invitación, pero el correo a ${invitation.email} no salió. Pasale el enlace vos.`,
      link,
      emailed,
      invitee: invitation.full_name,
    }
  } catch (error) {
    // Echoed back so a rejected form refills itself. There is no password on
    // this form, so all three fields can travel.
    return { ...failure(error, 'No pudimos crear la invitación. Probá de nuevo.'), values: typed }
  }
}

export async function resendInvitationAction(
  _previous: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await requireUser()

  try {
    const { link, emailed, invitation } = await resendInvitation(
      user.id,
      String(formData.get('invitationId') ?? ''),
      sendInvitation,
    )

    revalidatePath('/invitaciones')

    return {
      ok: true,
      // Said out loud because it is surprising and it matters: whoever has the
      // old link in their inbox now has a dead one.
      message: emailed
        ? `Reenviamos la invitación a ${invitation.email}. El enlace anterior dejó de servir.`
        : `Generamos un enlace nuevo, pero el correo a ${invitation.email} no salió. Pasáselo vos.`,
      link,
      emailed,
      invitee: invitation.full_name,
    }
  } catch (error) {
    return failure(error, 'No pudimos reenviar la invitación. Probá de nuevo.')
  }
}

/**
 * Hands back a working link without sending anything.
 *
 * The link is new, and the previous one is dead — only the hash is stored, so
 * showing the old one is not something anybody can do. The message says it
 * outright rather than leaving it to be discovered by whoever was already sent
 * the old one.
 */
export async function copyInvitationLinkAction(
  _previous: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await requireUser()

  try {
    const { link, invitation } = await renewInvitationLink(
      user.id,
      String(formData.get('invitationId') ?? ''),
    )

    revalidatePath('/invitaciones')

    return {
      ok: true,
      message: `Enlace nuevo para ${invitation.email}. No mandamos ningún correo, y el enlace anterior dejó de servir.`,
      link,
      invitee: invitation.full_name,
    }
  } catch (error) {
    return failure(error, 'No pudimos generar el enlace. Probá de nuevo.')
  }
}

export async function revokeInvitationAction(
  _previous: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await requireUser()

  try {
    await revokeInvitation(user.id, String(formData.get('invitationId') ?? ''))
  } catch (error) {
    return failure(error, 'No pudimos cancelar la invitación. Probá de nuevo.')
  }

  revalidatePath('/invitaciones')
  return { ok: true, message: 'Cancelamos la invitación. Ese enlace ya no sirve.' }
}
