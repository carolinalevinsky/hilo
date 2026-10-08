import { expect, test } from '@playwright/test'

import { createConfirmedUser, deleteAuthUserByEmail, uniqueEmail } from './support/supabase'

/**
 * Preparar una sesión antes de darla, que es la otra mitad del producto.
 *
 * `critical-path.spec.ts` cubre lo que pasa *después* de atender — registrar la
 * sesión y sacar un informe. Planificación es lo de antes, y hasta acá no la
 * miraba nadie desde un navegador: las reglas están probadas contra Postgres en
 * `src/server/planner-writes.test.ts`, pero esas pruebas llaman funciones. No
 * saben si el botón "Agregar" manda el objetivo, ni si la nota llega al campo.
 *
 * El paso que justifica el archivo es el sexto. El bug que lo motivó lo reportó
 * Carolina así: *"fui a elegir otro material y volví, y no se me guardó el
 * progreso."* La nota previa sólo se escribía al apretar "Guardar nota", y ir a
 * mirar un material es una navegación, así que no se guardaba nunca. Se arregló
 * con autoguardado (`session-note.tsx`), y esta prueba hace exactamente ese
 * camino —escribir, irse al material, volver— para que no pueda volver en
 * silencio.
 *
 * Vuelve con `goto` y no con `goBack`: el historial del navegador podría
 * devolver la página de su propio caché y la prueba pasaría sin que la nota
 * hubiera llegado nunca a la base. Pidiéndola de nuevo, lo que se ve en el
 * campo salió de Postgres.
 *
 * Un solo test con `test.step` por pantalla, como el camino crítico: cada paso
 * necesita la fila que creó el anterior, y el informe de Playwright muestra en
 * cuál se cortó la historia.
 */

const PASSWORD = 'una-clave-de-prueba'
const PRACTITIONER = 'Lucía Bentancor'
const PATIENT = 'Malena Torres'
const GOAL = 'Discriminación auditiva de sílabas'
const ACTIVITY = 'Juego de la oca con sílabas'
const NOTE = 'Traer las tarjetas de la vez pasada, quedó enganchada con esas.'

const email = uniqueEmail('planificacion')

/**
 * Mañana, en Uruguay.
 *
 * La cita tiene que caer en el futuro para que el planificador la ofrezca, y el
 * día se calcula en la zona de la profesional y no en la del proceso que corre
 * la prueba: en CI son las mismas horas de la noche en las que "mañana" acá y
 * "mañana" en UTC son días distintos.
 */
