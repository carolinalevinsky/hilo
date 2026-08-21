'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useOptimistic, useTransition } from 'react'

/**
 * Los filtros que viven en la dirección, y que responden apenas los tocás.
 *
 * Guardar el estado en la URL es lo que deja que las pantallas con filtros
 * sigan siendo Server Components: se puede compartir el link, el botón de atrás
 * funciona, y recargar no borra lo que estabas mirando.
 *
 * `replace` y no `push`, a propósito: escribir en una caja de búsqueda no
 * debería dejar una entrada en el historial por cada letra.
 *
 * ─── Por qué devuelve `params` y no lo lee cada quien de `useSearchParams` ───
 *
 * Cambiar un filtro es una transición: React deja la pantalla vieja en su lugar
 * mientras el servidor contesta, en vez de vaciarla. Eso es lo correcto, pero
 * significa que `useSearchParams()` sigue devolviendo los valores viejos hasta
 * que la respuesta llega. Un chip que se pinta desde ahí no se pinta al tocarlo:
 * se pinta medio segundo después.
 *
 * Antes esta pantalla se sentía rota por eso. La transición estaba, pero nadie
 * miraba si había una en curso: el código decía `const [, startTransition]`, y
 * esa coma descarta justamente ese dato. Tocabas un chip y no se movía nada.
 *
 * `params` de acá es la dirección **como va a quedar**, no como está. Se pinta
 * en el mismo cuadro en que tocaste, y si el servidor contesta otra cosa, React
 * la corrige solo. `pending` es para atenuar los resultados mientras tanto: dice
 * "esto que ves abajo todavía es lo de antes".
 */
export function useUrlState() {
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()
  const [pending, startTransition] = useTransition()

  // Un string y no un `URLSearchParams`: el valor base tiene que ser estable
  // entre renders para que React sepa cuándo la dirección real alcanzó a la
  // optimista. Dos objetos con el mismo contenido no son el mismo objeto.
  const [query, showOptimistic] = useOptimistic(current.toString())
  const params = useMemo(() => new URLSearchParams(query), [query])

  /** Vacío borra el parámetro. Lo que no se nombra queda como estaba. */
  function set(values: Record<string, string>) {
    const next = new URLSearchParams(current)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }

    const nextQuery = next.toString()
    startTransition(() => {
      showOptimistic(nextQuery)
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    })
  }

  return { params, set, pending }
}
