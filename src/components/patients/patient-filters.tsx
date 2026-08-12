'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { Input } from '@/components/ui/input'
import { AGE_GROUP_LABELS } from '@/lib/patient-labels'
import { cn } from '@/lib/utils'

/**
 * Search and filters, held in the URL rather than in component state.
 *
 * That is the whole design: the list stays a Server Component that reads
 * `searchParams` and queries the database, a filtered view can be bookmarked or
 * sent to yourself, and the back button does what it should. The only client
 * state here is the text in the box between keystrokes.
 */
export function PatientFilters({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState(params.get('q') ?? '')

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

      <div className="flex flex-wrap gap-1.5">
        <Chip active={ageGroup === 'all'} onClick={() => set('edad', 'all')}>
          Todos
        </Chip>
        {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
          <Chip key={value} active={ageGroup === value} onClick={() => set('edad', value)}>
            {label}
          </Chip>
        ))}

        <span className="mx-1 hidden w-px self-stretch bg-border sm:block" />

        <Chip active={scope === 'archived'} onClick={() => set('estado', scope === 'archived' ? 'active' : 'archived')}>
          Archivados
        </Chip>
      </div>

      <p className="text-[12.5px] text-muted-foreground">
        {total === 1 ? '1 paciente' : `${total} pacientes`}
      </p>
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
