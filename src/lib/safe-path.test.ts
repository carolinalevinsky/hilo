import { describe, expect, it } from 'vitest'

import { backLink, internalPath } from './safe-path'

describe('internalPath', () => {
  it('keeps a path inside the app', () => {
    expect(internalPath('/pacientes', '/inicio')).toBe('/pacientes')
    expect(internalPath('/nueva-contrasena', '/inicio')).toBe('/nueva-contrasena')
  })

  it('keeps the query string, which is where `?paciente=` lives', () => {
    expect(internalPath('/informes/nuevo?paciente=abc', '/inicio')).toBe(
      '/informes/nuevo?paciente=abc',
    )
  })

  it('rejects a protocol-relative URL, which a browser reads as another host', () => {
    // The one that passes a naive startsWith('/') check.
    expect(internalPath('//ejemplo.com', '/inicio')).toBe('/inicio')
    expect(internalPath('//ejemplo.com/entrar', '/inicio')).toBe('/inicio')
  })

  it('rejects the backslash spellings of the same thing', () => {
    // These are why this function parses instead of checking prefixes. Every
    // one of them passed the old `startsWith('/') && !startsWith('//')`, and
    // every one of them resolves to another origin in a real browser: after the
    // first slash, a backslash sends the WHATWG parser into authority state.
    expect(internalPath('/\\ejemplo.com', '/inicio')).toBe('/inicio')
    expect(internalPath('/\\/ejemplo.com', '/inicio')).toBe('/inicio')
    expect(internalPath('/\\\\ejemplo.com', '/inicio')).toBe('/inicio')
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

  it('never returns anything a browser could read as another origin', () => {
    // The property, rather than a list of spellings — the list is what the
    // previous version was, and the list is what ran out. Whatever comes back
    // has to resolve to the same origin it was resolved against.
    const attempts = [
      '//ejemplo.com',
      '/\\ejemplo.com',
      '/\t/ejemplo.com',
      '/\n/ejemplo.com',
      '/\r/ejemplo.com',
      '/ /ejemplo.com',
      '/%2f%2fejemplo.com',
      '/\\\t/ejemplo.com',
      'https://ejemplo.com',
      '/pacientes',
      '/informes/nuevo?paciente=abc',
    ]

    for (const attempt of attempts) {
      const result = internalPath(attempt, '/inicio')
      const resolved = new URL(result, 'https://app.hilo.uy')
      expect(resolved.origin, `${JSON.stringify(attempt)} escaped the origin`).toBe(
        'https://app.hilo.uy',
      )
    }
  })
})

describe('backLink', () => {
  it('vuelve a la ficha cuando el documento se abrió desde ahí', () => {
    expect(backLink('/pacientes/abc-123', '/informes', 'Volver a informes')).toEqual({
      href: '/pacientes/abc-123',
      label: 'Volver a la ficha',
    })
  })

  it('cae en la lista cuando no vino de ningún lado', () => {
    expect(backLink(undefined, '/informes', 'Volver a informes')).toEqual({
      href: '/informes',
      label: 'Volver a informes',
    })
  })

  it('no se deja llevar afuera', () => {
    // El parámetro viene de la barra de direcciones y termina en un `href`: es
    // la forma exacta de un redirect abierto. Lo cubre `internalPath`; esto fija
    // que `backLink` no lo esquive.
    for (const hostile of [
      'https://evil.example/phishing',
      '//evil.example',
      'javascript:alert(1)',
      '/\\evil.example',
    ]) {
      expect(backLink(hostile, '/informes', 'Volver a informes').href).toBe('/informes')
    }
  })
})
