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
import { requireUser } from '@/server/auth'
import { listPatients, type PatientListOptions } from '@/server/patients'

export const metadata: Metadata = { title: 'Pacientes · Hilo' }

function readParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined
}

export default async function PatientsPage({ searchParams }: PageProps<'/pacientes'>) {
  const params = await searchParams
  const user = await requireUser()

  const scope = readParam(params.estado) === 'archived' ? 'archived' : 'active'
  const ageGroup = readParam(params.edad) as PatientListOptions['ageGroup']
  const search = readParam(params.q)

  const patients = await listPatients(user.id, { search, ageGroup, scope })

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
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link
                href={`/pacientes/${patient.id}`}
                className="flex items-center gap-3 rounded-lg bg-card p-3.5 shadow-card transition-shadow hover:shadow-[0_8px_24px_rgb(30_36_54_/_9%)]"
              >
                <PatientAvatar fullName={patient.full_name} color={patient.color} />
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-bold">{patient.full_name}</p>
                  <p className="truncate text-[12.5px] text-muted-foreground">
                    {[ageLabel(patient.date_of_birth), patient.school_level, patient.school]
                      .filter(Boolean)
                      .join(' · ') || 'Sin datos todavía'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
