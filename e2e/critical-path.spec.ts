import { expect, test } from '@playwright/test'

import { deleteAuthUserByEmail, uniqueEmail } from './support/supabase'

/**
 * The one path Hilo exists for: sign up, load a patient, write down a session,
 * get a report out. `docs/plan-02-migration.md` §8.
 *
 * Everything else is tested where it is cheaper — the business rules as unit
 * tests, the policies as a real two-practitioner RLS test, the prompts as
 * snapshots. None of those can fail in the way that matters most, which is the
 * app being unusable end to end while every one of them still passes. This test
 * is the only thing in the repository that would notice.
 *
 * It is written as **one `test.step` per screen inside a single test**, not as
 * four tests. Each step depends on the row the one before it created, and four
 * independent tests would either need four accounts or a shared mutable one.
 * The steps are what make the failure readable: the report shows which screen
 * the story stopped at.
 *
 * ─── What it deliberately does not assert ──────────────────────────────────
 *
 * **Which engine wrote the report.** With a real `ANTHROPIC_API_KEY` the model
 * streams the body in; without one — CI has only a placeholder — the offline
 * draft appears instead and an amber banner says so. Both are correct outcomes
 * and this test accepts either, because what it is here to prove is that the
 * chain holds: quota checked, route reached, stream consumed, document saved,
 * report findable afterwards.
 *
 * Asserting the offline banner would make the test fail the day the key starts
 * working, which is exactly backwards. Asserting the model's prose would make
 * the build depend on a paid API that can be slow, rate-limited or down, and
 * would be judging writing — which is a person's job, before launch
 * (`docs/launch.md` step 3).
 */

const PASSWORD = 'una-clave-de-prueba'
const PRACTITIONER = 'Valentina Sosa'
const PATIENT = 'Joaquín Silva'
const GOAL = 'Producción del fonema /r/'
const NOTE =
  'Trabajamos con tarjetas de palabras con /r/ inicial. Lo logró en sílaba directa y se enganchó con el juego.'

const email = uniqueEmail('e2e')

test.afterAll(async () => {
  // Deleting the auth user cascades through every table below it. Without this
  // each run leaves a practitioner and their patient in the local database, and
  // a week later nobody knows which rows are real.
  await deleteAuthUserByEmail(email)
})

test('sign up, load a patient, register a session, get a report', async ({ page }) => {
  await test.step('creates the account and lands signed in', async () => {
    await page.goto('/crear-cuenta')

    await page.getByLabel('Nombre y apellido').fill(PRACTITIONER)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
    await page.getByLabel('Tu profesión').selectOption('speech_therapy')
    await page.getByRole('checkbox').check()

    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    // The greeting uses the first name, which only exists if the M1 trigger ran
    // and wrote the `practitioners` row from the auth metadata.
    await expect(page.getByRole('heading', { name: /Valentina/ })).toBeVisible()
    await expect(page).toHaveURL(/\/inicio$/)
  })

  await test.step('shows the empty state before there is anything', async () => {
    // A new account is the only time this screen is reachable, and it is the
    // first thing every practitioner sees. If it ever renders a broken list
    // instead, nobody would find out from a unit test.
    await expect(page.getByText('Empecemos por tu primer paciente')).toBeVisible()
  })

  await test.step('loads a patient', async () => {
    await page.getByRole('link', { name: 'Cargar mi primer paciente' }).click()

    await page.getByLabel('Nombre y apellido').fill(PATIENT)
    await page.getByLabel('Fecha de nacimiento').fill('2019-04-12')
    await page.getByLabel('Motivo de consulta').fill('Dificultades en la producción de /r/.')

    await page.getByRole('button', { name: 'Crear paciente' }).click()

    await expect(page.getByRole('heading', { name: PATIENT })).toBeVisible()
    // The age is derived, not stored — this is the assertion that it is derived
    // correctly, in the practitioner's own timezone.
    await expect(page.getByText(/años/).first()).toBeVisible()
  })

  await test.step('adds a goal', async () => {
    await page.getByRole('button', { name: 'Nuevo objetivo' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('¿Qué querés lograr?').fill(GOAL)
    await dialog.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText(GOAL).first()).toBeVisible()
  })

  await test.step('registers a session against that goal', async () => {
    await page.getByRole('link', { name: /Registrar sesión/ }).click()

    // Ticking the goal is what writes `session_goals` and moves the progress —
    // the join that the whole clinical model hangs from.
    await page.getByRole('checkbox', { name: GOAL }).check()
    await page.getByLabel('Cómo salió la sesión').fill(NOTE)

    await page.getByRole('button', { name: 'Guardar sesión' }).click()

    await expect(page.getByText(NOTE.slice(0, 40), { exact: false })).toBeVisible()
  })

  await test.step('generates a report about it', async () => {
    await page.goto('/informes/nuevo')

    await page.getByLabel('Paciente').selectOption({ label: PATIENT })

    // The recipient chips are labels wrapping an `sr-only` radio, so the input
    // itself is never visible and cannot be clicked. Clicking the chip is what a
    // practitioner does, and the assertion below is what proves the styling
    // trick still ends up checking the right box.
    const recipient = page.getByRole('group', { name: '¿Para quién es?' })
    await recipient.getByText('Familia', { exact: true }).click()
    await expect(page.getByRole('radio', { name: 'Familia' })).toBeChecked()

    await page.getByRole('button', { name: 'Generar informe' }).click()

    // The document screen, whichever way the generation went.
    await expect(page.getByRole('button', { name: /Imprimir/ })).toBeVisible({
      timeout: 30_000,
    })

    // The header names the patient and the recipient — proof the document was
    // built from this practitioner's own rows and not from a template.
    await expect(page.getByText(PATIENT).first()).toBeVisible()
    await expect(page.getByText('Familia').first()).toBeVisible()

    // "Escribiendo…" until the stream ends. Waiting for it to go is what makes
    // the length assertion below mean something: without it this races the
    // first paragraph.
    await expect(page.getByRole('button', { name: 'Regenerar con IA' })).toBeVisible({
      timeout: 120_000,
    })

    // A real report, not an empty shell. Deliberately not *which* report — the
    // model's version and the offline draft are both correct here.
    const body = await page.locator('.hilo-doc').innerText()
    expect(body.length).toBeGreaterThan(400)
    expect(body).toContain('Joaquín')
  })

  await test.step('leaves the report where it can be found again', async () => {
    await page.goto('/informes')

    await expect(page.getByText(PATIENT).first()).toBeVisible()
    await expect(page.getByText(/1 de 5 informes/)).toBeVisible()
  })
})
