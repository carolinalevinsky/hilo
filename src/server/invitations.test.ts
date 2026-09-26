import { createHash } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  anonClient,
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  signedInAs,
  testEmail,
  type Db,
} from '@/test/supabase'

/**
 * Who gets into Ombúa, and how the link that lets them in behaves.
 *
 * Against real Postgres, like `patient-forms.test.ts`, because most of what is
 * being claimed is kept by the schema rather than by this module: the partial
 * unique index on a pending address, the `accepted_at is null` conditions that
 * make accepting a compare-and-swap, and the sign-up trigger that turns a new
 * `auth.users` row into a practitioner. A test double keeps none of those, and
 * would pass while the database refused everything.
 *
 * `holder.db` swaps the session in, exactly as `getDb()` would at runtime.
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const {
  acceptInvitation,
  InvitationError,
  invitationByToken,
  inviteProfessional,
  listInvitations,
  renewInvitationLink,
  resendInvitation,
  revokeInvitation,
} = await import('./invitations')

const service = serviceClient()

const adminEmail = testEmail('invita-admin')
const plainEmail = testEmail('invita-comun')

let adminId = ''
let plainId = ''
let asAdmin: Db
let asPlain: Db

/** Every address this file invites, so `afterAll` can clean up what accepted. */
const invited: string[] = []

/** Records what `inviteProfessional` was asked to send, and says it worked. */
function recorder() {
  const sent: { to: string; link: string; inviterName: string }[] = []
  const send = async (message: {
    to: string
    fullName: string
    inviterName: string
    link: string
  }) => {
    sent.push({ to: message.to, link: message.link, inviterName: message.inviterName })
    return true
  }
  return { sent, send }
}

const tokenOf = (link: string) => link.slice(link.lastIndexOf('/') + 1)
const hash = (token: string) => createHash('sha256').update(token).digest('hex')

async function invite(email: string, fullName = 'Invitada de Prueba') {
  invited.push(email)
  const mail = recorder()
  holder.db = asAdmin
  const result = await inviteProfessional(
    adminId,
    { fullName, email, discipline: 'psychology' },
    mail.send,
  )
  return { ...result, sent: mail.sent }
}

beforeAll(async () => {
  adminId = await createTestPractitioner(adminEmail, 'Carolina Admin', 'psychopedagogy')
  plainId = await createTestPractitioner(plainEmail, 'Común Prueba', 'speech_therapy')

  // Admin is granted with an UPDATE and never from the application — the column
  // is not writable through a session at all, which `rls.test.ts` asserts.
  await service.from('practitioners').update({ is_admin: true }).eq('id', adminId)

  asAdmin = await signedInAs(adminEmail)
  asPlain = await signedInAs(plainEmail)
  holder.service = service
}, 60_000)

afterAll(async () => {
  const { data } = await service
    .from('practitioners')
    .select('id')
    .in('email', invited)
  for (const row of data ?? []) await deleteTestPractitioner(row.id)

  await deleteTestPractitioner(adminId)
  await deleteTestPractitioner(plainId)
})

describe('the door itself', () => {
  /**
   * El único test que mira la cerradura y no la puerta.
   *
   * Todo lo demás en este archivo da por hecho que el alta está cerrada y prueba
   * el camino de vuelta. Esto comprueba lo que lo hace cierto, y lo comprueba
   * con **el cliente que cualquiera puede construir**: la anon key viaja en el
   * bundle de todo visitante, así que esto es literalmente el pedido que haría
   * un desconocido. Ninguna pantalla nuestra está en el medio, que es el punto —
   * sacar el formulario no cierra nada.
   *
   * Lee `enable_signup` de `[auth]` en `supabase/config.toml`, así que también
   * es lo que avisaría si alguien lo vuelve a poner en `true`.
   */
  it('refuses an account to somebody who just asks for one', async () => {
    const { data, error } = await anonClient().auth.signUp({
      email: testEmail('colada'),
      password: 'una-clave-cualquiera',
    })

    expect(error?.code).toBe('signup_disabled')
    expect(data.user).toBeNull()
  })

  /**
   * La otra mitad, y la que se rompió al escribir esto.
   *
   * `enable_signup` bajo `[auth.email]` parece la versión fina del switch de
   * arriba y no lo es: GoTrue lo lee como el interruptor del **proveedor**, así
   * que apagarlo deja afuera a todo el que ya tiene cuenta. Contesta
   * `email_provider_disabled`, que `/entrar` muestra como "El correo o la
   * contraseña no coinciden" — o sea, manda a revisar una contraseña que estaba
   * bien.
   *
   * Los otros tests firman sesión con `signedInAs` y también se caerían, pero se
   * caerían diciendo otra cosa. Éste nombra el fallo.
   */
  it('still lets somebody who has an account sign in with a password', async () => {
    const { data, error } = await anonClient().auth.signInWithPassword({
      email: adminEmail,
      password: 'una-clave-de-prueba',
    })

    expect(error).toBeNull()
    expect(data.user?.email).toBe(adminEmail)
  })
})

