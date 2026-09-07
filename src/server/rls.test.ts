import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { TablesUpdate } from '@/lib/database.types'
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
 * The RLS isolation test. **This one is non-negotiable.**
 *
 * Every other check in this project verifies that RLS is *configured*:
 * `check:rls` asserts each table has it switched on with at least one policy.
 * That is a claim. This is the fact — two real practitioners, two real sessions,
 * and an assertion that one cannot reach the other's rows.
 *
 * The distinction matters because the data is clinical and protected by Ley
 * N.º 18.331. A policy that is enabled but subtly wrong (`using (true)` while
 * someone was debugging) passes every other check in the repository and passes
 * nothing here.
 *
 * **Every new table gets a case in `the clinical tables` below.** A table that
 * holds patient data and is not listed here is protected by a policy nobody has
 * ever watched work.
 *
 * Runs against the local stack, so `npm run db:start` must be up. In CI that is
 * the `npx supabase start` step.
 */

const service = serviceClient()

const emailA = testEmail('rls-a')
const emailB = testEmail('rls-b')

let idA = ''
let idB = ''
let asA: Db
let patientB = ''
let goalB = ''
let sessionB = ''

beforeAll(async () => {
  idA = await createTestPractitioner(emailA, 'Ana Prueba', 'psychopedagogy')
  idB = await createTestPractitioner(emailB, 'Bruno Prueba', 'speech_therapy')
  asA = await signedInAs(emailA)

  // A full clinical record belonging to B, for A to fail to reach.
  const { data: patient } = await service
    .from('patients')
    .insert({ practitioner_id: idB, full_name: 'Paciente de Bruno' })
    .select()
    .single()
  patientB = patient!.id

  const { data: goal } = await service
    .from('goals')
    .insert({
      practitioner_id: idB,
      patient_id: patientB,
      title: 'Objetivo de Bruno',
      progress: 30,
    })
    .select()
    .single()
  goalB = goal!.id

  const { data: session } = await service
    .from('sessions')
    .insert({
      practitioner_id: idB,
      patient_id: patientB,
      progress_note: 'Nota clínica de Bruno',
    })
    .select()
    .single()
  sessionB = session!.id

  await service
    .from('session_goals')
    .insert({ practitioner_id: idB, session_id: sessionB, goal_id: goalB })

  await service.from('schedules').insert({
    practitioner_id: idB,
    patient_id: patientB,
    weekday: 1,
    start_time: '09:00',
  })

  await service.from('appointments').insert({
    practitioner_id: idB,
    patient_id: patientB,
    scheduled_on: '2026-08-17',
    start_time: '09:00',
  })

  await service.from('assessments').insert({
    practitioner_id: idB,
    patient_id: patientB,
    instrument: 'WISC-V (inteligencia)',
    analysis: 'Interpretación clínica de Bruno',
  })

  await service.from('assistant_questions').insert({ practitioner_id: idB })

  await service.from('session_plan_items').insert({
    practitioner_id: idB,
    patient_id: patientB,
    title: 'Lo que Bruno planificó para la próxima',
  })

  await service.from('reports').insert({
    practitioner_id: idB,
    patient_id: patientB,
    recipient: 'family',
    title: 'Informe de avance',
    content: 'Cuerpo del informe de Bruno',
  })

  // The three that had no fixture, and therefore no case below, and therefore
  // policies nobody had ever watched work. They are asserted rather than fired
  // and forgotten: an insert that quietly failed would make the read cases pass
  // because the table is empty, not because RLS filtered — which is a green
  // test that proves nothing. Same reasoning as the storage fixtures further
  // down, and the same trap.
  const { error: latecomers } = await service.from('payments').insert({
    practitioner_id: idB,
    patient_id: patientB,
    period: '2026-08',
    amount: 1500,
  })
  expect(latecomers, 'the payments fixture itself failed').toBeNull()

  const { error: bookingError } = await service.from('booking_requests').insert({
    practitioner_id: idB,
    name: 'Familia que le escribió a Bruno',
    phone: '099 000 000',
  })
  expect(bookingError, 'the booking_requests fixture itself failed').toBeNull()

  const { error: formatError } = await service.from('format_requests').insert({
    practitioner_id: idB,
    detail: 'Uno para presentar en el juzgado, con el motivo de derivación.',
  })
  expect(formatError, 'the format_requests fixture itself failed').toBeNull()
}, 60_000)

