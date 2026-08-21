import Link from 'next/link'

import { formatDate } from '@/lib/dates'
import { RECIPIENT_LABELS, type RecipientId } from '@/lib/recipients'
import type { AssessmentWithPatient } from '@/server/assessments'
import type { ReportWithPatient } from '@/server/reports'

/**
 * "Evaluaciones e informes" on the patient's ficha — v1's card
 * (`legacy/index.html:1219`).
 *
 * v2 had these only on `/informes`, which lists everybody's. That is the right
 * screen for "what did I write this month" and the wrong one for the question
 * you actually ask, which is "what do I already have on this child" — asked
 * while looking at the child's page, usually right before writing another one.
 *
 * Newest first, both kinds interleaved by date rather than grouped: what matters
 * is when it was written, not which of the two it was.
 */
export function PatientDocuments({
  assessments,
  reports,
}: {
  assessments: AssessmentWithPatient[]
  reports: ReportWithPatient[]
}) {
  const documents = [
    ...assessments.map((assessment) => ({
      id: assessment.id,
      kind: 'assessment' as const,
      href: `/evaluaciones/${assessment.id}`,
      title: assessment.instrument,
      date: assessment.assessed_on,
    })),
    ...reports.map((report) => ({
      id: report.id,
      kind: 'report' as const,
      href: `/informes/${report.id}`,
      title: `Para ${RECIPIENT_LABELS[report.recipient as RecipientId] ?? report.recipient}`,
      date: report.created_at.slice(0, 10),
    })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  if (documents.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Todavía no generaste evaluaciones ni informes para este paciente. Aparecen acá
        cuando los creás.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {documents.map((document) => (
        <li key={document.id}>
          <Link
            href={document.href}
            className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 transition-colors hover:bg-muted"
          >
            <span
              className={
                document.kind === 'assessment'
                  ? 'shrink-0 rounded-full bg-violet-soft px-2 py-0.5 text-[10.5px] font-bold text-violet'
                  : 'shrink-0 rounded-full bg-green-soft px-2 py-0.5 text-[10.5px] font-bold text-[#1a8f57]'
              }
            >
              {document.kind === 'assessment' ? 'Evaluación' : 'Informe'}
            </span>

            <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold">
              {document.title}
            </span>

            <span className="shrink-0 text-[11.5px] text-muted-foreground">
              abrir · {formatDate(document.date)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * "Memoria de Hilo" — v1's card (`legacy/index.html:1216`).
 *
 * It looks like decoration and is not. It is the answer to the question a
 * practitioner has in month one, which is "am I writing all this into a hole?" —
 * and the answer is that the sessions and goals accumulating here are exactly
 * what the report is built from later. v1 put it on the ficha because that is
 * where the doubt occurs.
 */
export function HiloMemory({
  firstName,
  sessions,
  goals,
}: {
  firstName: string
  sessions: number
  goals: number
}) {
  const nothingYet = sessions === 0 && goals === 0

  return (
    <p className="rounded-xl bg-violet-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-violet">
      {nothingYet ? (
        <>
          Todavía no cargaste nada de {firstName}. A medida que registres sesiones y
          evaluaciones, todo se guarda acá, y después Hilo lo usa para armar los informes
          por vos.
        </>
      ) : (
        <>
          Hilo va guardando todo lo de {firstName}: por ahora{' '}
          <b>{sessions === 1 ? '1 sesión' : `${sessions} sesiones`}</b> y{' '}
          <b>{goals === 1 ? '1 objetivo' : `${goals} objetivos`}</b>. Con esto arma los
          informes sin que escribas de cero.
        </>
      )}
    </p>
  )
}
