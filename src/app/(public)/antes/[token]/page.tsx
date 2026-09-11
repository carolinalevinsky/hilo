import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Brandmark } from '@/components/brandmark'
import { IntakeForm } from '@/components/patient-forms/intake-form'
import { formByToken } from '@/server/patient-forms'

export const metadata: Metadata = {
  title: 'Antes de empezar · Hilo',
  // A page behind a secret link has no business in a search engine, and a
  // crawler that followed a pasted link would be one more place it ended up.
  robots: { index: false, follow: false },
  // The token is in the path. No referrer, so a link clicked from here does not
  // carry it to whatever site it leads to.
  referrer: 'no-referrer',
}

/**
 * The page a family opens from "Antes de empezar".
 *
 * It shows who sent it and the patient's first name, and nothing else from
 * the ficha — see `patient_form_by_token`. The same plain look as the booking
 * page: a form somebody sent them, not a door into an app.
 */
export default async function IntakePage({ params }: PageProps<'/antes/[token]'>) {
  const { token } = await params
  const form = await formByToken(token)
  // Scales (the other kind of link) get their own page when they exist.
  if (!form || form.kind !== 'intake' || !form.consentText) notFound()

  return (
    <div className="min-h-dvh bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-[520px]">
        <div className="mb-5 flex items-center gap-2.5">
          <Brandmark />
          <span className="text-[21px] font-extrabold tracking-[-0.3px]">Hilo</span>
        </div>

        <div className="rounded-lg bg-card px-6 py-6 shadow-card">
          <p className="text-meta font-semibold text-violet">{form.practitionerName}</p>
          <h1 className="mt-1 text-[21px] font-extrabold tracking-[-0.4px]">
            Antes de empezar con {form.patientFirstName}
          </h1>

          <div className="mt-5">
            {form.state === 'submitted' ? (
              <Notice tone="done">
                Esta ficha ya se envió. {form.practitionerName} tiene los datos y el
                consentimiento firmado.
              </Notice>
            ) : form.state === 'expired' ? (
              <Notice tone="expired">
                Este link venció. Pedile a {form.practitionerName} que te mande uno nuevo.
              </Notice>
            ) : (
              <IntakeForm
                token={token}
                practitionerName={form.practitionerName}
                patientFirstName={form.patientFirstName}
                ageGroup={form.ageGroup}
                consentText={form.consentText}
              />
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-meta text-muted-foreground">
          Lo que completes le llega sólo a {form.practitionerName}.
        </p>
      </div>
    </div>
  )
}

function Notice({ tone, children }: { tone: 'done' | 'expired'; children: React.ReactNode }) {
  return (
    <p
      role="status"
      className={
        tone === 'done'
          ? 'rounded-xl bg-green-soft px-4 py-4 text-body text-[#1a8f57]'
          : 'rounded-xl bg-amber-soft px-4 py-4 text-body text-[#8a5a12]'
      }
    >
      {children}
    </p>
  )
}
