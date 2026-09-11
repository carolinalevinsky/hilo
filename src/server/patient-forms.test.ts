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
 * "Antes de empezar": what a stranger holding a link can and cannot do.
 *
 * Against Postgres de verdad, like `sessions.test.ts`, because most of the
 * promises are kept by the schema and not by this module — the hash, the
 * missing policies on `consents`, the `for update` that stops a double
 * signature. A test double has none of those.
 *
 * `holder.db` switches between the practitioner's session and the anonymous
 * client: the family's side runs with no session at all, exactly as the public
 * page does.
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

const { applyIntakeResponse, createIntakeLink, formByToken, submitIntake } = await import(
  './patient-forms'
)

const service = serviceClient()
const anon = anonClient()
const email = testEmail('antes-de-empezar')
const otherEmail = testEmail('antes-ajena')

let practitionerId = ''
let otherId = ''
let patientId = ''
let asPractitioner: Db
let asOther: Db

const signature = { signerName: 'Laura Pérez', signerRelationship: 'mother', accepted: 'on' }

const hash = (token: string) => createHash('sha256').update(token).digest('hex')

async function newLink() {
  holder.db = asPractitioner
  return createIntakeLink(practitionerId, patientId)
}

beforeAll(async () => {
  holder.service = service
  practitionerId = await createTestPractitioner(email, 'Valeria Sosa', 'psychology')
  otherId = await createTestPractitioner(otherEmail, 'Otra Profesional', 'psychology')
  asPractitioner = await signedInAs(email)
  asOther = await signedInAs(otherEmail)

  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Tomás Rivero', date_of_birth: '2016-05-03' })
    .select()
    .single()
  if (error) throw error
  patientId = data.id
})

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
  await deleteTestPractitioner(otherId)
})

describe('Antes de empezar', () => {
  it('stores the hash of the token, never the token', async () => {
    const token = await newLink()

    const { data } = await service
      .from('patient_forms')
      .select('token_hash, consent_text')
      .eq('token_hash', hash(token))
      .single()

    expect(data!.token_hash).not.toBe(token)
    expect(data!.token_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(data!.consent_text).toContain('Valeria Sosa')
    expect(data!.consent_text).toContain('Tomás Rivero')
  })

  it('shows a stranger the first name and the consent, and nothing else from the ficha', async () => {
    const token = await newLink()
    holder.db = anon

    const form = await formByToken(token)
    expect(form).toMatchObject({
      kind: 'intake',
      patientFirstName: 'Tomás',
      practitionerName: 'Valeria Sosa',
      state: 'open',
    })
    expect(JSON.stringify(form)).not.toContain('2016')

    expect(await formByToken('A'.repeat(43))).toBeNull()
    expect(await formByToken('no-es-un-token')).toBeNull()
  })

  it('does not let anon read the tables directly', async () => {
    for (const table of ['patient_forms', 'intake_responses', 'consents'] as const) {
      const { error } = await anon.from(table).select('id')
      expect(error, table).not.toBeNull()
    }
  })

  it('refuses a signature without "Leí y acepto"', async () => {
    const token = await newLink()
    holder.db = anon

    await expect(
      submitIntake(token, { signerName: 'Laura Pérez', signerRelationship: 'mother' }, null),
    ).rejects.toThrow()
  })

  it('retires an unanswered link when a new one is made', async () => {
    const first = await newLink()
    const second = await newLink()
    holder.db = anon

    expect((await formByToken(first))?.state).toBe('expired')
    expect(await submitIntake(first, signature, null)).toBe('expired')
    expect((await formByToken(second))?.state).toBe('open')
  })

  it('records the signature with the exact text of the link, and only once', async () => {
    const token = await newLink()
    holder.db = anon

    expect(
      await submitIntake(
        token,
        { ...signature, school: 'Escuela N.º 45', dateOfBirth: '2016-05-04' },
        'vitest',
      ),
    ).toBe('ok')
    expect(await submitIntake(token, signature, 'vitest')).toBe('submitted')

    const { data: link } = await service
      .from('patient_forms')
      .select('consent_text')
      .eq('token_hash', hash(token))
      .single()
    const { data: consents } = await service
      .from('consents')
      .select('consent_text, signer_name')
      .eq('patient_id', patientId)

    expect(consents).toHaveLength(1)
    expect(consents![0]!.consent_text).toBe(link!.consent_text)
    expect(consents![0]!.signer_name).toBe('Laura Pérez')

    const { data: patient } = await service
      .from('patients')
      .select('consent_signed_at')
      .eq('id', patientId)
      .single()
    expect(patient!.consent_signed_at).not.toBeNull()
  })

  it('keeps a consent out of reach of another practitioner, and unchangeable by its own', async () => {
    const { data: seenByOther } = await asOther
      .from('consents')
      .select('id')
      .eq('patient_id', patientId)
    expect(seenByOther).toEqual([])

    await asPractitioner.from('consents').update({ signer_name: 'Otra Firma' }).eq('patient_id', patientId)
    await asPractitioner.from('consents').delete().eq('patient_id', patientId)

    const { data: still } = await service
      .from('consents')
      .select('signer_name')
      .eq('patient_id', patientId)
    expect(still).toEqual([{ signer_name: 'Laura Pérez' }])
  })

  it('copies into the ficha only what is empty', async () => {
    const { data: response } = await service
      .from('intake_responses')
      .select('id')
      .eq('patient_id', patientId)
      .single()

    holder.db = asPractitioner
    const filled = await applyIntakeResponse(practitionerId, response!.id)

    expect(filled).toContain('school')
    expect(filled).not.toContain('date_of_birth')

    const { data: patient } = await service
      .from('patients')
      .select('date_of_birth, school')
      .eq('id', patientId)
      .single()
    expect(patient).toEqual({ date_of_birth: '2016-05-03', school: 'Escuela N.º 45' })

    // Twice is harmless: already reviewed, nothing more to copy.
    expect(await applyIntakeResponse(practitionerId, response!.id)).toEqual([])
  })
})
