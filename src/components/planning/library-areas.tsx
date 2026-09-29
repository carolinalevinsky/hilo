'use client'

import { useUrlState } from '@/components/use-url-state'
import { cn } from '@/lib/utils'

/**
 * Los filtros por área de la biblioteca, adentro del planificador.
 *
 * Las áreas son las de la profesión de quien mira (`areasFor`), no una lista
 * fija: una fonoaudióloga filtra por Articulación y una psicopedagoga por
 * Lectura, y ninguna de las dos tiene por qué ver la taxonomía de la otra.
 *
 * Sin el conteo al lado de cada una. El diseño lo mostraba —"Todos (140)"— y
 * para tenerlo habría que contar la biblioteca entera por área en cada carga
 * de la pantalla; el número no cambia lo que alguien elige.
 */
export function LibraryAreas({ areas }: { areas: string[] }) {
  const { params, set } = useUrlState()
  const active = params.get('area') ?? ''

  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
      <Chip label="Todos" active={active === ''} onClick={() => set({ area: '' })} />
      {areas.map((area) => (
        <Chip
          key={area}
          label={area}
          active={active === area}
          onClick={() => set({ area: active === area ? '' : area })}
        />
      ))}
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        // Los mismos que los de `/materiales`: es la misma biblioteca, y dos
        // juegos de chips distintos para lo mismo se leen como dos cosas.
        'shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
        active
          ? 'bg-violet text-white'
          : 'border border-border bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      {label}
    </button>
  )
}
