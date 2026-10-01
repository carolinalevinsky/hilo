import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * La ruta del digest marca como enviado sólo lo que salió.
 *
 * Antes sellaba el lote entero después del loop, saliera o no cada mail: una
 * caída de Resend dejaba a cuarenta profesionales registradas como avisadas y
 * sin aviso hasta la quincena siguiente.
 */

const state = vi.hoisted(() => ({
  failing: new Set<string>(),
  stamped: [] as string[][],
}))

vi.mock('@/lib/env', () => ({
  env: { CRON_SECRET: 'secreto' },
  publicConfig: { NEXT_PUBLIC_APP_URL: 'https://ombua.test' },
}))

vi.mock('@/server/digest', () => ({
  DIGEST_BATCH_SIZE: 40,
  digestRecipients: async () =>
    ['lucia', 'martin', 'ana'].map((id) => ({
      practitionerId: id,
      email: `${id}@ombua.test`,
      summary: {},
    })),
  markDigestSent: async (ids: string[]) => {
    state.stamped.push(ids)
  },
}))

vi.mock('@/server/notifications', () => ({
  sendDigest: async ({ to }: { to: string }) => !state.failing.has(to),
}))

const { GET } = await import('./route')

function cron() {
  return GET(
    new Request('https://ombua.test/api/digest', {
      headers: { authorization: 'Bearer secreto' },
    }),
  )
}

beforeEach(() => {
  state.failing.clear()
  state.stamped = []
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('GET /api/digest', () => {
  it('sella sólo a quienes les llegó el mail', async () => {
    state.failing.add('martin@ombua.test')

    const response = await cron()

    expect(state.stamped).toEqual([['lucia', 'ana']])
    expect(await response.json()).toMatchObject({ considered: 3, sent: 2, failed: 1 })
  })

  it('con Resend caído no sella a nadie', async () => {
    for (const id of ['lucia', 'martin', 'ana']) state.failing.add(`${id}@ombua.test`)

    await cron()

    expect(state.stamped.flat()).toEqual([])
  })

  it('sin el secreto no manda nada', async () => {
    const response = await GET(new Request('https://ombua.test/api/digest'))

    expect(response.status).toBe(401)
    expect(state.stamped).toEqual([])
  })
})
