import { UserPlus, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { PatientFilters } from '@/components/patients/patient-filters'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { patientClasses, patientHex } from '@/lib/patient-colors'
import { ageGroupLabel } from '@/lib/patient-labels'
import { cn } from '@/lib/utils'
import { requireUser } from '@/server/auth'
import {
  listPatients,
  patientSummaries,
  type PatientListOptions,
} from '@/server/patients'

export const metadata: Metadata = { title: 'Pacientes · Hilo' }

function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

const sessionsLabel = (count: number) => (count === 1 ? '1 sesión' : `${count} sesiones`)

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default async function PatientsPage({ searchParams }: PageProps<'/pacientes'>) {
  const params = await searchParams
  const user = await requireUser()

  const scope = readParam(params.estado) === 'archived' ? 'archived' : 'active'
  const ageGroup = readParam(params.edad) as PatientListOptions['ageGroup']
  const search = readParam(params.q)
  const view = readParam(params.vista) === 'tarjetas' ? 'tarjetas' : 'lista'
  const sort = readParam(params.orden) ?? 'nombre'

  const found = await listPatients(user.id, { search, ageGroup, scope })
  const summaries = await patientSummaries(
    user.id,
    found.map((patient) => patient.id),
  )

  // Sorted here rather than in the query: two of the four orders are over
  // aggregates the database would have to join to produce, and a caseload is
  // tens of rows, not thousands. If it ever stops being tens, this becomes a
  // view — not a loop with a LIMIT.
  const patients = [...found].sort((a, b) => {
    const left = summaries.get(a.id)
    const right = summaries.get(b.id)
    if (sort === 'sesiones') return (right?.sessions ?? 0) - (left?.sessions ?? 0)
    if (sort === 'avance-')
      return (left?.averageProgress ?? 0) - (right?.averageProgress ?? 0)
    if (sort === 'avance+')
      return (right?.averageProgress ?? 0) - (left?.averageProgress ?? 0)
    return a.full_name.localeCompare(b.full_name, 'es')
  })

  // "No patients at all" and "no patients matching this filter" are different
  // situations and deserve different screens. v1 got this right and it is the
  // difference between an invitation and a dead end.
  const filtering = Boolean(search) || (ageGroup && ageGroup !== 'all') || scope === 'archived'

  return (
    <>
      <PageHeader
        title="Pacientes"
        subtitle="Todos tus pacientes en un solo lugar."
        action={
          <Button asChild size="lg">
            <Link href="/pacientes/nuevo">
              <UserPlus className="size-[18px] max-lg:hidden" />
              Nuevo paciente
            </Link>
          </Button>
        }
      />

      <PatientFilters total={patients.length} />

      {patients.length === 0 ? (
        <Card>
          {filtering ? (
            <EmptyState
              icon={Users}
              title="No encontramos pacientes con eso"
              text="Probá con otro nombre o sacá algún filtro."
            />
          ) : (
            <EmptyState
              icon={Users}
              title="Todavía no tenés pacientes"
              text="Cargá el primero y su ficha queda guardada para siempre."
              action={
                <Button asChild>
                  <Link href="/pacientes/nuevo">Cargar primer paciente</Link>
                </Button>
              }
            />
          )}
        </Card>
      ) : view === 'tarjetas' ? (
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {patients.map((patient) => {
            const summary = summaries.get(patient.id)
            return (
              <li key={patient.id}>
                <Link
                  href={`/pacientes/${patient.id}`}
                  className="flex h-full flex-col rounded-lg bg-card p-3.5 shadow-card transition-shadow hover:shadow-[0_8px_24px_rgb(30_36_54_/_9%)]"
                >
                  <p className="truncate text-[15.5px] font-bold">{patient.full_name}</p>
                  <p className="mt-0.5 mb-3 truncate text-[12.5px] text-muted-foreground">
                    {[ageLabel(patient.date_of_birth), patient.school_level]
                      .filter(Boolean)
                      .join(' · ') || 'Sin datos todavía'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    <Chip className={patientClasses(patient.color)}>
                      {ageGroupLabel(patient.age_group)}
                    </Chip>
                    <Chip className="bg-blue-soft text-[#2f6fd6]">
                      {sessionsLabel(summary?.sessions ?? 0)}
                    </Chip>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5 text-[12px] text-muted-foreground">
                    <span className="truncate">{patient.school ?? '—'}</span>
                    <span
                      className="shrink-0 font-bold"
                      style={{ color: patientHex(patient.color) }}
                    >
                      {summary?.averageProgress ?? 0}% avance
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <Card className="px-2.5 py-1.5">
          <ul className="divide-y divide-border">
            {patients.map((patient) => {
              const summary = summaries.get(patient.id)
              return (
                <li key={patient.id}>
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="flex items-center gap-3 rounded-xl px-1.5 py-2.5 hover:bg-muted"
                  >
                    <PatientAvatar
                      fullName={patient.full_name}
                      color={patient.color}
                      size={38}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-bold">
                        {patient.full_name}
                      </p>
                      <p className="truncate text-[12.5px] text-muted-foreground">
                        {[
                          ageLabel(patient.date_of_birth),
                          patient.school_level,
                          patient.school,
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'Sin datos todavía'}
                      </p>
                    </div>

                    <Chip
                      className={cn(patientClasses(patient.color), 'max-sm:hidden')}
                    >
                      {ageGroupLabel(patient.age_group)}
                    </Chip>

                    <span className="min-w-[78px] shrink-0 text-right text-[12.5px] text-muted-foreground max-sm:hidden">
                      {sessionsLabel(summary?.sessions ?? 0)}
                    </span>

                    <span
                      className="min-w-[52px] shrink-0 text-right text-[14px] font-extrabold"
                      style={{ color: patientHex(patient.color) }}
                    >
                      {summary?.averageProgress ?? 0}%
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </>
  )
}
