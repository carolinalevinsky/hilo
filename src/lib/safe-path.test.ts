import { describe, expect, it } from 'vitest'

import { internalPath } from './safe-path'

describe('internalPath', () => {
  it('keeps a path inside the app', () => {
    expect(internalPath('/pacientes', '/inicio')).toBe('/pacientes')
    expect(internalPath('/nueva-contrasena', '/inicio')).toBe('/nueva-contrasena')
  })

  it('rejects a protocol-relative URL, which a browser reads as another host', () => {
    // The one that passes a naive startsWith('/') check.
    expect(internalPath('//ejemplo.com', '/inicio')).toBe('/inicio')
    expect(internalPath('//ejemplo.com/entrar', '/inicio')).toBe('/inicio')
  })

  it('rejects an absolute URL', () => {
    expect(internalPath('https://ejemplo.com', '/inicio')).toBe('/inicio')
    expect(internalPath('javascript:alert(1)', '/inicio')).toBe('/inicio')
  })

  it('falls back when there is nothing usable', () => {
    expect(internalPath(null, '/inicio')).toBe('/inicio')
    expect(internalPath(undefined, '/inicio')).toBe('/inicio')
    expect(internalPath('', '/inicio')).toBe('/inicio')
    expect(internalPath('pacientes', '/inicio')).toBe('/inicio')
  })
})