describe('who may invite', () => {
  it('refuses a practitioner who is not an admin', async () => {
    holder.db = asPlain

    await expect(
      inviteProfessional(
        plainId,
        { fullName: 'Alguien', email: testEmail('no-deberia'), discipline: 'psychology' },
        async () => true,
      ),
    ).rejects.toBeInstanceOf(InvitationError)
  })

  it('refuses to resend or revoke somebody else’s invitation', async () => {
    const { invitation } = await invite(testEmail('ajena'))

    holder.db = asPlain
    await expect(
      resendInvitation(plainId, invitation.id, async () => true),
    ).rejects.toBeInstanceOf(InvitationError)
    await expect(revokeInvitation(plainId, invitation.id)).rejects.toBeInstanceOf(
      InvitationError,
    )
  })
})

describe('sending one', () => {
  it('writes the row, mails the link, and stores only the hash', async () => {
    const email = testEmail('nueva')
    const { invitation, link, emailed, sent } = await invite(email, 'Lucía Fernández')

    expect(emailed).toBe(true)
    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toBe(email)
    expect(sent[0]?.inviterName).toBe('Carolina Admin')
    expect(sent[0]?.link).toBe(link)

    const token = tokenOf(link)
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)

    // El token en claro no está en ninguna columna. Es la promesa entera del
    // esquema: quien pueda leer la tabla no puede entrar con lo que lee.
    const { data: row } = await service
      .from('invitations')
      .select('*')
      .eq('id', invitation.id)
      .single()

    expect(row?.token_hash).toBe(hash(token))
    expect(JSON.stringify(row)).not.toContain(token)
    expect(row?.accepted_at).toBeNull()
    expect(row?.sent_count).toBe(1)
  })

  it('lowercases the address, so the same person is the same person', async () => {
    const email = testEmail('MaYuScUlAs').toLowerCase()
    const { invitation } = await invite(email.toUpperCase())

    expect(invitation.email).toBe(email)
  })

  it('refuses a second pending invitation to the same address', async () => {
    const email = testEmail('repetida')
    await invite(email)

    await expect(invite(email)).rejects.toBeInstanceOf(InvitationError)
  })

  it('refuses somebody who already has an account', async () => {
    holder.db = asAdmin

    await expect(
      inviteProfessional(
        adminId,
        { fullName: 'Común Prueba', email: plainEmail, discipline: 'speech_therapy' },
        async () => true,
      ),
    ).rejects.toBeInstanceOf(InvitationError)
  })

  it('refuses an address that is not one', async () => {
    holder.db = asAdmin

    await expect(
      inviteProfessional(
        adminId,
        { fullName: 'Alguien', email: 'no-es-un-correo', discipline: 'psychology' },
        async () => true,
      ),
    ).rejects.toThrow()
  })

  it('still creates the invitation when the mail does not go out', async () => {
    // Resend refusing must not lose the invitation: the link is in the result
    // and the screen offers it for copying. Losing the row here would mean the
    // address is now taken by nothing at all.
    const email = testEmail('sin-mail')
    invited.push(email)
    holder.db = asAdmin

    const { link, emailed } = await inviteProfessional(
      adminId,
      { fullName: 'Sin Correo', email, discipline: 'psychology' },
      async () => false,
    )

    expect(emailed).toBe(false)
    expect(await invitationByToken(tokenOf(link))).not.toBeNull()
  })
})

describe('the link', () => {
  it('opens for the invitee, and says only what the screen needs', async () => {
    const email = testEmail('abre')
    const { link } = await invite(email, 'Paula Rodríguez')

    const open = await invitationByToken(tokenOf(link))

    expect(open).toEqual({
      fullName: 'Paula Rodríguez',
      email,
      discipline: 'psychology',
    })
  })

  it('does not open for a token that is not one, or is not ours', async () => {
    expect(await invitationByToken('')).toBeNull()
    expect(await invitationByToken('demasiado-corto')).toBeNull()
    expect(await invitationByToken('z'.repeat(43))).toBeNull()
  })

  it('does not open after it expired', async () => {
    const { invitation, link } = await invite(testEmail('vencida'))

    await service
      .from('invitations')
      .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
      .eq('id', invitation.id)

    expect(await invitationByToken(tokenOf(link))).toBeNull()
  })
})

