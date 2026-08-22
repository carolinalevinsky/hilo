import type { Metadata } from 'next'

import { signOutAction } from '@/app/(auth)/actions'
import { PageHeader } from '@/components/page-header'
import { CalendarPrivacyForm } from '@/components/profile/calendar-privacy-form'
import { ProfileForm } from '@/components/profile/profile-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currentSession } from '../session'

export const metadata: Metadata = { title: 'Mi perfil · Hilo' }

export default async function ProfilePage() {
  const { practitioner } = await currentSession()

  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Tus datos y los de tu cuenta." />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Tus datos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={practitioner.full_name}
            discipline={practitioner.discipline}
            phone={practitioner.phone}
          />
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Tu calendario</CardTitle>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Cuando agregás una sesión a Google Calendar, el título del evento
            queda guardado en un servidor de Google, fuera del país. Elegí cuánto
            de tu paciente viaja hasta ahí.{' '}
            <b className="font-semibold">
              La nota de la sesión, el motivo de consulta y los objetivos no salen
              nunca, con ninguna de las tres.
            </b>
          </p>
        </CardHeader>
        <CardContent>
          <CalendarPrivacyForm value={practitioner.calendar_privacy} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tu cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Correo</dt>
              <dd className="font-semibold">{practitioner.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-semibold">
                {practitioner.plan === 'pro' ? 'Pro' : 'Gratis'}
              </dd>
            </div>
          </dl>

          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
