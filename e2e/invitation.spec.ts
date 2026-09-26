import { expect, test } from '@playwright/test'

import {
  createConfirmedUser,
  deleteAuthUserByEmail,
  grantAdmin,
  uniqueEmail,
} from './support/supabase'

/**
 * How somebody gets into Ombúa at all, now that nobody can let themselves in.
 *
 * This is the story `critical-path.spec.ts` used to open with, and it earned its
 * own file when signing up stopped being one screen. It is two people and two
 * sessions: an admin who invites, and a stranger who opens the link and chooses
 * a password. Everything in between — the token, the row, the trigger that
 * writes the `practitioners` row from the invitation's metadata — is invisible
 * from here, which is the point.
 *
 * ─── Why the link is read off the screen ───────────────────────────────────
 *
 * The invitation also goes out by mail, and the mail is not what is being tested:
 * Resend does not run in CI. But the panel shows the link for copying, deliberately
 * and always — a message that Resend accepted and a mailbox filed as spam looks
 * exactly like one that arrived. So the link on screen is not a convenience for
 * the test, it is the same thing the practitioner uses when the mail does not
 * show up, and reading it here is the only part of this flow that is tested twice.
 */

const ADMIN_PASSWORD = 'una-clave-de-prueba'
const INVITEE_PASSWORD = 'la-clave-de-la-invitada'
const ADMIN = 'Carolina Levinsky'
const INVITEE = 'Renata Silva'

const adminEmail = uniqueEmail('e2e-admin')
const inviteeEmail = uniqueEmail('e2e-invitada')

test.afterAll(async () => {
  await deleteAuthUserByEmail(inviteeEmail)
  await deleteAuthUserByEmail(adminEmail)
})

