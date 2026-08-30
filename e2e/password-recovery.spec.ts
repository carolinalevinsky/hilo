import { expect, test } from '@playwright/test'

import { waitForEmail } from './support/mailpit'
import { deleteAuthUserByEmail, uniqueEmail } from './support/supabase'

/**
 * Forgetting the password, and getting back in.
 *
 * The second end-to-end test, and the reason it earns browser time next to the
 * critical path is that **nothing else in the repository can see this flow**. It
 * is four separate pieces — an email template rendered by GoTrue, a route
 * handler that turns a token into a session, a cookie that says the session came
 * from a link, and a form that writes the password — and every one of them can
 * be individually correct while the chain is broken. Until this test existed,
 * the app had no `/confirmar` route at all: the link in the email went to a page
 * that did not exist, and every unit test still passed.
 *
 * It is deliberately the whole chain in one story, for the same reason the
 * critical path is: the steps depend on each other, and what the report needs to
 * say is *which* link in the chain gave way.
 *
 * ─── What it also proves, quietly ──────────────────────────────────────────
 *
 * That the email is in Spanish and carries a token hash rather than a PKCE code
 * — the assertion on the subject line and on `token_hash` in the URL. A link
 * built the other way works when it is opened in the browser that asked for it
 * and fails on a phone, which is the harder failure to notice and the one that
 * matters, because the request is made on a laptop and the email is read on a
 * phone.
 */

const OLD_PASSWORD = 'la-clave-vieja'
const NEW_PASSWORD = 'la-clave-nueva'
const PRACTITIONER = 'Camila Rodríguez'

const email = uniqueEmail('recuperacion')

test.afterAll(async () => {
  await deleteAuthUserByEmail(email)
})

test('forgets the password, gets the email, sets a new one, and signs in with it', async ({
  page,
}) => {
  await test.step('creates the account that will forget its password', async () => {
    await page.goto('/crear-cuenta')

    await page.getByLabel('Nombre y apellido').fill(PRACTITIONER)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Contraseña', { exact: true }).fill(OLD_PASSWORD)
    await page.getByLabel('Tu profesión').selectOption('psychology')
    await page.getByRole('checkbox').check()

    await page.getByRole('button', { name: 'Crear cuenta' }).click()
    await expect(page).toHaveURL(/\/inicio$/)
  })

  await test.step('comes back another day, signed out, having forgotten it', async () => {
    // Clearing the cookies rather than signing out: what this is standing in for
    // is a different day on a different device, which is when someone actually
    // discovers they do not remember the password.
    await page.context().clearCookies()

    await page.goto('/entrar')
    await page.getByRole('link', { name: 'Olvidé mi contraseña' }).click()

    await expect(page).toHaveURL(/\/recuperar$/)
    await page.getByLabel('Email').fill(email)
    await page.getByRole('button', { name: 'Enviame el enlace' }).click()

    // The wording is careful on purpose — it says "si hay una cuenta", because
    // the server answers the same way for an address that has none.
    await expect(page.getByText('Revisá tu correo')).toBeVisible()
    await expect(page.getByText(/Si hay una cuenta/)).toBeVisible()
  })

  let link = ''

  await test.step('receives a Spanish email with a link that works anywhere', async () => {
    const mail = await waitForEmail(email)

    expect(mail.subject).toBe('Cambiá tu contraseña de Hilo')

    // The two things that make the link work when it is opened on a phone.
    expect(mail.link).toContain('/confirmar')
    expect(mail.link).toContain('token_hash=')
    expect(mail.link).toContain('type=recovery')

    // Supabase builds it from its own Site URL, which is port 3000 for the dev
    // server. The test runs a production build on 3100, so only the origin is
    // swapped — everything the route reads is left exactly as it arrived.
    link = mail.link.replace(/^https?:\/\/[^/]+/, '')
  })

  await test.step('opens the link and lands on the new-password screen', async () => {
    await page.goto(link)

    await expect(page).toHaveURL(/\/nueva-contrasena$/)
    await expect(page.getByRole('heading', { name: 'Poné tu contraseña nueva' })).toBeVisible()
  })

  await test.step('refuses two passwords that do not match', async () => {
    await page.getByLabel('Contraseña nueva').fill(NEW_PASSWORD)
    await page.getByLabel('Repetila').fill('otra-cosa-distinta')
    await page.getByRole('button', { name: 'Guardar contraseña' }).click()

    // `.first()` because Next renders its own `role="alert"` route announcer on
    // every page; the error strip is the one the practitioner reads.
    await expect(page.getByRole('alert').first()).toHaveText(
      'Las dos contraseñas no coinciden.',
    )
  })

  await test.step('accepts the new password and leaves them signed in', async () => {
    await page.getByLabel('Contraseña nueva').fill(NEW_PASSWORD)
    await page.getByLabel('Repetila').fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Guardar contraseña' }).click()

    await expect(page).toHaveURL(/\/inicio$/)
  })

  await test.step('will not let the same link be used twice', async () => {
    // The marker cookie is deleted when the password changes, so the screen is
    // closed even though the session is still perfectly valid. Without that,
    // every signed-in tab is a way to take an account over without knowing the
    // current password.
    await page.goto('/nueva-contrasena')
    await expect(page.getByRole('heading', { name: 'Ese enlace ya no sirve' })).toBeVisible()
  })

  await test.step('signs in with the new password', async () => {
    await page.context().clearCookies()

    await page.goto('/entrar')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Contraseña', { exact: true }).fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/inicio$/)
  })
})

test('says so, in Spanish, when a link has expired or been tampered with', async ({ page }) => {
  // A token that was never issued is indistinguishable from one that expired,
  // and both have to end somewhere a person can act on rather than on a stack
  // trace or a blank page.
  await page.goto('/confirmar?token_hash=no-es-un-token&type=recovery&next=/nueva-contrasena')

  await expect(page).toHaveURL(/\/entrar\?aviso=enlace-vencido$/)
  await expect(page.getByRole('alert').first()).toContainText('Ese enlace no funcionó')
})
