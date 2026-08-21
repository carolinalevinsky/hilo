'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

/**
 * Cambia parámetros de la URL sin recargar ni perder el lugar.
 *
 * Es lo que deja que las pantallas con filtros sigan siendo Server Components:
 * el estado vive en la dirección, así que se puede compartir el link, el botón
 * de atrás funciona, y recargar no borra lo que estabas mirando.
 *
 * `replace` y no `push`, a propósito: escribir en una caja de búsqueda no
 * debería dejar una entrada en el historial por cada letra.
 *
 * Vivía adentro de `plan-controls.tsx`. Salió acá cuando la biblioteca de
 * materiales necesitó la misma caja de búsqueda que el planificador, que es el
 * momento en que una función local pasa a ser compartida y no antes.
 */
export function useUrlParam() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  return function set(values: Record<string, string>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }

    const query = next.toString()
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    )
  }
}