test('an admin invites somebody, and they let themselves in with the link', async ({
  page,
}) => {
  let link = ''

  await test.step('nobody can open an account on their own any more', async () => {
    await page.goto('/crear-cuenta')

    await expect(
      page.getByRole('heading', { name: 'Ombúa es por invitación' }),
    ).toBeVisible()
    // The form is gone, not hidden. What actually refuses a sign-up is
    // `enable_signup = false` in Supabase; this only has to not offer one.
    await expect(page.getByLabel('Nombre y apellido')).toHaveCount(0)
  })

  await test.step('the admin signs in and opens the panel', async () => {
    await createConfirmedUser({
      email: adminEmail,
      password: ADMIN_PASSWORD,
      fullName: ADMIN,
      discipline: 'psychopedagogy',
    })
    await grantAdmin(adminEmail)

    await page.goto('/entrar')
    await page.getByLabel('Email').fill(adminEmail)
    await page.getByLabel('Contraseña', { exact: true }).fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/inicio$/)

    // La entrada está en el menú, y sólo para quien puede usarla.
    await expect(
      page.getByRole('link', { name: 'Invitaciones', exact: true }),
    ).toBeVisible()

    await page.goto('/invitaciones')
    await expect(page.getByRole('heading', { name: 'Invitaciones' })).toBeVisible()
  })

  await test.step('sends the invitation and is handed the link', async () => {
    await page.getByLabel('Nombre y apellido').fill(INVITEE)
    await page.getByLabel('Email').fill(inviteeEmail)
    await page.getByLabel('Su profesión').selectOption('psychology')
    await page.getByRole('button', { name: 'Enviar invitación' }).click()

    // Whether the mail went out depends on Resend, which CI has a placeholder
    // key for. Either way the invitation exists and the link is on screen —
    // that is exactly the promise this screen makes.
    //
    // Scoped to the card by name, not by document order: both cards can show a
    // link at once and they are different links, so `.first()` / `.last()`
    // would silently follow a reorder onto the wrong one instead of failing.
    const inviteCard = page.getByRole('region', { name: 'Invitar a alguien' })
    link = (await inviteCard.locator('code').innerText()).trim()
    expect(link).toContain('/invitacion/')

    await expect(page.getByText(inviteeEmail).first()).toBeVisible()
    await expect(page.getByText(/Pendiente · vence el/)).toBeVisible()
  })

  await test.step('can generate a fresh link without sending any mail', async () => {
    // El camino que importa cuando el correo no llega, que es silencioso: Resend
    // acepta un mensaje y la casilla lo archiva como spam, y desde acá las dos
    // cosas se ven igual. "Copiar enlace" no manda nada y rota el token, así que
    // el enlace anterior tiene que quedar muerto.
    const previous = link

    await page.getByRole('button', { name: 'Generar enlace' }).first().click()
    await expect(page.getByText(/No mandamos ningún correo/)).toBeVisible()

    // El de la lista, nombrado: el de arriba sigue mostrando el enlace anterior,
    // que este mismo click acaba de matar.
    const sentCard = page.getByRole('region', { name: 'Invitaciones enviadas' })
    link = (await sentCard.locator('code').innerText()).trim()
    expect(link).not.toBe(previous)
    await expect(sentCard.getByText(`Enlace para ${INVITEE}`)).toBeVisible()

    await page.goto(new URL(previous).pathname)
    await expect(
      page.getByRole('heading', { name: 'Esa invitación no funciona' }),
    ).toBeVisible()

    await page.goto('/invitaciones')
  })

  await test.step('the invitee opens it and chooses a password', async () => {
    // A different day, a different device: the link is opened by somebody who
    // has never had a session here.
    await page.context().clearCookies()

    await page.goto(new URL(link).pathname)

    await expect(page.getByRole('heading', { name: `Hola, ${INVITEE}` })).toBeVisible()
    await expect(page.getByText(inviteeEmail)).toBeVisible()

    await page.getByLabel('Elegí tu contraseña').fill(INVITEE_PASSWORD)
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Entrar a Ombúa' }).click()

    // The greeting uses the first name, which only exists if the M1 trigger
    // wrote the `practitioners` row from the invitation's metadata.
    await expect(page.getByRole('heading', { name: /Renata/ })).toBeVisible()
    await expect(page).toHaveURL(/\/inicio$/)
  })

  await test.step('the same link does not work a second time', async () => {
    await page.context().clearCookies()
    await page.goto(new URL(link).pathname)

    await expect(
      page.getByRole('heading', { name: 'Esa invitación no funciona' }),
    ).toBeVisible()
  })

  await test.step('being invited does not hand over the keys', async () => {
    // Whoever just walked in cannot invite anybody else. `is_admin` defaults to
    // false and is not writable through a session at all, so the panel is not
    // hidden from her — it does not exist.
    await page.goto('/entrar')
    await page.getByLabel('Email').fill(inviteeEmail)
    await page.getByLabel('Contraseña', { exact: true }).fill(INVITEE_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/inicio$/)

    // Ni el menú la ofrece ni la pantalla existe. Lo segundo es lo que protege;
    // lo primero es sólo no mentirle sobre lo que puede hacer.
    await expect(
      page.getByRole('link', { name: 'Invitaciones', exact: true }),
    ).toHaveCount(0)

    const response = await page.goto('/invitaciones')
    expect(response?.status()).toBe(404)
  })

  await test.step('and the admin sees that she came in', async () => {
    await page.context().clearCookies()
    await page.goto('/entrar')
    await page.getByLabel('Email').fill(adminEmail)
    await page.getByLabel('Contraseña', { exact: true }).fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    // Esperar el destino antes de navegar: un `goto` disparado mientras el
    // formulario todavía se está mandando cancela el envío, y la pantalla
    // siguiente contesta con una sesión que nunca llegó a existir.
    await expect(page).toHaveURL(/\/inicio$/)

    await page.goto('/invitaciones')
    await expect(page.getByText(/Entró el/)).toBeVisible()
  })
})
