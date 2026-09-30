import { z } from 'zod'

import type { Database } from '@/lib/database.types'
import { GRAMMATICAL_GENDERS } from '@/lib/grammatical-gender'
import { DISCIPLINE_IDS } from '@/lib/disciplines'
import { publicConfig } from '@/lib/env'

import { logAction } from './audit'
import { getDb, getServiceDb } from './db'
import { hashToken, looksLikeToken, newLinkToken } from './patient-forms'

/**
 * Invitations. **Ombúa is not open for sign-up.**
 *
 * The gate itself is not in this file and cannot be: the anon key ships in the
 * JavaScript bundle every visitor downloads, so a `POST` straight at
 * `/auth/v1/signup` never passes through any screen we write. What closes the
 * door is `enable_signup = false` in Supabase — `supabase/config.toml` for the
 * local stack, *Authentication → Sign In / Providers* for production. This file
 * is the one way back in.
 *
 * ─── Why the service role ──────────────────────────────────────────────────
 *
 * The eighth entry in `SERVICE_DB_ALLOWED`, and it earns it the same way as the
 * other seven: **there is no user session for RLS to check against.** Somebody
 * accepting an invitation is, at that moment, not a user at all — the account is
 * created by `auth.admin.createUser` a line later. `invitations` is written the
 * same way for the same reason, and has a read-only policy so a practitioner can
 * see the list without being able to forge it.
 *
 * ─── Why a token of ours and not `inviteUserByEmail` ───────────────────────
 *
 * Supabase's invite creates the account the moment you invite. That turns a
 * typo into a ghost row in `auth.users` that also blocks the correct address,
 * makes "resend" impossible with an `invite` link (the user now exists), and
 * makes "revoke" mean deleting an account. Here nothing exists until the
 * invitee chooses a password: resending is sending the same mail again, and
 * revoking is deleting one row.
 *
 * The token machinery is the one "Antes de empezar" already uses — see
 * `patient-forms.ts`. The token travels in the link and is never stored; only
 * its SHA-256 is.
 */

export type Invitation = Database['public']['Tables']['invitations']['Row']

/** What the person opening the link is shown. Deliberately not the whole row. */
export type OpenInvitation = {
  fullName: string
  email: string
  discipline: string
}

/**
 * Long enough for somebody who reads their mail on Sunday, short enough that an
 * invitation forwarded to the wrong chat stops working on its own. The same
 * fortnight `patient-forms.ts` gives a family.
 */
const LINK_LIFETIME_DAYS = 14

/** A refusal written to be read, shown verbatim. Anything else is logged. */
export class InvitationError extends Error {}

/**
 * One message for every way a link can fail — vencido, ya usado, inventado.
 *
 * Telling them apart would tell a stranger which addresses were invited here,
 * which is the same reason `signIn` does not separate "no such account" from
 * "wrong password".
 */
const BAD_LINK =
  'Esa invitación no funciona: puede que haya vencido, que ya la hayas usado o que el enlace esté incompleto. Pedile una nueva a quien te invitó.'

// ─── Inviting ───────────────────────────────────────────────────────────────

export const NewInvitation = z.object({
  fullName: z.string().trim().min(2, 'Escribí el nombre y apellido de quien invitás.'),
  email: z
    .email('Revisá el correo, parece que falta algo.')
    // Normalizado acá y no sólo en la base: la dirección se compara contra
    // `practitioners.email` y contra el índice único parcial, y las tres tienen
    // que estar mirando la misma cadena.
    .transform((value) => value.trim().toLowerCase()),
  discipline: z.enum(DISCIPLINE_IDS, { message: 'Elegí la profesión.' }),
})

/**
 * Throws unless this practitioner may invite.
 *
 * Read through `getDb()`, so RLS has already limited it to their own row — the
 * query cannot return somebody else's flag even if the id were wrong.
 *
 * Checked here and not only in the page because a Server Action is an endpoint:
 * reaching it does not require having rendered anything.
 */
async function requireAdmin(practitionerId: string) {
  const db = await getDb()
  const { data, error } = await db
    .from('practitioners')
    .select('is_admin, full_name')
    .eq('id', practitionerId)
    .single()

  if (error) throw error
  if (!data.is_admin) {
    throw new InvitationError('Tu cuenta no puede invitar a otras profesionales.')
  }

  return data
}

