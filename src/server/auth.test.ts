import { describe, expect, it } from 'vitest'

import { ConfirmationLink, NewPassword, PasswordResetRequest } from './auth'

/**
 * Boundary validation for the recovery flow.
 *
 * Same shape as the other schema tests: what matters is that nothing malformed
 * reaches Supabase. The link schema carries a second job — it is what lets the
 * `/confirmar` route handler avoid importing `@supabase/*` for its OTP type, so
 * the enum here is the only place that list of strings exists.
 */
describe('ConfirmationLink', () => {
  it('accepts the two links Hilo actually sends', () => {
    expect(ConfirmationLink.safeParse({ tokenHash: 'abc', type: 'signup' }).success).toBe(true)
    expect(ConfirmationLink.safeParse({ tokenHash: 'abc', type: 'recovery' }).success).toBe(
      true,
    )
  })

  it('rejects a type that is not a link type at all', () => {
    // `?type=` arrives from a URL, so it is whatever someone typed there.
    expect(ConfirmationLink.safeParse({ tokenHash: 'abc', type: 'admin' }).success).toBe(false)
    expect(ConfirmationLink.safeParse({ tokenHash: 'abc', type: null }).success).toBe(false)
  })

  it('rejects a missing token', () => {
    expect(ConfirmationLink.safeParse({ tokenHash: '', type: 'recovery' }).success).toBe(false)
  })
})

describe('PasswordResetRequest', () => {
  it('accepts an address', () => {
    expect(PasswordResetRequest.safeParse({ email: 'ana@ejemplo.uy' }).success).toBe(true)
  })

  it('rejects something that is not one', () => {
    expect(PasswordResetRequest.safeParse({ email: 'ana' }).success).toBe(false)
  })
})

describe('NewPassword', () => {
  it('accepts two matching passwords', () => {
    const result = NewPassword.safeParse({ password: 'seis-o-mas', confirmation: 'seis-o-mas' })
    expect(result.success).toBe(true)
  })

  it('rejects a mismatch, in Spanish', () => {
    // The message is rendered verbatim under the form, so it is part of the
    // contract rather than an implementation detail.
    const result = NewPassword.safeParse({ password: 'seis-o-mas', confirmation: 'otra-cosa' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Las dos contraseñas no coinciden.')
  })

  it('rejects a password shorter than the minimum Supabase is configured with', () => {
    expect(NewPassword.safeParse({ password: 'corta', confirmation: 'corta' }).success).toBe(
      false,
    )
  })
})
