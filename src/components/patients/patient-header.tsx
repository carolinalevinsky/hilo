import { Pencil } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { PatientAvatar } from '@/components/patients/patient-avatar'
import { Button } from '@/components/ui/button'
import { ageLabel } from '@/lib/age'
import { patientHex } from '@/lib/patient-colors'
import { ageGroupLabel } from '@/lib/patient-labels'
import type { Patient } from '@/server/patients'

/**
 * The coloured band at the top of a patient's page, in their own colour. Ported
 * from v1's `.phdr` (`legacy/index.html:1185`).
 *
 * It is worth the space: it is how a practitioner knows at a glance whose record
 * is open, which matters when you are switching between patients between
 * sessions.
 */
export function PatientHeader({
  patient,
  photoUrl,
  actions,
}: {
  patient: Patient
  photoUrl: string | null
  actions?: ReactNode
}) {
  const hex = patientHex(patient.color)
  const meta = [
    ageLabel(patient.date_of_birth),
    patient.school_level,
    patient.school,
    ageGroupLabel(patient.age_group),
  ].filter(Boolean)

  return (
    <div
      className="mb-5 rounded-lg p-5 text-white shadow-card"
      style={{ background: `linear-gradient(120deg, ${hex}, ${hex}cc)` }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <PatientAvatar
          fullName={patient.full_name}
          color={patient.color}
          photoUrl={photoUrl}
          size={62}
          className="bg-white/25 text-white"
        />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[24px] font-extrabold tracking-[-0.6px]">
            {patient.full_name}
          </h1>
          <p className="mt-0.5 text-[13px] text-white/85">
            {meta.join(' · ')}
            {patient.archived_at ? ' · Archivado' : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 max-sm:w-full">
          {actions}
          <Button
            asChild
            variant="outline"
            className="border-transparent bg-white/16 text-white hover:bg-white/26 hover:text-white max-sm:flex-1"
          >
            <Link href={`/pacientes/${patient.id}/editar`}>
              <Pencil className="size-4" />
              Editar ficha
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
