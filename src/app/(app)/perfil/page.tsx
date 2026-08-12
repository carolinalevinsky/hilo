import type { Metadata } from 'next'

import { signOutAction } from '@/app/(auth)/actions'
import { PageHeader } from '@/components/page-header'
import { ProfileForm } from '@/components/profile/profile-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireUser } from '@/server/auth'
import { getPractitioner } from '@/server/practitioners'

export const metadata: Metadata = { title: 'Mi perfil · Hilo' }

export default async function ProfilePage() {
  const user = await requireUser()
  const practitioner = await getPractitioner(user.id)

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
