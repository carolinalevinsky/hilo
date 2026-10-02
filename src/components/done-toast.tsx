'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { doneMessage } from '@/lib/done'
import type { FormState } from '@/lib/form-state'

/**
 * Muestra el `?hecho=` que dejó una acción al redirigir, y lo saca de la
 * dirección para que recargar no lo repita. Ver `src/lib/done.ts`.
 */
export function DoneToast() {
  const pathname = usePathname()
  const params = useSearchParams()
  const code = params.get('hecho')

  useEffect(() => {
    const message = doneMessage(code)
    if (!message) return
    toast.success(message)

    const url = new URL(window.location.href)
    url.searchParams.delete('hecho')
    window.history.replaceState(window.history.state, '', url)
  }, [pathname, code])

  return null
}

/**
 * Para los diálogos que se cierran al guardar: el diálogo se va y, sin esto,
 * con él cualquier señal de que funcionó. "Pago registrado." se devolvía y se
 * descartaba.
 */
export function useOkToast(state: FormState, fallback: string) {
  useEffect(() => {
    if (state.ok) toast.success(state.message ?? fallback)
  }, [state, fallback])
}
