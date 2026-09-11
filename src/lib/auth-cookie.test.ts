import { describe, expect, it } from 'vitest'

import { withLifetime } from './auth-cookie'

const FOUR_HUNDRED_DAYS = 400 * 24 * 60 * 60

describe('withLifetime', () => {
  it('keeps the 400 days when the box was ticked', () => {
    const options = { path: '/', maxAge: FOUR_HUNDRED_DAYS }
    expect(withLifetime(options, false)).toEqual(options)
  })

  it('drops the expiry when the box was not ticked, so the browser deletes it on close', () => {
    const kept = withLifetime(
      { path: '/', httpOnly: true, maxAge: FOUR_HUNDRED_DAYS, expires: new Date(Date.now() + 1e9) },
      true,
    )
    expect(kept).toEqual({ path: '/', httpOnly: true })
  })

  // Signing out deletes the cookie by writing it with maxAge 0. Stripping that
  // would keep the session alive until the browser closes — the opposite of
  // what the button says.
  it('leaves a deletion alone', () => {
    const deletion = { path: '/', maxAge: 0 }
    expect(withLifetime(deletion, true)).toEqual(deletion)

    const expired = { path: '/', expires: new Date(0) }
    expect(withLifetime(expired, true)).toEqual(expired)
  })
})