describe('accepting it', () => {
  it('creates the account with the metadata the trigger reads', async () => {
    const email = testEmail('acepta')
    const { link, invitation } = await invite(email, 'Renata Silva')

    const accepted = await acceptInvitation({
      token: tokenOf(link),
      password: 'una-clave-de-prueba',
      acceptedTerms: true,
    })

    expect(accepted.email).toBe(email)

    // La fila de `practitioners` la escribe el trigger a partir de la metadata,
    // así que esto prueba las dos cosas de una: que la cuenta se creó y que se
    // creó con el nombre y la profesión que decía la invitación.
    const { data: practitioner } = await service
      .from('practitioners')
      .select('full_name, discipline, slug, is_admin')
      .eq('email', email)
      .single()

    expect(practitioner?.full_name).toBe('Renata Silva')
    expect(practitioner?.discipline).toBe('psychology')
    expect(practitioner?.slug).toMatch(/^renata-silva(-\d+)?$/)
    // Invitar no reparte la llave: quien entra por una invitación no puede
    // invitar a su vez salvo que alguien lo decida con un UPDATE.
    expect(practitioner?.is_admin).toBe(false)

    // Y la sesión funciona con la contraseña que acaba de elegir, que es lo
    // único que la acción hace después de esto.
    await expect(signedInAs(email)).resolves.toBeDefined()

    const { data: row } = await service
      .from('invitations')
      .select('accepted_at, user_id')
      .eq('id', invitation.id)
      .single()

    expect(row?.accepted_at).not.toBeNull()
    expect(row?.user_id).toBeTruthy()
  })

  it('cannot be used twice', async () => {
    const email = testEmail('dos-veces')
    const { link } = await invite(email)
    const token = tokenOf(link)

    await acceptInvitation({ token, password: 'una-clave-de-prueba', acceptedTerms: true })

    await expect(
      acceptInvitation({ token, password: 'otra-clave', acceptedTerms: true }),
    ).rejects.toBeInstanceOf(InvitationError)
  })

  it('refuses an expired token at the moment it would create the account', async () => {
    // `invitationByToken` ya tiene su propio caso de vencimiento, y no alcanza:
    // son dos consultas escritas por separado, y la que de verdad importa es
    // ésta, porque es la que crea la cuenta. Una refactorización que se lleve
    // puesto el `.gt('expires_at')` de acá no rompería ningún test sin esto.
    const email = testEmail('acepta-vencida')
    const { invitation, link } = await invite(email)

    await service
      .from('invitations')
      .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
      .eq('id', invitation.id)

    await expect(
      acceptInvitation({
        token: tokenOf(link),
        password: 'una-clave-de-prueba',
        acceptedTerms: true,
      }),
    ).rejects.toBeInstanceOf(InvitationError)

    const { data: account } = await service
      .from('practitioners')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    expect(account).toBeNull()
  })

  it('sends somebody whose account already exists to sign in, and does not undo it', async () => {
    // El bucle que arreglamos. Si `createUser` funcionó y algo se cayó después,
    // el segundo intento se encuentra con la cuenta ya hecha. Revertir ahí
    // devuelve el mismo enlace, que vuelve a chocar contra la misma cuenta,
    // para siempre — con la contraseña correcta ya elegida y nada que lo diga.
    //
    // Se reproduce creando la cuenta por afuera, que es el mismo estado en el
    // que queda el mundo después de ese fallo parcial.
    const email = testEmail('ya-existe')
    const { invitation, link } = await invite(email)

    const createdId = await createTestPractitioner(email, 'Ya Existe', 'psychology')

    await expect(
      acceptInvitation({
        token: tokenOf(link),
        password: 'una-clave-de-prueba',
        acceptedTerms: true,
      }),
    ).rejects.toThrow(/Entrá con ella/)

    const { data: row } = await service
      .from('invitations')
      .select('accepted_at, user_id')
      .eq('id', invitation.id)
      .single()

    // Aceptada y **no** revertida: si volviera a `null`, el enlace seguiría vivo
    // y el próximo intento repetiría exactamente lo mismo.
    expect(row?.accepted_at).not.toBeNull()
    // Y el rastro se completó con la cuenta que sí existe, así que la lista de
    // la admin deja de decir "pendiente" sobre alguien que ya está adentro.
    expect(row?.user_id).toBe(createdId)
  })

  it('refuses a short password before creating anything', async () => {
    const email = testEmail('clave-corta')
    const { link } = await invite(email)

    await expect(
      acceptInvitation({ token: tokenOf(link), password: 'abc', acceptedTerms: true }),
    ).rejects.toThrow()

    // El enlace sigue vivo: fallar la validación no puede gastar la invitación.
    expect(await invitationByToken(tokenOf(link))).not.toBeNull()
  })

  it('refuses without the terms ticked', async () => {
    const email = testEmail('sin-terminos')
    const { link } = await invite(email)

    await expect(
      acceptInvitation({
        token: tokenOf(link),
        password: 'una-clave-de-prueba',
        acceptedTerms: false,
      }),
    ).rejects.toThrow()
  })
})

