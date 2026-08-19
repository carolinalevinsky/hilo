import { ArrowLeft } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/page-header'
import { PatientForm } from '@/components/patients/patient-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { removePhotoAction } from '@/app/(app)/pacientes/actions'
import { requireUser } from '@/server/auth'
import { getPatient, getPhotoUrl } from '@/server/patients'

export const metadata: Metadata = { title: 'Editar ficha · Hilo' }

export default async function EditPatientPage({
  params,
}: PageProps<'/pacientes/[id]/editar'>) {
  const { id } = await params
  const user = await requireUser()

  const patient = await getPatient(user.id, id)
  if (!patient) notFound()

  const photoUrl = await getPhotoUrl(patient.photo_path)

  return (
    <>
      <Link
        href={`/pacientes/${patient.id}`}
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la ficha
      </Link>

      <PageHeader title="Editar ficha" subtitle={patient.full_name} />

      <Card className="max-w-2xl">
        <CardContent className="space-y-4">
          <PatientForm patient={patient} photoUrl={photoUrl} />

          {patient.photo_path ? (
            <form action={removePhotoAction} className="border-t border-border pt-4">
              <input type="hidden" name="patientId" value={patient.id} />
              <Button type="submit" variant="ghost" size="sm">
                Quitar la foto
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
