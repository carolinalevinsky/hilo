import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BookingForm } from '@/components/booking/booking-form'
import { disciplineLabel } from '@/lib/disciplines'
import { practitionerBySlug } from '@/server/booking'

export const metadata: Metadata = { title: 'Pedir un turno · Hilo' }

/**
 * The page a family opens from the link a practitioner sent them.
 *
 * The URL is `/reservar/lucia-fernandez`, not a UUID. v1's link carried the
 * practitioner's `auth.users.id` (`legacy/index.html:1506`), which put an
 * internal identifier on a card handed to strangers.
 *
 * Everything shown here comes from `practitioner_by_slug`, a function that
 * returns a name and a discipline and nothing else. There is no query on this
 * page that could return one column more than intended.
 */
export default async function BookingPage({ params }: PageProps<'/reservar/[slug]'>) {
  const { slug } = await params
  const practitioner = await practitionerBySlug(slug)
  if (!practitioner) notFound()

  return (
    <div className="hilo-auth-bg flex min-h-dvh items-center justify-center overflow-auto p-5">
      <div className="w-full max-w-[440px] rounded-[24px] bg-card px-7 pt-8 pb-6 shadow-[0_30px_80px_rgba(20,14,60,0.45)]">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="size-6 rounded-[8px] bg-violet" />
          <span className="text-[21px] font-extrabold tracking-[-0.3px]">Hilo</span>
        </div>

        <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">
          Pedile un turno a {practitioner.full_name}
        </h1>
        <p className="mt-1 mb-5 text-[13px] text-muted-foreground">
          {disciplineLabel(practitioner.discipline)} · Dejanos tus datos y te contesta a la
          brevedad.
        </p>

        <BookingForm slug={slug} />

        <p className="mt-5 text-center text-[11.5px] text-muted-foreground">
          <Link href="/privacidad" className="underline">
            Cómo cuidamos tus datos
          </Link>
        </p>
      </div>
    </div>
  )
}
