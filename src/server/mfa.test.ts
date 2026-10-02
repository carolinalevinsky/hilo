import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * La verificación en dos pasos, del lado del servidor. Lo que se prueba es el
 * criterio: cuándo una sesión necesita el código y qué se le dice a quien lo
 * escribe mal. Que la base no devuelva filas sin el código lo cubre la
 * migración `mfa_when_enrolled`, probada contra Postgres.
 */

const holder = vi.hoisted(() => ({
  level: { currentLevel: 'aal1', nextLevel: 'aal1' } as { currentLevel: string; nextLevel: string },
  verified: [] as { id: string }[],
  verifyError: null as unknown,
  verifiedWith: [] as { factorId: string; code: string }[],
}))

vi.mock('./db', () => ({
  getDb: async () => ({
    auth: {
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({ data: holder.level, error: null }),
        listFactors: async () => ({
          data: { totp: holder.verified, all: holder.verified },
          error: null,
        }),
        challengeAndVerify: async (args: { factorId: string; code: string }) => {
          holder.verifiedWith.push(args)
          return { data: {}, error: holder.verifyError }
        },
      },
    },
  }),
}))

const { needsSecondStep, verifySecondStep } = await import('./mfa')

beforeEach(() => {
  holder.verified = []
  holder.verifyError = null
  holder.verifiedWith = []
})

describe('needsSecondStep', () => {
  it('pide el código a una sesión que sólo pasó la contraseña de una cuenta con factor', async () => {
    holder.level = { currentLevel: 'aal1', nextLevel: 'aal2' }
    expect(await needsSecondStep()).toBe(true)
  })

  it('no lo pide a quien no la activó, ni a quien ya lo escribió', async () => {
    holder.level = { currentLevel: 'aal1', nextLevel: 'aal1' }
    expect(await needsSecondStep()).toBe(false)
    holder.level = { currentLevel: 'aal2', nextLevel: 'aal2' }
    expect(await needsSecondStep()).toBe(false)
  })
})

describe('verifySecondStep', () => {
  it('rechaza lo que no son seis números sin preguntarle a Supabase', async () => {
    holder.verified = [{ id: 'factor-1' }]

    expect(await verifySecondStep('12ab')).toEqual({
      ok: false,
      message: 'El código son 6 números. Fijate en la app.',
    })
    expect(holder.verifiedWith).toEqual([])
  })

  it('verifica contra el factor de la cuenta', async () => {
    holder.verified = [{ id: 'factor-1' }]

    expect(await verifySecondStep(' 123456 ')).toEqual({ ok: true })
    expect(holder.verifiedWith).toEqual([{ factorId: 'factor-1', code: '123456' }])
  })

  it('un código vencido o equivocado se dice, con la causa más común', async () => {
    holder.verified = [{ id: 'factor-1' }]
    holder.verifyError = { code: 'mfa_verification_failed' }

    const result = await verifySecondStep('000000')
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toContain('hora del teléfono')
  })
})
