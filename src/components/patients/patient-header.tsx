import { Camera } from '@/components/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { PatientAvatar } from '@/components/patients/patient-avatar'
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
        {/* The camera badge is v1's (`legacy/index.html:1186`) and it is only a
            shortcut: the upload itself lives in the edit form, where it already
            worked. Worth having anyway — adding a face to a patient is something
            you think of while looking at them, not while editing a form. */}
        <div className="relative">
          <PatientAvatar
            fullName={patient.full_name}
            color={patient.color}
            photoUrl={photoUrl}
            size={62}
            className="bg-white/25 text-white"
          />
          <Link
            href={`/pacientes/${patient.id}/editar`}
            aria-label={photoUrl ? 'Cambiar la foto' : 'Agregar una foto'}
            // El círculo se queda en 24px: agrandarlo sería una mancha violeta
            // sobre la cara del paciente. Lo que crece en teléfono es la zona
            // que responde al dedo, con un `::after` invisible que lo lleva a
            // 44px. Se ve un botón chico y se toca uno grande, que es lo que
            // corresponde cuando el tamaño es una decisión de diseño y el
            // problema es el pulgar.
            className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-violet text-white ring-2 ring-white/70 hover:brightness-110 max-lg:after:absolute max-lg:after:-inset-2.5 max-lg:after:content-['']"
          >
            <Camera className="size-3.5" />
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[24px] font-extrabold tracking-[-0.6px]">
            {patient.full_name}
          </h1>
          <p className="mt-0.5 text-body text-white/85">
            {meta.join(' · ')}
            {patient.archived_at ? ' · Archivado' : ''}
          </p>
        </div>

        {/* "Editar ficha" vivía acá y se fue con las demás a la página: los
            seis botones se pliegan juntos en teléfono y eso sólo se puede
            decidir en un lugar. Ver `PatientActions`. */}
        <div className="flex flex-wrap gap-2 max-sm:w-full">{actions}</div>
      </div>
    </div>
  )
}
