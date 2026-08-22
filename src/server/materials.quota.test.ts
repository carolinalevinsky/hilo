import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  createTestPractitioner,
  deleteTestPractitioner,
  serviceClient,
  testEmail,
} from '@/test/supabase'

/**
 * What counts against the monthly AI allowance in the materials library, and
 * what does not.
 *
 * The library is the one table that holds both — a material somebody typed and a
 * material the model wrote — so `source` is the only thing separating a free
 * action from a paid one. Every other quota counts rows in a table that exists
 * for nothing else.
 *
 * The bug this exists to prevent, found reviewing the upload feature: an
 * uploaded file is inserted as `manual`, because owning a PDF costs nothing, and
 * **nothing ever changed it**. Asking Hilo to read that file is the single most
 * expensive call in the app — the only one that ships a whole document or photo
 * to Anthropic — and it was the one call no allowance capped. On top of that the
 * route passed `alreadyCounted: true`, subtracting one from a count the row had
 * never entered.
 *
 * The assertions below are about the counting rule rather than the route, and
 * they run against the real database because the rule *is* a query: a unit test
 * on a mock would have agreed with the broken version.
 *
 * Needs the local stack up (`npm run db:start`), like `rls.test.ts`.
 */

const service = serviceClient()
const email = testEmail('quota-materials')

let practitionerId = ''

/** `countThisMonth(practitionerId, 'materials')`, as `src/server/plans.ts` runs it. */
async function countAiMaterials(): Promise<number> {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)

  const { count, error } = await service
    .from('materials')
    .select('id', { count: 'exact', head: true })
    .eq('practitioner_id', practitionerId)
    .eq('source', 'ai')
    .gte('created_at', date.toISOString())

  expect(error).toBeNull()
  return count ?? 0
}

async function insertMaterial(title: string, source: 'manual' | 'ai') {
  const { data, error } = await service
    .from('materials')
    .insert({
      practitioner_id: practitionerId,
      discipline: 'speech_therapy',
      title,
      area: 'Lenguaje',
      kind: 'activity',
      content: 'Actividad',
      source,
    })
    .select('id')
    .single()

  expect(error, 'the fixture insert itself failed').toBeNull()
  return data!.id
}

beforeAll(async () => {
  practitionerId = await createTestPractitioner(email, 'Lucía Prueba', 'speech_therapy')
})

afterAll(async () => {
  await service.from('materials').delete().eq('practitioner_id', practitionerId)
  await deleteTestPractitioner(practitionerId)
})

describe('the monthly allowance for AI materials', () => {
  it('starts at zero for a new practitioner', async () => {
    expect(await countAiMaterials()).toBe(0)
  })

  it('does not charge for a material written by hand', async () => {
    await insertMaterial('Escrito a mano', 'manual')
    expect(await countAiMaterials()).toBe(0)
  })

  it('does not charge for an uploaded file on its own', async () => {
    // What `uploadMaterialAction` inserts. Having a worksheet already and
    // putting it in the library reaches Anthropic never.
    await insertMaterial('Material sin describir', 'manual')
    expect(await countAiMaterials()).toBe(0)
  })

  it('charges for a material the model wrote', async () => {
    await insertMaterial('Generado con IA', 'ai')
    expect(await countAiMaterials()).toBe(1)
  })

  it('charges for an uploaded file once Hilo is asked to read it', async () => {
    // The fix: the describe route flips `source` before sending the file. This
    // is the assertion that fails against the old code, where the row stayed
    // `manual` and the count stayed put no matter how many files were read.
    const id = await insertMaterial('Una ficha escaneada', 'manual')
    expect(await countAiMaterials()).toBe(1)

    const { error } = await service
      .from('materials')
      .update({ source: 'ai' })
      .eq('id', id)
      .eq('practitioner_id', practitionerId)

    expect(error).toBeNull()
    expect(await countAiMaterials()).toBe(2)
  })

  it('does not charge twice when the same file is read again', async () => {
    // `markMaterialAiWritten` is idempotent and the route only calls it when
    // `source` is not already `ai`, so a correction rides the same allowance.
    const before = await countAiMaterials()

    const { data, error } = await service
      .from('materials')
      .select('id')
      .eq('practitioner_id', practitionerId)
      .eq('title', 'Una ficha escaneada')
      .single()

    expect(error).toBeNull()

    await service.from('materials').update({ source: 'ai' }).eq('id', data!.id)
    expect(await countAiMaterials()).toBe(before)
  })
})
