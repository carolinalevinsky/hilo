import type { Metadata } from 'next'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { disciplineLabel } from '@/lib/disciplines'
import { requireUser } from '@/server/auth'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Inicio · Hilo' }

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

export default async function HomePage() {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

  return (
    <>
      <PageHeader
        title={`¡Hola, ${firstName(practitioner.full_name)}! 👋`}
        subtitle="Esto es lo que tenés hoy. Empezá por acá."
      />

      <Card>
        <CardContent className="space-y-2">
          <p className="text-[15px] font-bold">Tu cuenta está lista</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Entraste como <b className="text-foreground">{practitioner.full_name}</b>,{' '}
            {disciplineLabel(practitioner.discipline).toLowerCase()}. Desde acá vas a ver tus
            pacientes del día, la agenda de la semana y los avisos que necesiten tu atención.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
