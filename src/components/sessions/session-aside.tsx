import Link from 'next/link'

import { PatientAvatar } from '@/components/patients/patient-avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ageLabel } from '@/lib/age'
import { formatDate } from '@/lib/dates'
import { ageGroupLabel } from '@/lib/patient-labels'
import type { Patient } from '@/server/patients'

/**
 * The context column beside "Registrar sesión".
 *
 * The form used to sit alone in a 672px card on a 1400px screen, which read as
 * unfinished — but the fix is not to widen the form. It is that writing up a
 * session is the one moment where you need to remember what you wrote last
 * time, and the screen was not telling you.
 *
 * What is deliberately *not* here: the patient's goals, which the form already
 * lists as checkboxes an inch to the left, and a second link to the record,
 * which is the "Volver a la ficha" at the top of the page. Repeating either one
 * would fill space by saying the same thing twice.
 */
export function SessionAside({
  patient,
  lastSession,
}: {
  patient: Patient
  lastSession: { id: string; held_on: string; progress_note: string | null } | null
}) {
  const meta = [ageLabel(patient.date_of_birth), ageGroupLabel(patient.age_group)]
    .filter(Boolean)
    .join(' · ')

  const school = [patient.school, patient.school_level].filter(Boolean).join(' · ')

  return (
    <aside className="space-y-3 lg:sticky lg:top-6">
      <Card>
        <CardContent className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <PatientAvatar
              fullName={patient.full_name}
              color={patient.color}
              size={40}
            />
            <div className="min-w-0">
              <p className="truncate text-item font-bold">{patient.full_name}</p>
              {meta ? (
                <p className="truncate text-meta text-muted-foreground">{meta}</p>
              ) : null}
            </div>
          </div>

          {patient.referral_reason ? (
            <Field label="Motivo de consulta" value={patient.referral_reason} />
          ) : null}
          {school ? <Field label="Escuela" value={school} /> : null}
        </CardContent>
      </Card>

      {lastSession ? (
        <Card>
          <CardHeader>
            <CardTitle>Última sesión</CardTitle>
            <p className="text-meta text-muted-foreground">
              {formatDate(lastSession.held_on)}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-body leading-relaxed text-muted-foreground line-clamp-6">
              {lastSession.progress_note}
            </p>
            <Link
              href={`/pacientes/${patient.id}/sesiones/${lastSession.id}`}
              className="mt-2.5 inline-block text-meta font-semibold text-violet hover:underline"
            >
              Abrir esa sesión →
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </aside>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-micro font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-body leading-relaxed">{value}</p>
    </div>
  )
}
