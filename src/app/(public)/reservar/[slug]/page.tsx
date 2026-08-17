import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BookingForm } from '@/components/booking/booking-form'
import { Brandmark } from '@/components/brandmark'
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
    // The plain background, not the violet gradient of the sign-in screen — v1
    // made that distinction (`legacy/index.html:502`) and it is the right one.
    // A family arriving from a WhatsApp link is not signing in to anything; the
    // page should look like a form somebody sent them, not like a front door.
    <div className="min-h-dvh bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-5 flex items-center gap-2.5">
          <Brandmark />
          <span className="text-[21px] font-extrabold tracking-[-0.3px]">Hilo</span>
        </div>

        <div className="rounded-lg bg-card px-6 py-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-violet text-[19px] font-extrabold text-white"
            >
              {practitioner.full_name.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[19px] font-extrabold tracking-[-0.4px]">
                {practitioner.full_name}
              </h1>
              <p className="text-[13px] text-muted-foreground">
                {disciplineLabel(practitioner.discipline)}
              </p>
            </div>
          </div>

          <BookingForm slug={slug} />

          <p className="mt-4 text-center text-[12px] text-muted-foreground">
            {practitioner.full_name} recibe tu pedido y te confirma el horario.
          </p>
        </div>

        <p className="mt-4 text-center text-[11.5px] text-muted-foreground">
          Hecho con Hilo · tus datos se comparten sólo con {practitioner.full_name}.{' '}
          <Link href="/privacidad" className="underline">
            Cómo los cuidamos
          </Link>
        </p>
      </div>
    </div>
  )
}