function linkFor(token: string) {
  return `${publicConfig.NEXT_PUBLIC_APP_URL}/invitacion/${token}`
}

function expiryFrom(now: Date) {
  return new Date(now.getTime() + LINK_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * What every path that hands back a link returns.
 *
 * `link` is here even when the mail went out, and that is the point: it is the
 * only moment the token exists in clear, and the screen offers it for copying.
 * Mail is the slow, silent half of this flow — Resend accepts a message and it
 * lands in spam, or the address has a typo nobody will notice for a week. A link
 * that can be pasted into WhatsApp turns that from a dead end into a detour.
 */
/**
 * Quién manda el correo. Se pasa como argumento y no se importa: ver
 * `inviteProfessional`.
 */
export type SendInvitation = (message: {
  to: string
  fullName: string
  inviterName: string
  link: string
}) => Promise<boolean>

export type InvitationSent = {
  invitation: Invitation
  link: string
  /** False when Resend refused it. The row exists either way — resend works. */
  emailed: boolean
}

/**
 * Creates the invitation and returns the link. **No account exists yet.**
 *
 * `send` is passed in rather than imported. `src/server/notifications.ts` is a
 * Resend client, and this function is the interesting half: threading the sender
 * through as an argument is what lets the test assert the whole thing —
 * validation, the admin check, the row, the hash — without a network call and
 * without a mocking framework. It is the same reason every function in this
 * directory takes `practitionerId` instead of reading a cookie.
 */
export async function inviteProfessional(
  practitionerId: string,
  input: unknown,
  send: SendInvitation,
): Promise<InvitationSent> {
  const data = NewInvitation.parse(input)
  const inviter = await requireAdmin(practitionerId)

  const service = getServiceDb()

  // Ya tiene cuenta. Se dice, y no es una fuga: quien pregunta es la única
  // persona que puede invitar, y la alternativa es que mande una invitación que
  // va a fallar recién cuando la otra persona la abra.
  const { data: existing, error: existingError } = await service
    .from('practitioners')
    .select('id')
    .eq('email', data.email)
    .maybeSingle()
  if (existingError) throw existingError
  if (existing) {
    throw new InvitationError('Esa persona ya tiene cuenta en Ombúa. No hace falta invitarla.')
  }

  // La invitación pendiente la frena igual el índice único parcial; esto es para
  // que el mensaje diga qué hacer en vez de "no pudimos guardar".
  const { data: pending, error: pendingError } = await service
    .from('invitations')
    .select('id')
    .eq('email', data.email)
    .is('accepted_at', null)
    .maybeSingle()
  if (pendingError) throw pendingError
  if (pending) {
    throw new InvitationError(
      'Ya hay una invitación pendiente para ese correo. Reenviala desde la lista de abajo.',
    )
  }

  const { token, hash } = newLinkToken()

  const { data: row, error } = await service
    .from('invitations')
    .insert({
      practitioner_id: practitionerId,
      email: data.email,
      full_name: data.fullName,
      discipline: data.discipline,
      token_hash: hash,
      expires_at: expiryFrom(new Date()),
    })
    .select()
    .single()

  if (error) {
    // La comprobación de arriba es una cortesía y puede quedar vieja entre que
    // lee y esto escribe: dos pestañas, o dos admins. Lo que de verdad frena el
    // duplicado es `invitations_pending_email_key`, y sin esta línea su `23505`
    // sale como "no pudimos crear la invitación" — que no dice lo único útil,
    // que es que la invitación que hacía falta ya está en la lista.
    if (error.code === '23505') {
      throw new InvitationError(
        'Ya hay una invitación pendiente para ese correo. Reenviala desde la lista de abajo.',
      )
    }
    throw error
  }

  const link = linkFor(token)
  const emailed = await send({
    to: data.email,
    fullName: data.fullName,
    inviterName: inviter.full_name,
    link,
  })

  await logAction(practitionerId, 'create', 'invitation', row.id)

  return { invitation: row, link, emailed }
}

/**
 * Mints a new token for a pending invitation and returns the link.
 *
 * **The previous link stops working.** That is not a side effect to be tidied
 * away later, it is the rule `createIntakeLink` already follows: a link is
 * reissued because the old one was lost or went to the wrong place, and in both
 * of those cases it should stop being a way in.
 *
 * It is also the only thing that *can* happen. Only the SHA-256 is stored, so
 * there is no way to show the old link again — not for us, not for anybody with
 * the database. Every screen that offers this has to say so.
 */
async function rotateLink(
  practitionerId: string,
  invitationId: string,
  { counts }: { counts: boolean },
): Promise<{ invitation: Invitation; link: string; inviterName: string }> {
  const inviter = await requireAdmin(practitionerId)
  const service = getServiceDb()

  const { token, hash } = newLinkToken()

  // El contador se lee antes porque PostgREST no sabe escribir `sent_count =
  // sent_count + 1`: manda JSON, no SQL. Dos reenvíos simultáneos podrían
  // contar uno solo, y es un contador para la pantalla — perder uno no rompe
  // nada. Lo que **no** puede resolverse así es "¿sigue pendiente?", y por eso
  // esa condición viaja en el UPDATE de abajo y no en este SELECT.
  const { data: current } = await service
    .from('invitations')
    .select('sent_count')
    .eq('id', invitationId)
    .eq('practitioner_id', practitionerId)
    .maybeSingle()

  const now = new Date()

  // `counts` distingue reenviar de copiar. Copiar el enlace también rota el
  // token, pero no manda nada — y decir "enviada 3 veces" de un correo que
  // nunca salió convierte el contador en ruido justo en la pantalla que existe
  // para entender por qué alguien no recibió nada.
  const { data: row, error } = await service
    .from('invitations')
    .update({
      token_hash: hash,
      expires_at: expiryFrom(now),
      ...(counts
        ? { last_sent_at: now.toISOString(), sent_count: (current?.sent_count ?? 1) + 1 }
        : {}),
    })
    .eq('id', invitationId)
    .eq('practitioner_id', practitionerId)
    .is('accepted_at', null)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!row) throw new InvitationError('Esa invitación ya no está pendiente.')

  return { invitation: row, link: linkFor(token), inviterName: inviter.full_name }
}

/** Sends the invitation again, with a new token. */
export async function resendInvitation(
  practitionerId: string,
  invitationId: string,
  send: SendInvitation,
): Promise<InvitationSent> {
  const { invitation, link, inviterName } = await rotateLink(practitionerId, invitationId, { counts: true })

  const emailed = await send({
    to: invitation.email,
    fullName: invitation.full_name,
    inviterName,
    link,
  })

  await logAction(practitionerId, 'update', 'invitation', invitation.id)

  return { invitation, link, emailed }
}

/**
 * A fresh link, with no email sent — for handing it over by WhatsApp, or by
 * reading it out loud.
 *
 * This exists because the mail is the half of this flow that fails quietly. A
 * dead Resend key answers 401 and the screen can say so; a message that Resend
 * accepts and a mailbox files as spam says nothing at all. Without this, the
 * only way back to a working link is "Reenviar", which tries the mail again —
 * the exact thing that is not working.
 */
export async function renewInvitationLink(
  practitionerId: string,
  invitationId: string,
): Promise<{ invitation: Invitation; link: string }> {
  const { invitation, link } = await rotateLink(practitionerId, invitationId, { counts: false })

  await logAction(practitionerId, 'update', 'invitation', invitation.id)

  return { invitation, link }
}

/**
 * Deletes a pending invitation. **Never touches an accepted one** — that would
 * be deleting a colleague's account, and this button exists to undo a typo.
 */
export async function revokeInvitation(practitionerId: string, invitationId: string) {
  await requireAdmin(practitionerId)

  const { data, error } = await getServiceDb()
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .eq('practitioner_id', practitionerId)
    .is('accepted_at', null)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new InvitationError('Esa invitación ya no está pendiente.')

  await logAction(practitionerId, 'delete', 'invitation', invitationId)
}

/**
 * Aceptada, vencida o pendiente. Derivado y no una columna: un estado guardado
 * necesitaría que algo lo cambiara al vencer, y no hay nada que corra a esa
 * hora — la fila quedaría diciendo "pendiente" para siempre.
 */
export type InvitationStatus = 'accepted' | 'expired' | 'pending'

export type ListedInvitation = Invitation & { status: InvitationStatus }

/**
 * Everything this practitioner has sent, newest first. RLS limits the rows.
 *
 * The status is decided here and not in the component that draws it. Partly
 * because it is a rule and rules live in `src/server/`, and partly because the
 * component is a client one: reading the clock during its render is calling an
 * impure function, and a row would change from "pendiente" to "vencida" in the
 * middle of an interaction just because the list re-rendered. One instant, read
 * once, judges every row.
 */
export async function listInvitations(practitionerId: string): Promise<ListedInvitation[]> {
  const db = await getDb()
  const { data, error } = await db
    .from('invitations')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const now = Date.now()
  return data.map((invitation) => ({
    ...invitation,
    status: invitation.accepted_at
      ? 'accepted'
      : new Date(invitation.expires_at).getTime() <= now
        ? 'expired'
        : 'pending',
  }))
}

// ─── Accepting ──────────────────────────────────────────────────────────────

/**
 * The invitation behind a token, or null.
 *
 * Reads through the service role because whoever is holding the link has no
 * session — that is the whole point of the link. It returns three fields and
 * not the row: `token_hash` and the inviter's id have no business in a page
 * rendered for somebody who is not signed in.
 */
export async function invitationByToken(token: string): Promise<OpenInvitation | null> {
  if (!looksLikeToken(token)) return null

  const { data, error } = await getServiceDb()
    .from('invitations')
    .select('full_name, email, discipline')
    .eq('token_hash', hashToken(token))
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error) throw error
  return data
    ? { fullName: data.full_name, email: data.email, discipline: data.discipline }
    : null
}

