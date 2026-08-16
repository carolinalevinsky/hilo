'use client'

import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { Input } from '@/components/ui/input'
import { AGE_GROUP_LABELS, ageGroupLabel } from '@/lib/patient-labels'
import { cn } from '@/lib/utils'

/**
 * Search, filters, view and order — held in the URL rather than in component
 * state.
 *
 * That is the whole design: the list stays a Server Component that reads
 * `searchParams` and queries the database, a filtered view can be bookmarked or
 * sent to yourself, and the back button does what it should. The only client
 * state here is the text in the box between keystrokes, and whether the panel is
 * open.
 *
 * The panel is v1's (`legacy/index.html:1134-1140`): one row that says what is
 * currently applied — "Todos · Nombre A-Z" — and opens onto the controls. Six
 * chips and a select permanently above the list push the patients down a screen
 * on a phone, and they are read once a month.
 */

const SORT_LABELS: Record<string, string> = {
  nombre: 'Nombre A-Z',
  sesiones: 'Más sesiones',
  'avance-': 'Menos avance',
  'avance+': 'Más avance',
}

export function PatientFilters({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)

  // 250ms is long enough that typing a name is one query rather than eleven,
  // and short enough that it does not feel like waiting.
  useEffect(() => {
    const current = params.get('q') ?? ''
    if (search === current) return

    const timer = setTimeout(() => {
      startTransition(() => router.replace(withParam('q', search), { scroll: false }))
    }, 250)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function withParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    const query = next.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  function set(key: string, value: string) {
    startTransition(() => router.replace(withParam(key, value), { scroll: false }))
  }

  const ageGroup = params.get('edad') ?? 'all'
  const scope = params.get('estado') ?? 'active'
  const view = params.get('vista') === 'tarjetas' ? 'tarjetas' : 'lista'
  const sort = params.get('orden') ?? 'nombre'

  const summary = [
    scope === 'archived'
      ? 'Archivados'
      : ageGroup === 'all'
        ? 'Todos'
        : ageGroupLabel(ageGroup),
    SORT_LABELS[sort] ?? SORT_LABELS.nombre,
  ].join(' · ')

  return (
    <div className="mb-4 space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar pacientes"
          className="h-10 pl-9"
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13px] font-bold"
      >
        <span className="inline-flex items-center gap-2.5">
          <SlidersHorizontal className="size-[17px]" />
          Filtros y orden
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
          {summary}
          <ChevronDown className={cn('size-[18px] transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-border bg-card px-4 py-3.5">
          <Group label="Vista">
            <Chip active={view === 'lista'} onClick={() => set('vista', 'lista')}>
              Lista
            </Chip>
            <Chip active={view === 'tarjetas'} onClick={() => set('vista', 'tarjetas')}>
              Tarjetas
            </Chip>
          </Group>

          <Group label="Edad">
            <Chip
              active={scope !== 'archived' && ageGroup === 'all'}
              onClick={() => set('edad', 'all')}
            >
              Todos
            </Chip>
            {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
              <Chip
                key={value}
                active={scope !== 'archived' && ageGroup === value}
                onClick={() => set('edad', value)}
              >
                {label}
              </Chip>
            ))}
            <Chip
              active={scope === 'archived'}
              onClick={() => set('estado', scope === 'archived' ? 'active' : 'archived')}
            >
              Archivados
            </Chip>
          </Group>

          <Group label="Orden" className="sm:ml-auto">
            <select
              value={sort}
              onChange={(event) => set('orden', event.target.value)}
              aria-label="Ordenar pacientes"
              className="h-9 rounded-lg border border-input bg-background px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Group>
        </div>
      ) : null}

      <p className="text-[12.5px] text-muted-foreground">
        {total === 1 ? '1 paciente' : `${total} pacientes`}
      </p>
    </div>
  )
}

function Group({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-[12px] font-bold text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
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
          : 'bg-card text-muted-foreground hover:bg-muted border border-border',
      )}
    >
      {children}
    </button>
  )
}
