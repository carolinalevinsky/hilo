'use client'

import { Results } from '@/components/results'
import { useUrlState } from '@/components/use-url-state'
import { cn } from '@/lib/utils'

/**
 * Los filtros de la biblioteca, con los resultados adentro.
 *
 * Los resultados van como `children` —siguen siendo Server Components, se
 * renderizan en el servidor y pasan por acá sin volverse cliente— porque el
 * dato de "hay una búsqueda en curso" nace acá y se dibuja allá. Es la única
 * forma de que el chip se pinte y la lista se atenúe con el mismo dato.
 *
 * Antes eran `<Link>`. El único motivo para que un filtro sea un link es que
 * Next lo pueda precargar al pasar el mouse, y eso no pasaba: una pantalla que
 * lee `searchParams` es dinámica, y las dinámicas sólo se precargan hasta el
 * `loading.tsx` más cercano, que acá no existe. Eran links que no precargaban
 * nada y que además no avisaban que los habías tocado. Como botones se pintan
 * al instante y `aria-pressed` dice lo que son.
 */
export function MaterialFilters({
  areas,
  children,
}: {
  areas: string[]
  children: React.ReactNode
}) {
  const { params, set, pending } = useUrlState()

  const area = params.get('area') ?? ''
  const onlyMine = params.get('mios') === '1'
  const onlyCommunity = params.get('comunidad') === '1'

  // Los tres son excluyentes entre sí, como cuando eran links: cada uno armaba
  // su dirección desde cero. Lo que sí se conserva es `q`, porque ir acotando
  // una búsqueda con los filtros es exactamente para lo que están.
  function only(values: Record<string, string>) {
    set({ area: '', mios: '', comunidad: '', ...values })
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Chip active={!area && !onlyMine && !onlyCommunity} onClick={() => only({})}>
          Todos
        </Chip>
        {areas.map((name) => (
          <Chip key={name} active={area === name} onClick={() => only({ area: name })}>
            {name}
          </Chip>
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-border sm:block" />
        <Chip active={onlyMine} onClick={() => only({ mios: '1' })}>
          Los míos
        </Chip>
        <Chip active={onlyCommunity} onClick={() => only({ comunidad: '1' })}>
          De la comunidad
        </Chip>
      </div>

      <Results pending={pending}>{children}</Results>
    </>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
        active
          ? 'bg-violet text-white'
          : 'border border-border bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