export const AcceptInvitation = z.object({
  token: z.string().min(1),
  password: z.string().min(10, 'La contraseña necesita al menos 10 caracteres.'),
  acceptedTerms: z.literal(true, {
    message: 'Necesitamos que aceptes los términos para crear la cuenta.',
  }),
  grammaticalGender: z
    .enum(GRAMMATICAL_GENDERS)
    .or(z.literal(''))
    .nullish()
    .transform((value) => (value ? value : null)),
})

/**
 * Turns an invitation into an account, and returns the address to sign in with.
 *
 * ─── The order matters ─────────────────────────────────────────────────────
 *
 * The invitation is marked accepted **first**, conditionally on still being
 * pending, and the account is created after. That is a compare-and-swap: two
 * submissions of the same link race on one UPDATE, and only one of them gets a
 * row back.
 *
 * Doing it the other way — create, then mark — lets both submissions reach
 * `createUser`, and the loser gets "ya hay una cuenta con ese correo" for an
 * account it just created itself.
 *
 * The cost of this order is that a failed `createUser` would leave an
 * invitation marked accepted with no account behind it, and the person holding
 * the link locked out with nothing to do about it. So the mark is rolled back.
 * That is the only reason the try/catch exists.
 */
/**
 * Un enlace que ya no sirve porque la cuenta **sí se creó**.
 *
 * Es distinto de `BAD_LINK` y tiene que serlo: acá no hay nada que pedirle a
 * nadie, hay una cuenta con la contraseña que esta persona ya eligió. Decirle
 * "pedí una invitación nueva" la manda a esperar por algo que ya tiene.
 */