describe('resending and revoking', () => {
  it('rotates the token, so the old link stops working', async () => {
    const { invitation, link } = await invite(testEmail('reenvia'))
    const first = tokenOf(link)

    holder.db = asAdmin
    const mail = recorder()
    const { link: second } = await resendInvitation(adminId, invitation.id, mail.send)

    expect(tokenOf(second)).not.toBe(first)
    expect(await invitationByToken(first)).toBeNull()
    expect(await invitationByToken(tokenOf(second))).not.toBeNull()

    const { data: row } = await service
      .from('invitations')
      .select('sent_count')
      .eq('id', invitation.id)
      .single()
    expect(row?.sent_count).toBe(2)
  })

  it('hands over a fresh link without sending anything, and without counting it', async () => {
    const { invitation, link } = await invite(testEmail('copia'))
    const first = tokenOf(link)

    holder.db = asAdmin
    const renewed = await renewInvitationLink(adminId, invitation.id)

    expect(tokenOf(renewed.link)).not.toBe(first)
    expect(await invitationByToken(first)).toBeNull()
    expect(await invitationByToken(tokenOf(renewed.link))).not.toBeNull()

    // `sent_count` cuenta correos, y acá no salió ninguno. Decir "enviada 3
    // veces" de un mail que nunca se mandó vuelve ruido el único número que
    // hay para entender por qué alguien no recibió nada.
    const { data: row } = await service
      .from('invitations')
      .select('sent_count')
      .eq('id', invitation.id)
      .single()
    expect(row?.sent_count).toBe(1)
  })

  it('does not hand over a link for one that was already accepted', async () => {
    const email = testEmail('copia-tarde')
    const { invitation, link } = await invite(email)
    await acceptInvitation({
      token: tokenOf(link),
      password: 'una-clave-de-prueba',
      acceptedTerms: true,
    })

    holder.db = asAdmin
    await expect(renewInvitationLink(adminId, invitation.id)).rejects.toBeInstanceOf(
      InvitationError,
    )
  })

  it('refuses to hand over a link for somebody else\u2019s invitation', async () => {
    const { invitation } = await invite(testEmail('copia-ajena'))

    holder.db = asPlain
    await expect(renewInvitationLink(plainId, invitation.id)).rejects.toBeInstanceOf(
      InvitationError,
    )
  })

  it('does not resend one that was already accepted', async () => {
    const email = testEmail('ya-entro')
    const { invitation, link } = await invite(email)
    await acceptInvitation({
      token: tokenOf(link),
      password: 'una-clave-de-prueba',
      acceptedTerms: true,
    })

    holder.db = asAdmin
    await expect(
      resendInvitation(adminId, invitation.id, async () => true),
    ).rejects.toBeInstanceOf(InvitationError)
  })

  it('revoking deletes it and kills the link', async () => {
    const { invitation, link } = await invite(testEmail('revocada'))

    holder.db = asAdmin
    await revokeInvitation(adminId, invitation.id)

    expect(await invitationByToken(tokenOf(link))).toBeNull()
  })

  it('never revokes an accepted one, which would be deleting a colleague', async () => {
    const email = testEmail('colega')
    const { invitation, link } = await invite(email)
    await acceptInvitation({
      token: tokenOf(link),
      password: 'una-clave-de-prueba',
      acceptedTerms: true,
    })

    holder.db = asAdmin
    await expect(revokeInvitation(adminId, invitation.id)).rejects.toBeInstanceOf(
      InvitationError,
    )

    const { data: practitioner } = await service
      .from('practitioners')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    expect(practitioner).not.toBeNull()
  })
})

describe('the list', () => {
  it('shows the admin her own invitations, with a status decided on the server', async () => {
    holder.db = asAdmin
    const rows = await listInvitations(adminId)

    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((row) => row.practitioner_id === adminId)).toBe(true)
    expect(rows.some((row) => row.status === 'accepted')).toBe(true)
    expect(rows.some((row) => row.status === 'expired')).toBe(true)
    expect(rows.some((row) => row.status === 'pending')).toBe(true)

    // Newest first, which is the order the screen renders without sorting.
    const dates = rows.map((row) => Date.parse(row.created_at))
    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })

  it('shows another practitioner nothing, because RLS filters it', async () => {
    holder.db = asPlain
    expect(await listInvitations(plainId)).toEqual([])
  })
})
