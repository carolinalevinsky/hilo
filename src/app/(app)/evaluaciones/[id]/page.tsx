import { ArrowLeft, Target } from '@/components/icons'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  adoptSuggestedGoalsAction,
  deleteAssessmentAction,
  saveAssessmentAction,
} from '@/app/(app)/evaluaciones/actions'
import { ClinicalDocument } from '@/components/documents/clinical-document'
import { DocumentEditor } from '@/components/documents/document-editor'
import { Button } from '@/components/ui/button'
import { ageLabel } from '@/lib/age'
import { formatLongDate } from '@/lib/dates'
import { disciplineLabel } from '@/lib/disciplines'
import { AssessmentResults, getAssessment, suggestedGoals } from '@/server/assessments'

import { currentPractitioner, currentUser } from '../../session'

export const metadata: Metadata = { title: 'Evaluación · Hilo' }

export default async function AssessmentPage({
  params,
  searchParams,
}: PageProps<'/evaluaciones/[id]'>) {
  const { id } = await params
  const query = await searchParams
  const user = await currentUser()

  const [assessment, practitioner] = await Promise.all([
    getAssessment(user.id, id),
    currentPractitioner(user.id),
  ])
  if (!assessment) notFound()

  const results = AssessmentResults.parse(assessment.results)
  const proposals = suggestedGoals(results, assessment.instrument)

  return (
    <>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/informes"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a informes
        </Link>

        <form action={deleteAssessmentAction}>
          <input type="hidden" name="assessmentId" value={assessment.id} />
          <Button type="submit" variant="ghost" size="sm">
            Borrar
          </Button>
        </form>
      </div>

      <ClinicalDocument
        title="Interpretación de evaluación"
        subtitle={`${assessment.instrument} · Montevideo, ${formatLongDate(assessment.assessed_on)}`}
        meta={[
          { label: 'Paciente', value: assessment.patients?.full_name ?? 'Sin datos' },
          {
            label: 'Edad',
            value: ageLabel(assessment.patients?.date_of_birth ?? null) ?? 'Sin datos',
          },
          { label: 'Instrumento', value: assessment.instrument },
        ]}
        footer={{
          name: practitioner.full_name,
          discipline: disciplineLabel(practitioner.discipline),
        }}
      >
        <DocumentEditor
          documentId={assessment.id}
          initialText={assessment.analysis ?? ''}
          endpoint="/api/ai/evaluacion"
          idField="assessmentId"
          autoStart={query.ia === '1'}
          onSave={saveAssessmentAction.bind(null, assessment.id)}
        />
      </ClinicalDocument>

      {/* The moment the assessment stops being a document: the weakest areas
          become the next three sessions, and the chart on the patient's page
          starts from the day it was administered. */}
      {proposals.length > 0 ? (
        <form
          action={adoptSuggestedGoalsAction}
          className="no-print mx-auto mt-4 max-w-[720px] rounded-lg bg-violet-soft p-4"
        >
          <input type="hidden" name="patientId" value={assessment.patient_id} />
          <input type="hidden" name="instrumentName" value={assessment.instrument} />
          <input type="hidden" name="results" value={JSON.stringify(results)} />

          <p className="text-[13.5px] font-bold text-violet">
            Objetivos sugeridos a partir de esta evaluación
          </p>
          <ul className="mt-1.5 space-y-1 text-[13px] text-violet">
            {proposals.map((proposal) => (
              <li key={proposal}>• {proposal}</li>
            ))}
          </ul>
          <Button type="submit" className="mt-3">
            <Target className="size-4" />
            Cargarlos en la ficha
          </Button>
        </form>
      ) : null}
    </>
  )
}