function tomorrowInUruguay() {
  const todayThere = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Montevideo',
  }).format(new Date())
  const date = new Date(`${todayThere}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

test.afterAll(async () => {
  await deleteAuthUserByEmail(email)
})

test('prepara una sesión, y la nota sobrevive irse a mirar un material', async ({ page }) => {
  await test.step('entra', async () => {
    await createConfirmedUser({
      email,
      password: PASSWORD,
      fullName: PRACTITIONER,
      discipline: 'speech_therapy',
    })

    await page.goto('/entrar')
    await page.getByLabel('Correo electrónico').fill(email)
    await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Como en el camino crítico: la primera Server Action del servidor recién
    // arrancado paga además la conexión a Supabase, y con los cinco segundos de
    // siempre esta línea falla una vez cada tres por algo que no es el producto.
    await expect(page.getByRole('heading', { name: /Lucía/ })).toBeVisible({
      timeout: 20_000,
    })

    // El recorrido se abre solo en una cuenta nueva y su fondo se come los
    // clicks de todo lo que sigue.
    await page.getByRole('button', { name: 'Saltar' }).click()
  })

  await test.step('carga la paciente y le pone un objetivo', async () => {
    await page.goto('/pacientes/nuevo')
    await page.getByLabel('Nombre y apellido').fill(PATIENT)
    await page.getByLabel('Fecha de nacimiento').fill('2018-03-05')
    await page.getByLabel('Teléfono').fill('099 456 789')
    await page.getByLabel('Motivo de consulta').fill('Dificultades en la conciencia fonológica.')
    await page.getByRole('button', { name: 'Crear paciente' }).click()

    // La primera paciente es el paso 1 de "Primeros pasos": se vuelve a Inicio.
    // La ficha se abre desde la lista.
    await expect(page).toHaveURL(/\/inicio/)
    await page.goto('/pacientes')
    await page.getByRole('link', { name: new RegExp(PATIENT) }).click()
    await expect(page.getByRole('heading', { name: PATIENT })).toBeVisible()

    // Sin un objetivo activo el panel de Planificación muestra su estado vacío,
    // así que este objetivo es lo que hace que haya algo que planificar.
    await page.getByRole('button', { name: 'Nuevo objetivo' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('¿Qué querés lograr?').fill(GOAL)
    await dialog.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText(GOAL).first()).toBeVisible()
  })

  await test.step('agenda la sesión que va a preparar', async () => {
    await page.goto('/agenda')
    // Hay dos, y las dos son de verdad: la de la cabecera y la que ofrece el
    // aviso de "esta semana no tenés nada agendado". Va la de arriba.
    await page.getByRole('button', { name: 'Agendar sesión' }).first().click()

    const dialog = page.getByRole('dialog', { name: 'Agendar una sesión' })
    await dialog.getByLabel('Paciente').selectOption({ label: PATIENT })
    await dialog.getByLabel('Día').fill(tomorrowInUruguay())
    await dialog.getByRole('button', { name: 'Agendar', exact: true }).click()

    await expect(dialog).toBeHidden()
    // `toBeAttached` y no `toBeVisible`: la grilla de la semana dibuja la cita
    // en la franja de su hora, que puede quedar fuera de lo que se ve sin
    // desplazarse. Lo que este paso tiene que dejar probado es que la cita
    // existe; que se vea es cosa de la Agenda, y quien la mira de verdad es el
    // paso siguiente, donde Planificación la tiene que ofrecer sola.
    await expect(page.getByRole('link', { name: PATIENT }).first()).toBeAttached()
  })

  await test.step('arma el plan: el objetivo, un material y algo suyo', async () => {
    await page.goto('/planificacion')

    // La cita de mañana es la única próxima, así que la pantalla la elige sola.
    await expect(page.getByRole('heading', { name: PATIENT })).toBeVisible()

    // El objetivo entra solo — desde que el panel dejó de ofrecer materiales,
    // "Agregar" agrega el objetivo y nada más.
    await page.getByRole('button', { name: 'Agregar', exact: true }).click()
    // Lo primero que entra a un plan es el paso 2 de "Primeros pasos": se vuelve
    // a Inicio con el paso tachado, y el plan sigue acá.
    await expect(page).toHaveURL(/\/inicio/)
    await page.goto('/planificacion')
    // La chip que confirma es la misma que lo saca, y su nombre accesible lo dice.
    await expect(page.getByRole('button', { name: `Quitar del plan: ${GOAL}` })).toBeVisible()

    // Un material de la biblioteca compartida de fonoaudiología: la tira
    // siempre muestra algo, con o sin búsqueda.
    await page.getByRole('button', { name: 'Sumar', exact: true }).first().click()

    // Y una actividad propia, que además queda guardada como material privado.
    await page.getByLabel('Agregar una actividad tuya').fill(ACTIVITY)
    await page.getByRole('button', { name: 'Sumar al plan' }).click()
    await expect(page.getByText(ACTIVITY).first()).toBeVisible()
  })

  await test.step('escribe la nota, se va a mirar un material y vuelve', async () => {
    // El renglón arranca cerrado cuando no hay nota.
    await page.getByText('Nota previa para la sesión').click()
    await page.getByLabel('Nota previa para la sesión').fill(NOTE)

    // Esperar a que lo diga, y no un rato fijo: de paso prueba que el cartel
    // diga la verdad, que es la otra mitad del arreglo.
    //
    // `exact` no es adorno. Sin él, `getByText` busca subcadena y sin
    // distinguir mayúsculas, así que "Guardada" matcheaba "Queda guardada en tu
    // biblioteca personal…", el pie de la actividad propia, dos tarjetas más
    // allá. La línea pasaba con el autoguardado roto — comprobado rompiéndolo.
    await expect(page.getByText('Guardada', { exact: true })).toBeVisible()

    // Acá es donde se perdía. Irse a mirar una ficha es lo que hace cualquiera
    // en el medio de armar un plan.
    const material = page.locator('a[href^="/materiales/"]').first()
    await material.click()
    await expect(page).toHaveURL(/\/materiales\/[0-9a-f-]{36}$/)

    // Y volver pidiendo la página de nuevo, no del caché del navegador: lo que
    // aparezca en el campo vino de la base.
    await page.goto('/planificacion')
    await expect(page.getByLabel('Nota previa para la sesión')).toHaveValue(NOTE)

    // Lo del plan también sigue ahí: tres cosas, en el orden en que entraron.
    await expect(page.getByRole('button', { name: `Quitar del plan: ${GOAL}` })).toBeVisible()
    await expect(page.getByText(ACTIVITY).first()).toBeVisible()
  })

  await test.step('guarda la planificación y le ofrece arrancar', async () => {
    await page.getByRole('link', { name: 'Guardar planificación' }).click()

    await expect(page).toHaveURL(/\/planificacion\/proximas\?guardado=/)
    // El cartel usa el nombre de pila, como todo lo que le habla a la
    // profesional sobre su paciente.
    await expect(page.getByText(/Guardaste el plan de Malena/)).toBeVisible()

    // Un solo nombre para arrancar la sesión, acá y en la ficha de la paciente.
    await expect(page.getByRole('link', { name: 'Registrar esta sesión' }).first()).toBeVisible()
  })
})
