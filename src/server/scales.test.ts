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
 * PHQ-9 and GAD-7 answered from a link, against the local Postgres.
 *
 * `scaleIsReady` is mocked to true: the real one stays false until a person
 * pastes the official wording (see `@/lib/scales`), and what is tested here —
 * the token, the total, the item-9 flag, who can change what — does not depend
 * on the words.
 */

const holder = vi.hoisted(() => ({ db: null as unknown, service: null as unknown }))

vi.mock('./db', () => ({
  getDb: async () => holder.db,
  getServiceDb: () => holder.service,
}))

vi.mock('@/lib/scales', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/scales')>()),
  scaleIsReady: () => true,
}))

const { createScaleLink, markScaleReviewed, submitScale } = await import('./scales')

const service = serviceClient()
const anon = anonClient()
const email = testEmail('escalas')
const otherEmail = testEmail('escalas-ajena')

let practitionerId = ''
let otherId = ''
let patientId = ''
let asPractitioner: Db
let asOther: Db

const hash = (token: string) => createHash('sha256').update(token).digest('hex')

/** item-0…item-n from a list of answers, as the form posts them. */
const posted = (answers: number[], extra: Record<string, string> = {}) => ({
  ...Object.fromEntries(answers.map((answer, index) => [`item-${index}`, String(answer)])),
  ...extra,
})

async function link(scale: 'phq9' | 'gad7') {
  holder.db = asPractitioner
  return createScaleLink(practitionerId, patientId, scale)
}

async function responseFor(token: string) {
  const { data: form } = await service
    .from('patient_forms')
    .select('id')
    .eq('token_hash', hash(token))
    .single()
  const { data } = await service.from('scale_responses').select('*').eq('form_id', form!.id).single()
  return data!
}

beforeAll(async () => {
  holder.service = service
  practitionerId = await createTestPractitioner(email, 'Valeria Escalas', 'psychology')
  otherId = await createTestPractitioner(otherEmail, 'Otra Escalas', 'psychology')
  asPractitioner = await signedInAs(email)
  asOther = await signedInAs(otherEmail)

  const { data, error } = await service
    .from('patients')
    .insert({ practitioner_id: practitionerId, full_name: 'Martina Díaz', age_group: 'adults' })
    .select()
    .single()
  if (error) throw error
  patientId = data.id
})

afterAll(async () => {
  await deleteTestPractitioner(practitionerId)
  await deleteTestPractitioner(otherId)
})

describe('escalas', () => {
  it('scores a PHQ-9 in the database, and answers once', async () => {
    const token = await link('phq9')
    holder.db = anon

    expect(await submitScale(token, posted([1, 2, 1, 3, 0, 1, 2, 0, 0], { difficulty: '1' }))).toBe('ok')
    expect(await submitScale(token, posted([0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('submitted')

    const row = await responseFor(token)
    expect(row.total).toBe(10)
    expect(row.answers).toEqual([1, 2, 1, 3, 0, 1, 2, 0, 0])
    expect(row.difficulty).toBe(1)
    expect(row.self_harm_flag).toBe(false)
  })

  it('flags item 9 whatever the total', async () => {
    const token = await link('phq9')
    holder.db = anon

    expect(await submitScale(token, posted([0, 0, 0, 0, 0, 0, 0, 0, 1]))).toBe('ok')

    const row = await responseFor(token)
    expect(row.total).toBe(1)
    expect(row.self_harm_flag).toBe(true)
  })

  it('never flags a GAD-7, which has no such item', async () => {
    const token = await link('gad7')
    holder.db = anon

    expect(await submitScale(token, posted([3, 3, 3, 3, 3, 3, 3]))).toBe('ok')
    const row = await responseFor(token)
    expect(row.total).toBe(21)
    expect(row.self_harm_flag).toBe(false)
  })

  it('refuses a questionnaire with an answer missing or out of range', async () => {
    const token = await link('gad7')
    holder.db = anon

    await expect(submitScale(token, posted([1, 1, 1, 1, 1, 1]))).rejects.toThrow()
    await expect(submitScale(token, posted([1, 1, 1, 1, 1, 1, 4]))).rejects.toThrow()
  })

  it('lets the practitioner mark it seen, and change nothing else', async () => {
    const token = await link('phq9')
    holder.db = anon
    await submitScale(token, posted([0, 0, 0, 0, 0, 0, 0, 0, 2]))
    const row = await responseFor(token)

    holder.db = asPractitioner
    await markScaleReviewed(practitionerId, row.id)

    const { error } = await asPractitioner.from('scale_responses').update({ total: 0 }).eq('id', row.id)
    expect(error).not.toBeNull()
    await asPractitioner.from('scale_responses').delete().eq('id', row.id)

    const after = await responseFor(token)
    expect(after.reviewed_at).not.toBeNull()
    expect(after.total).toBe(2)
  })

  it('keeps the answers out of reach of another practitioner and of anon', async () => {
    const { data: seenByOther } = await asOther
      .from('scale_responses')
      .select('id')
      .eq('patient_id', patientId)
    expect(seenByOther).toEqual([])

    const { error } = await anon.from('scale_responses').select('id')
    expect(error).not.toBeNull()
  })
})
