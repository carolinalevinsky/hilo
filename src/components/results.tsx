'use client'

import { cn } from '@/lib/utils'

/**
 * Lo que se está por reemplazar, atenuado.
 *
 * Cuando cambiás un filtro, React deja los resultados viejos en pantalla hasta
 * que llega la respuesta. Sin esto, esos resultados viejos se ven exactamente
 * igual que los nuevos y no hay forma de saber si el click hizo algo.
 *
 * `pointer-events-none` va con la opacidad: mientras la lista es la vieja, un
 * click en ella abriría algo que estás dejando de mirar.
 *
 * `aria-busy` es la misma información para quien usa lector de pantalla y no ve
 * la opacidad.
 */
export function Results({
  pending,
  children,
}: {
  pending: boolean
  children: React.ReactNode
}) {
  return (
    <div
      aria-busy={pending}
      className={cn(
        'transition-opacity duration-150',
        pending && 'pointer-events-none opacity-50',
      )}
    >
      {children}
    </div>
  )
}