const ALREADY_HAS_ACCOUNT =
  'Ya hay una cuenta con ese correo, y la contraseña que elegiste sirve. Entrá con ella; si no la recordás, usá «Olvidé mi contraseña».'

/**
 * Deshace el `accepted_at` de una invitación que no llegó a crear su cuenta.
 *
 * **Mira su propio error**, que es la diferencia entre una red de seguridad y la
 * apariencia de una. Puede fallar de verdad, y por un motivo concreto: mientras
 * `accepted_at` está puesto, la fila queda fuera del índice único parcial
 * `invitations_pending_email_key`, así que alguien pudo haber invitado el mismo
 * correo en el medio — y entonces este UPDATE choca con `23505`.
 *
 * Si eso pasa no hay nada que hacer desde acá, y tampoco hace falta: la
 * invitación nueva es la buena. Lo que no puede pasar es que nadie se entere,
 * porque la fila vieja se queda diciendo "aceptada" sin cuenta detrás y la lista
 * lo muestra como una colega que entró.
 */
async function undoAcceptance(
  service: ReturnType<typeof getServiceDb>,
  invitationId: string,
) {
  const { error } = await service
    .from('invitations')
    .update({ accepted_at: null })
    .eq('id', invitationId)

  if (error) {
    console.error(
      '[invitations] la invitación quedó marcada como aceptada sin cuenta detrás',
      { invitationId, error },
    )
  }
}

