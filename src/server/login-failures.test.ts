import { randomUUID } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { anonClient } from '@/test/supabase'

/**
 * Las funciones del límite de intentos, contra Postgres de verdad y con la
 * llave pública: es lo único que tiene quien está entrando. Lo que se prueba es
 * que cuenten bien y que la tabla no se pueda leer ni escribir por fuera de
 * ellas.
 */
describe('login_failures', () => {
  const db = anonClient()
  const key = () => randomUUID().replaceAll('-', '')

  it('deja intentar hasta cinco fallos de la misma cuenta, no seis', async () => {
    const account = key()
    const ip = key()

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data } = await db.rpc('login_allowed', { per_account: account, per_ip: ip })
      expect(data).toBe(true)
      await db.rpc('note_login_failure', { per_account: account, per_ip: ip })
    }

    const { data } = await db.rpc('login_allowed', { per_account: account, per_ip: ip })
    expect(data).toBe(false)

    await db.rpc('clear_login_failures', { per_account: account })
    const after = await db.rpc('login_allowed', { per_account: account, per_ip: ip })
    expect(after.data).toBe(true)
  })

  it('la tabla no se lee ni se escribe con la llave pública', async () => {
    const read = await db.from('login_failures').select('*')
    expect(read.data ?? []).toEqual([])

    const write = await db.from('login_failures').insert({ key_hash: key() })
    expect(write.error).not.toBeNull()
  })
})
