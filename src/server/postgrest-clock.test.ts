import { describe, expect, it, vi } from 'vitest'

import { fetchSurvivingStaleClock } from './postgrest-clock'

const issuedAtFuture = () =>
  new Response(
    JSON.stringify({ code: 'PGRST303', details: null, hint: null, message: 'JWT issued at future' }),
    { status: 401 },
  )

const ok = () => new Response('[]', { status: 200 })

const noWait = () => Promise.resolve()

describe('fetchSurvivingStaleClock', () => {
  it('passes a normal answer straight through', async () => {
    const inner = vi.fn(async () => ok())
    const fetch = fetchSurvivingStaleClock(inner, [1, 1], noWait)

    const response = await fetch('http://rest/patients')

    expect(response.status).toBe(200)
    expect(inner).toHaveBeenCalledTimes(1)
  })

  it('sends the same request again when the token looked issued in the future', async () => {
    const inner = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(issuedAtFuture())
      .mockResolvedValueOnce(issuedAtFuture())
      .mockResolvedValueOnce(ok())
    const fetch = fetchSurvivingStaleClock(inner, [1, 1, 1], noWait)
    const init = { method: 'POST', body: '{"full_name":"Ana"}' }

    const response = await fetch('http://rest/patients', init)

    expect(response.status).toBe(200)
    expect(inner).toHaveBeenCalledTimes(3)
    expect(inner).toHaveBeenLastCalledWith('http://rest/patients', init)
  })

  it('gives up after the last wait and returns the refusal', async () => {
    const inner = vi.fn(async () => issuedAtFuture())
    const fetch = fetchSurvivingStaleClock(inner, [1, 1], noWait)

    const response = await fetch('http://rest/patients')

    expect(response.status).toBe(401)
    expect(inner).toHaveBeenCalledTimes(3)
  })

  it('does not retry any other 401, and leaves its body readable', async () => {
    const expired = new Response(JSON.stringify({ code: 'PGRST301', message: 'JWT expired' }), {
      status: 401,
    })
    const inner = vi.fn(async () => expired)
    const fetch = fetchSurvivingStaleClock(inner, [1, 1], noWait)

    const response = await fetch('http://rest/patients')

    expect(inner).toHaveBeenCalledTimes(1)
    expect(await response.json()).toMatchObject({ code: 'PGRST301' })
  })
})
