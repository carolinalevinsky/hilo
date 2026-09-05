import { describe, expect, it } from 'vitest'

import { NewFormatRequest } from '@/server/format-requests'

/**
 * Qué se acepta como pedido de formato.
 *
 * Los límites están además en la base (`check (length(trim(detail)) between 5
 * and 500)`), y eso es a propósito: el de acá da el mensaje en castellano y el
 * de allá es el que no se puede saltear desde otra pantalla. Estos tests cuidan
 * el primero — que alguien que se equivoca lea algo que le sirva y no
 * "constraint violation".
 */

describe('el pedido de formato', () => {
  it('acepta una descripción común', () => {
    const result = NewFormatRequest.safeParse({
      detail: 'Uno para presentar en el juzgado, con el motivo de derivación.',
    })

    expect(result.success).toBe(true)
  })

  it('recorta los espacios de los costados', () => {
    const result = NewFormatRequest.safeParse({ detail: '   para el juzgado   ' })

    expect(result.success).toBe(true)
    expect(result.data?.detail).toBe('para el juzgado')
  })

  it('pide más contexto cuando es demasiado corto', () => {
    const result = NewFormatRequest.safeParse({ detail: 'sí' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Contanos un poco más: ¿para quién es el informe?',
    )
  })

  it('no acepta espacios en blanco como pedido', () => {
    // Cinco espacios pasan el largo mínimo si no se recorta primero. Se recorta.
    expect(NewFormatRequest.safeParse({ detail: '     ' }).success).toBe(false)
  })

  it('corta a las 500, que es lo mismo que aguanta la base', () => {
    const result = NewFormatRequest.safeParse({ detail: 'a'.repeat(501) })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Es muy largo. Con dos o tres líneas alcanza.')
  })

  it('acepta exactamente 500', () => {
    expect(NewFormatRequest.safeParse({ detail: 'a'.repeat(500) }).success).toBe(true)
  })
})