afterAll(async () => {
  await deleteTestPractitioner(idA)
  await deleteTestPractitioner(idB)
})

describe('the sign-up trigger', () => {
  it('creates the practitioner row, with a slug', async () => {
    const { data, error } = await service
      .from('practitioners')
      .select('*')
      .eq('id', idA)
      .single()

    expect(error).toBeNull()
    expect(data?.full_name).toBe('Ana Prueba')
    expect(data?.discipline).toBe('psychopedagogy')
    expect(data?.plan).toBe('free')
    // "Ana Prueba" → "ana-prueba". The public booking link is built from this,
    // so it must never contain an accent, a space, or the practitioner's UUID.
    expect(data?.slug).toMatch(/^ana-prueba(-\d+)?$/)
  })
})

describe('row level security on practitioners', () => {
  it('lets a practitioner read their own row', async () => {
    const { data, error } = await asA.from('practitioners').select('*').eq('id', idA)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('does not let a practitioner read another one, even by id', async () => {
    const { data, error } = await asA.from('practitioners').select('*').eq('id', idB)

    // RLS filters rather than rejects: the query succeeds and returns nothing.
    // That is the correct shape — an error would confirm the row exists.
    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('does not leak another practitioner through an unfiltered select', async () => {
    const { data, error } = await asA.from('practitioners').select('id')

    expect(error).toBeNull()
    expect(data?.map((row) => row.id)).toEqual([idA])
  })

  /**
   * The half this block did not watch, and the gap an audit walked through.
   *
   * Every test above asks whether A can reach B's row. None of them asked what A
   * may write **in her own** — and the own-rows policy has no opinion on that:
   * `using (id = auth.uid())` decides which row, never which column. The column
   * privilege came from the table-level grant in M1, so it covered `plan`, and a
   * PATCH to PostgREST with the anon key that ships in every bundle turned a
   * free account into a Pro one.
   *
   * Note the shape: a refused **privilege** is an error, where a refused row is
   * an empty result. Same distinction the `mp_accounts` block below relies on.
   */
  const refusedUpdate = async (patch: TablesUpdate<'practitioners'>) => {
    const { error } = await asA.from('practitioners').update(patch).eq('id', idA)
    return error
  }

  it('does not let a practitioner rewrite the columns the server owns', async () => {
    expect(await refusedUpdate({ plan: 'pro' }), 'plan').not.toBeNull()
    expect(await refusedUpdate({ slug: 'ana-elegida-a-mano' }), 'slug').not.toBeNull()
    expect(await refusedUpdate({ email: 'otra@ejemplo.test' }), 'email').not.toBeNull()
    expect(await refusedUpdate({ digest_sent_at: null }), 'digest_sent_at').not.toBeNull()

    const { data } = await service
      .from('practitioners')
      .select('plan, slug, email')
      .eq('id', idA)
      .single()

    expect(data?.plan).toBe('free')
    expect(data?.slug).toMatch(/^ana-prueba(-\d+)?$/)
    expect(data?.email).toBe(emailA)
  })

  it('still lets her write every column the app writes', async () => {
    // The other direction, and it caught a real one: the first version of the
    // column grants left `onboarded_at` out, because it was written against a
    // branch where nothing wrote that column yet. Tightening too far does not
    // fail at deploy — `app-tour.tsx` calls its action with `.catch(() => {})`,
    // so the guided tour would simply have replayed on every load, forever,
    // with nothing anywhere to say why.
    //
    // So this list is not "some fields": it is every column any function in
    // `src/server/practitioners.ts` writes through the user's session, and it
    // has to stay that way.
    const { error } = await asA
      .from('practitioners')
      .update({
        full_name: 'Ana Prueba',
        discipline: 'psychopedagogy',
        phone: '099 111 222',
        calendar_privacy: 'initials',
        onboarded_at: new Date().toISOString(),
      })
      .eq('id', idA)

    expect(error).toBeNull()
  })

  it('does not let a practitioner write to another one', async () => {
    const { data, error } = await asA
      .from('practitioners')
      .update({ full_name: 'Secuestrado' })
      .eq('id', idB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)

    const { data: victim } = await service
      .from('practitioners')
      .select('full_name')
      .eq('id', idB)
      .single()
    expect(victim?.full_name).toBe('Bruno Prueba')
  })
})

describe('the clinical tables', () => {
  it('return nothing from another practitioner, on an unfiltered read', async () => {
    for (const table of [
      'patients',
      'goals',
      'goal_progress',
      'sessions',
      'session_goals',
      'schedules',
      'appointments',
      'assessments',
      'reports',
      // The prepared next session. It names a patient and quotes their goals,
      // so it is as clinical as the goals themselves.
      'session_plan_items',
      // Holds no clinical text — only a timestamp, so the assistant's monthly
      // quota has something to count — but it is still one practitioner's
      // activity, and it gets the same case as everything else.
      'assistant_questions',
      // What a family owes and has paid, per patient, per month. Not a clinical
      // note, and still nobody else's business.
      'payments',
      // The phone number of a family that filled in a public form asking to be
      // contacted. They gave it to one practitioner.
      'booking_requests',
      // The newest table in the schema, and the one this list existed to catch:
      // its own test file only checks the Zod schema, so until this line the
      // policy had never been watched from the outside.
      'format_requests',
    ] as const) {
      const { data, error } = await asA.from(table).select('practitioner_id')
      expect(error, `${table} should read cleanly`).toBeNull()
      expect(data, `${table} leaked rows to the wrong practitioner`).toEqual([])
    }
  })

  it('refuse a write aimed at another practitioner', async () => {
    const { data, error } = await asA
      .from('patients')
      .update({ full_name: 'Renombrado' })
      .eq('id', patientB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('refuse a row stamped with another practitioner_id', async () => {
    // The `with check` half of the policy. Without it a practitioner could
    // insert rows *into* someone else's record — invisible to them, and signed
    // with their name.
    //
    // Four tables rather than one, because the consequence is different in each
    // and none of them is theoretical: a patient nobody added, a payment against
    // a family that never paid, a booking request in an inbox that answers real
    // families, and a format request that arrives at OWNER_EMAIL under somebody
    // else's name and discipline.
    const planted = await asA
      .from('patients')
      .insert({ practitioner_id: idB, full_name: 'Paciente plantado' })
    expect(planted.error, 'patients').not.toBeNull()

    const payment = await asA
      .from('payments')
      .insert({ practitioner_id: idB, patient_id: patientB, period: '2026-08', amount: 1 })
    expect(payment.error, 'payments').not.toBeNull()

    const booking = await asA
      .from('booking_requests')
      .insert({ practitioner_id: idB, name: 'Reserva plantada', phone: '099 111 222' })
    expect(booking.error, 'booking_requests').not.toBeNull()

    const format = await asA
      .from('format_requests')
      .insert({ practitioner_id: idB, detail: 'Pedido plantado en la cuenta de Bruno.' })
    expect(format.error, 'format_requests').not.toBeNull()
  })
})

describe('a child row pointing at somebody else’s patient', () => {
  /**
   * El hueco entre las dos defensas que había, y por qué se cerró en el esquema.
   *
   * La política de filas propias mira `practitioner_id`; la clave foránea mira
   * que el paciente exista. Una fila con el `practitioner_id` de A y el
   * `patient_id` de B pasaba las dos, y siete Server Actions escriben ese
   * `patient_id` tal como llega del formulario.
   *
   * No filtraba nada —el lado de la lectura lo tapa RLS— pero ensucia
   * estadísticas y cobros, y dependía de que nadie llamara esas lecturas con la
   * clave de servicio. Ahora lo dice la base.
   */
  it('is refused by the database, not just by the policy', async () => {
    const { error } = await service.from('sessions').insert({
      practitioner_id: idA,
      patient_id: patientB,
      progress_note: 'La sesión de Ana sobre el paciente de Bruno',
    })

    // Con la clave de servicio, que saltea RLS por completo: lo que rechaza acá
    // es la restricción, y ése es justamente el punto.
    expect(error).not.toBeNull()
    expect(error?.message ?? '').toContain('same_practitioner')
  })

  it('still lets a practitioner write about her own patient', async () => {
    const { data: own } = await service
      .from('patients')
      .insert({ practitioner_id: idA, full_name: 'Paciente de Ana' })
      .select()
      .single()

    const { error } = await service
      .from('sessions')
      .insert({ practitioner_id: idA, patient_id: own!.id })

    expect(error).toBeNull()
  })
})

describe('the materials library', () => {
  // `materials` is the only table in the schema whose policies are not the
  // standard one-liner, so it cannot ride along in `the clinical tables` above:
  // an unfiltered read correctly returns every row Hilo ships. The split is read
  // shared-or-own, write own-only, and both halves need watching — one of them
  // guards clinical privacy, the other guards everyone else's library.

  let materialB = ''
  let sharedMaterial = ''

  beforeAll(async () => {
    const { data: own } = await service
      .from('materials')
      .insert({
        practitioner_id: idB,
        title: 'Secuencias temporales de Bruno',
        area: 'Lenguaje',
        content: 'Actividad escrita por Bruno',
      })
      .select()
      .single()
    materialB = own!.id

    const { data: shared } = await service
      .from('materials')
      .insert({
        practitioner_id: null,
        title: 'Juego de rimas de la biblioteca de Hilo',
        area: 'Lectura',
        content: 'Actividad que viene con Hilo',
      })
      .select()
      .single()
    sharedMaterial = shared!.id
  })

  afterAll(async () => {
    // A row with a NULL practitioner_id belongs to nobody, so deleting the test
    // practitioners does not cascade to it. Left behind, it accumulates in every
    // later run of the suite and in anyone's local library.
    await service.from('materials').delete().eq('id', sharedMaterial)
  })

  it('does not show a practitioner what another one wrote', async () => {
    const { data, error } = await asA.from('materials').select('id')

    expect(error).toBeNull()
    expect(data?.map((row) => row.id)).not.toContain(materialB)
  })

  it('does show a practitioner the materials that ship with Hilo', async () => {
    const { data, error } = await asA.from('materials').select('id')

    // The half that would break silently if someone "simplified" the read policy
    // into the one-liner every other table uses: no error, no leak, and an empty
    // library on every screen.
    expect(error).toBeNull()
    expect(data?.map((row) => row.id)).toContain(sharedMaterial)
  })

  it('does not let a practitioner publish a material to everyone', async () => {
    // The `with check` on `write_own`. A NULL practitioner_id means "shipped with
    // Hilo", so without this any user could plant a row in every other
    // practitioner's library.
    const { error } = await asA.from('materials').insert({
      practitioner_id: null,
      title: 'Material colado en la biblioteca',
      area: 'Lectura',
      content: 'No debería existir',
    })

    expect(error).not.toBeNull()
  })

  it('does not let a practitioner sign a material with another practitioner_id', async () => {
    const { error } = await asA.from('materials').insert({
      practitioner_id: idB,
      title: 'Material plantado',
      area: 'Lectura',
      content: 'No debería existir',
    })

    expect(error).not.toBeNull()
  })

  it('does not let a practitioner edit a material belonging to another one', async () => {
    const { data, error } = await asA
      .from('materials')
      .update({ title: 'Reescrito' })
      .eq('id', materialB)
      .select()

    // Filtered, not rejected — same shape as every other table's update.
    expect(error).toBeNull()
    expect(data).toHaveLength(0)

    const { data: stored } = await service
      .from('materials')
      .select('title')
      .eq('id', materialB)
      .single()
    expect(stored?.title).toBe('Secuencias temporales de Bruno')
  })

  it('does not let a practitioner delete a material belonging to another one', async () => {
    const { data, error } = await asA
      .from('materials')
      .delete()
      .eq('id', materialB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)

    const { count } = await service
      .from('materials')
      .select('id', { count: 'exact', head: true })
      .eq('id', materialB)
    expect(count).toBe(1)
  })
})

describe('a material published to the community', () => {
  /**
   * The read policy is the one thing in the whole parity pass that widened who
   * can read what, so it gets its own block rather than a line in the one above.
   *
   * The rule being watched has two halves, and the second is the one that would
   * be easy to lose: publishing makes a row **readable** by everyone and does
   * not make it **writable** by anyone but its author. A "simplification" that
   * added `or visibility = 'public'` to `update_own` as well would pass
   * `check:rls`, pass the type checker, and hand every practitioner an edit
   * button on somebody else's work.
   */

  let publishedByB = ''
  let privateOfB = ''

  beforeAll(async () => {
    const { data: published } = await service
      .from('materials')
      .insert({
        practitioner_id: idB,
        title: 'Tarjetas de sílabas trabadas',
        area: 'Lectura',
        content: 'Actividad que Bruno publicó',
        visibility: 'public',
        author_name: 'Bruno Prueba',
      })
      .select()
      .single()
    publishedByB = published!.id

    const { data: kept } = await service
      .from('materials')
      .insert({
        practitioner_id: idB,
        title: 'Borrador que Bruno no publicó',
        area: 'Lectura',
        content: 'Actividad privada de Bruno',
        visibility: 'private',
      })
      .select()
      .single()
    privateOfB = kept!.id
  })

  it('is readable by another practitioner', async () => {
    const { data, error } = await asA.from('materials').select('id, author_name')

    expect(error).toBeNull()
    expect(data?.map((row) => row.id)).toContain(publishedByB)
  })

  it('does not drag the author’s unpublished materials along with it', async () => {
    // The failure worth fearing: a policy written as "public OR same author as
    // something public" rather than per row.
    const { data } = await asA.from('materials').select('id')

    expect(data?.map((row) => row.id)).not.toContain(privateOfB)
  })

  it('cannot be edited by the practitioner reading it', async () => {
    const { data, error } = await asA
      .from('materials')
      .update({ title: 'Reescrito por Ana' })
      .eq('id', publishedByB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)

    const { data: stored } = await service
      .from('materials')
      .select('title')
      .eq('id', publishedByB)
      .single()
    expect(stored?.title).toBe('Tarjetas de sílabas trabadas')
  })

  it('cannot be unpublished by the practitioner reading it', async () => {
    const { data, error } = await asA
      .from('materials')
      .update({ visibility: 'private' })
      .eq('id', publishedByB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('cannot be deleted by the practitioner reading it', async () => {
    const { data, error } = await asA
      .from('materials')
      .delete()
      .eq('id', publishedByB)
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(0)

    const { count } = await service
      .from('materials')
      .select('id', { count: 'exact', head: true })
      .eq('id', publishedByB)
    expect(count).toBe(1)
  })

  it('lets another practitioner read the file attached to it', async () => {
    // The half that is easy to get wrong: the row becomes readable and the file
    // does not, so the community library shows a title with a broken attachment
    // under it.
    //
    // The upload is asserted rather than assumed — a silent failure here would
    // make the real assertion below pass for the wrong reason.
    const { error: uploadError } = await service.storage
      .from('material-files')
      .upload(`${idB}/${publishedByB}`, new Uint8Array([37, 80, 68, 70]), {
        contentType: 'application/pdf',
        upsert: true,
      })
    expect(uploadError, 'the fixture upload itself failed').toBeNull()

    const { data, error } = await asA.storage
      .from('material-files')
      .createSignedUrl(`${idB}/${publishedByB}`, 60)

    expect(error).toBeNull()
    expect(data?.signedUrl).toBeTruthy()
  })

  it('does not let another practitioner read the file of an unpublished one', async () => {
    // The fixture is asserted first, and that is not ceremony: if the upload
    // quietly failed, "the URL is falsy" would pass because the object does not
    // exist rather than because the policy refused it.
    const { error: uploadError } = await service.storage
      .from('material-files')
      .upload(`${idB}/${privateOfB}`, new Uint8Array([37, 80, 68, 70]), {
        contentType: 'application/pdf',
        upsert: true,
      })
    expect(uploadError, 'the fixture upload itself failed').toBeNull()

    const { data } = await asA.storage
      .from('material-files')
      .createSignedUrl(`${idB}/${privateOfB}`, 60)

    expect(data?.signedUrl).toBeFalsy()
  })

  it('does not let another practitioner overwrite the file', async () => {
    // Publishing makes a file readable, not replaceable — the same rule as the
    // row. Without it, anyone could swap the PDF under somebody else's title.
    const { error } = await asA.storage
      .from('material-files')
      .upload(`${idB}/${publishedByB}`, new Uint8Array([88, 88]), {
        contentType: 'application/pdf',
        upsert: true,
      })

    expect(error).not.toBeNull()

    // And the original is still the original.
    const { data } = await service.storage
      .from('material-files')
      .download(`${idB}/${publishedByB}`)
    expect(await data?.text()).toBe('%PDF')
  })

  it('can be published by its own author', async () => {
    // The other direction: the policy must not have become so tight that
    // publishing your own work fails.
    const { data, error } = await asA
      .from('materials')
      .insert({
        practitioner_id: idA,
        title: 'Lo que Ana publica',
        area: 'Lectura',
        content: 'Actividad de Ana',
        visibility: 'public',
        author_name: 'Ana Prueba',
      })
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })
})

describe('the Mercado Pago access token', () => {
  // Defect #1. v1 read this credential straight from the browser
  // (legacy/index.html:2477) — a token that can move money, in a JavaScript
  // variable on a page. These two tests are the proof that it is now
  // structurally unreachable rather than carefully handled.

  beforeAll(async () => {
    await service
      .from('mp_accounts')
      .insert({ practitioner_id: idA, access_token: 'APP_USR-token-secretisimo' })
  })

  it('cannot be read by the practitioner it belongs to', async () => {
    const { data, error } = await asA.from('mp_accounts').select('*')

    // Either shape is a pass: `mp_accounts` has no grant and no permissive
    // policy, so the request is refused rather than filtered. What must never
    // happen is a row coming back.
    expect(data ?? []).toEqual([])
    if (!error) expect(data).toEqual([])
  })

  it('cannot be written by a practitioner either', async () => {
    const { error } = await asA
      .from('mp_accounts')
      .update({ access_token: 'reemplazado' })
      .eq('practitioner_id', idA)

    const { data: stored } = await service
      .from('mp_accounts')
      .select('access_token')
      .eq('practitioner_id', idA)
      .single()

    expect(stored?.access_token).toBe('APP_USR-token-secretisimo')
    expect(error ?? true).toBeTruthy()
  })
})

describe('el refresh token de Google', () => {
  // Vale más que el token de Mercado Pago. Aquél mueve plata y se puede
  // revocar rápido; éste no vence, y con él se lee y se escribe el calendario
  // entero de esa persona —el del consultorio y el de su vida— hasta que ella
  // se acuerde de sacarle el permiso a Hilo desde Google.
  //
  // Por eso la tabla usa `using (false)` en vez de la política de filas propias
  // que usa todo el resto: ninguna pantalla necesita este dato en el navegador,
  // así que no puede llegar. Estos dos tests son la diferencia entre haberlo
  // escrito y que sea verdad.

  beforeAll(async () => {
    await service.from('google_accounts').insert({
      practitioner_id: idA,
      google_email: 'lucia@gmail.com',
      refresh_token: '1//refresh-token-secretisimo',
    })
  })

  it('no lo puede leer ni la profesional a la que pertenece', async () => {
    const { data, error } = await asA.from('google_accounts').select('*')

    // Cualquiera de las dos formas pasa: la tabla no tiene grant ni política
    // permisiva, así que el pedido se rechaza en vez de filtrarse. Lo que nunca
    // puede pasar es que vuelva una fila.
    expect(data ?? []).toEqual([])
    if (!error) expect(data).toEqual([])
  })

  it('tampoco lo puede sobrescribir', async () => {
    const { error } = await asA
      .from('google_accounts')
      .update({ refresh_token: 'reemplazado' })
      .eq('practitioner_id', idA)

    const { data: stored } = await service
      .from('google_accounts')
      .select('refresh_token')
      .eq('practitioner_id', idA)
      .single()

    expect(stored?.refresh_token).toBe('1//refresh-token-secretisimo')
    expect(error ?? true).toBeTruthy()
  })
})

describe('practitioner_by_slug', () => {
  /**
   * The one `security definer` function the public surface leans on, and the
   * only thing standing between a stranger and the list of health professionals
   * who use Hilo.
   *
   * It is reached through the service role — the booking page has no session,
   * which is why the function exists at all — so nobody else needs EXECUTE. It
   * was nonetheless callable by `anon` with the key that ships in every bundle,
   * which turned a slug (generated from a name, so guessable) into a name, a
   * discipline and a UUID.
   *
   * Both cases matter and the second is the one that bites: the revoke has to
   * take EXECUTE away from PUBLIC, and `service_role` inherits from PUBLIC too.
   * Getting the first half right and the second half wrong is a booking page
   * that answers `permission denied` to every family.
   */
  it('cannot be called by a stranger holding the anon key', async () => {
    const { error } = await anonClient().rpc('practitioner_by_slug', {
      lookup_slug: 'ana-prueba',
    })

    expect(error).not.toBeNull()
  })

  it('cannot be called by a signed-in practitioner either', async () => {
    const { error } = await asA.rpc('practitioner_by_slug', {
      lookup_slug: 'ana-prueba',
    })

    expect(error).not.toBeNull()
  })

  it('still answers the booking page, which is what it is for', async () => {
    // Through the service role, exactly as `practitionerBySlug` does it.
    const { data, error } = await service.rpc('practitioner_by_slug', {
      lookup_slug: 'ana-prueba',
    })

    expect(error).toBeNull()
    expect(data?.[0]?.full_name).toBe('Ana Prueba')
  })
})

describe('the audit log', () => {
  it('can be read by its owner and not by anyone else', async () => {
    const { error: insertError } = await service.from('audit_log').insert([
      { practitioner_id: idA, action: 'create', entity: 'patient' },
      { practitioner_id: idB, action: 'create', entity: 'patient' },
    ])
    expect(insertError).toBeNull()

    const { data, error } = await asA.from('audit_log').select('practitioner_id')

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]?.practitioner_id).toBe(idA)
  })

  it('cannot be written by a practitioner, not even their own', async () => {
    // A log a user can write is not a log. There is no INSERT policy at all, so
    // this must fail — including for their own practitioner_id.
    const { error } = await asA
      .from('audit_log')
      .insert({ practitioner_id: idA, action: 'delete', entity: 'patient' })

    expect(error).not.toBeNull()
  })
})
