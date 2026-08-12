import { UserPlus, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { PatientAvatar } from '@/components/patients/patient-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { firstName } from '@/lib/whatsapp'
import { requireUser } from '@/server/auth'
import { listPatients } from '@/server/patients'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Inicio · Hilo' }

export default async function HomePage() {
  const user = await requireUser()
  const [practitioner, patients] = await Promise.all([
    getPractitioner(user.id),
    listPatients(user.id, { sort: 'recent' }),
  ])

  return (
    <>
      <PageHeader
        title={`¡Hola, ${firstName(practitioner.full_name)}! 👋`}
        subtitle="Esto es lo que tenés hoy. Empezá por acá."
        action={
          patients.length > 0 ? (
            <Button asChild size="lg">
              <Link href="/pacientes/nuevo">
                <UserPlus className="size-[18px] max-lg:hidden" />
                Nuevo paciente
              </Link>
            </Button>
          ) : null
        }
      />

      {patients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Empecemos por tu primer paciente"
            text="Nombre, edad y motivo de consulta. Se hace una sola vez y la ficha queda guardada para siempre."
            action={
              <Button asChild>
                <Link href="/pacientes/nuevo">Cargar mi primer paciente</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tus pacientes</CardTitle>
            <p className="text-[12.5px] text-muted-foreground">
              {patients.length === 1 ? '1 activo' : `${patients.length} activos`}
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {patients.slice(0, 6).map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="flex items-center gap-2.5 rounded-xl border border-border p-2.5 hover:bg-muted"
                  >
                    <PatientAvatar
                      fullName={patient.full_name}
                      color={patient.color}
                      size={36}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-bold">{patient.full_name}</p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {ageLabel(patient.date_of_birth) ?? 'Sin fecha de nacimiento'}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {patients.length > 6 ? (
              <Link
                href="/pacientes"
                className="mt-3 inline-block text-[13px] font-semibold text-violet underline"
              >
                Ver los {patients.length} →
              </Link>
            ) : null}
          </CardContent>
        </Card>
      )}
    </>
  )
}
