'use client'

import { useEffect, useState } from 'react'

import { Search } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { useUrlState } from '@/components/use-url-state'

/**
 * La caja de buscar de la biblioteca, en las dos pantallas que la muestran.
 *
 * Vivía sólo dentro del planificador, que es la mitad donde se busca algo para
 * agregar a una sesión. La biblioteca en sí, que es donde alguien mira las
 * cincuenta de su profesión más lo que publicó la comunidad, tenía sólo los
 * filtros por área: para encontrar algo por su nombre había que ir a la otra
 * pestaña. Con 45 materiales se podía; con la biblioteca de ahora, no.
 */
export function MaterialSearch({ initial }: { initial: string }) {
  const { params, set } = useUrlState()
  const [value, setValue] = useState(initial)

  // Same 250ms as the patient list, and for the same reason: typing "fluidez"
  // should be one query, not seven.
  useEffect(() => {
    const current = params.get('q') ?? ''
    if (value === current) return

    const timer = setTimeout(() => set({ q: value }), 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ej: fluidez, sílabas, atención…"
        aria-label="Buscar en la biblioteca"
        className="pl-9"
      />
    </div>
  )
}