export async function acceptInvitation(input: unknown): Promise<{ email: string }> {
  const data = AcceptInvitation.parse(input)

  if (!looksLikeToken(data.token)) throw new InvitationError(BAD_LINK)

  const service = getServiceDb()
  const now = new Date().toISOString()

  const { data: invitation, error } = await service
    .from('invitations')
    .update({ accepted_at: now })
    .eq('token_hash', hashToken(data.token))
    .is('accepted_at', null)
    .gt('expires_at', now)
    .select()
    .single()

  if (error || !invitation) throw new InvitationError(BAD_LINK)

  // `email_confirm: true` porque el correo ya está probado: el enlace llegó a
  // esa casilla y volvió. Pedir una confirmación más sería mandar a alguien a
  // buscar un segundo mail para demostrar lo que el primero ya demostró.
  //
  // La metadata es la que lee el trigger `handle_new_practitioner`, así que la
  // fila de `practitioners` aparece sola, con su slug, igual que en un alta.
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: invitation.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: invitation.full_name,
      discipline: invitation.discipline,
    },
  })

  if (createError || !created?.user) {
    // ─── Dos fracasos con la misma forma, y hay que separarlos ────────────
    //
    // Uno es "no se creó nada": se revierte y se reintenta, y el enlace sigue
    // sirviendo. El otro es "la cuenta ya existe" — casi siempre porque un
    // intento anterior de esta misma invitación llegó a crearla y se cayó
    // después. Revertir ahí es lo peor que se puede hacer: devuelve el mismo
    // enlace, que vuelve a chocar contra la cuenta que ya está, para siempre.
    // Quien lo sufre tiene cuenta y contraseña funcionando y lee "probá de
    // nuevo" hasta que el enlace vence.
    //
    // **La pregunta se le hace a la base y no al error.** Un código como
    // `email_exists` es una cadena que la librería puede renombrar entre
    // versiones, y equivocarse acá es justamente el bucle de arriba. Si hay
    // fila en `practitioners`, hay cuenta; no hay nada más que interpretar.
    const { data: account } = await service
      .from('practitioners')
      .select('id')
      .eq('email', invitation.email)
      .maybeSingle()

    if (account) {
      // De paso se completa el rastro que el intento anterior no llegó a
      // escribir, así la lista de la admin deja de mentir.
      await service
        .from('invitations')
        .update({ user_id: account.id })
        .eq('id', invitation.id)

      console.error('[invitations] la cuenta ya existía al aceptar la invitación', {
        invitationId: invitation.id,
        createError,
      })
      throw new InvitationError(ALREADY_HAS_ACCOUNT)
    }

    await undoAcceptance(service, invitation.id)
    console.error('[invitations] no se pudo crear la cuenta invitada', createError)
    throw new InvitationError(
      'No pudimos crear tu cuenta. Probá de nuevo en un momento; el enlace sigue sirviendo.',
    )
  }

  // ─── De acá para abajo la cuenta existe y la contraseña funciona ────────
  //
  // Nada de lo que sigue puede tirar. `user_id` es el rastro de qué invitación
  // se convirtió en qué cuenta: sirve para mirar después, no para entrar. Que
  // falle su escritura y eso deshaga un alta es cambiar una anotación por una
  // persona que se queda afuera — que es exactamente lo que hacía este bloque.
  const { error: linkError } = await service
    .from('invitations')
    .update({ user_id: created.user.id })
    .eq('id', invitation.id)

  if (linkError) {
    console.error('[invitations] la cuenta se creó pero quedó sin enlazar a su invitación', {
      invitationId: invitation.id,
      userId: created.user.id,
      error: linkError,
    })
  }

  // "Me identifico como". Tampoco puede tirar: sin esto Ombúa le habla en
  // masculino, que es un defecto chico y se corrige en Mi perfil.
  if (data.grammaticalGender) {
    const { error: genderError } = await service
      .from('practitioners')
      .update({ grammatical_gender: data.grammaticalGender })
      .eq('id', created.user.id)
    if (genderError) {
      console.error('[invitations] no se pudo guardar cómo se identifica', genderError)
    }
  }

  await logAction(created.user.id, 'create', 'practitioner', created.user.id)

  return { email: invitation.email }
}
