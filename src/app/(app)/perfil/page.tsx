import type { Metadata } from 'next'

import { signOutAction } from '@/app/(auth)/actions'
import { disconnectGoogleAction } from '@/app/(app)/perfil/actions'
import { findGoogleAccount } from '@/server/google'
import { PageHeader } from '@/components/page-header'
import { CalendarPrivacyForm } from '@/components/profile/calendar-privacy-form'
import { ProfileForm } from '@/components/profile/profile-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { currentSession } from '../session'

export const metadata: Metadata = { title: 'Mi perfil · Hilo' }

/** Lo que dejó el ida y vuelta a Google, traducido. */
const GOOGLE_RESULTS: Record<string, { ok: boolean; message: string }> = {
  listo: { ok: true, message: 'Listo, conectamos tu Google Calendar.' },
  cancelado: {
    ok: false,
    message: 'No autorizaste el acceso, así que no conectamos nada.',
  },
  // El `state` que no coincide casi siempre es una pestaña vieja o los diez
  // minutos vencidos. Podría ser también el ataque que ese control existe para
  // frenar, y no hay forma de distinguirlos desde acá — así que el texto sirve
  // para los dos casos y no asusta por lo que casi nunca es.
  estado: {
    ok: false,
    message: 'La conexión venció o se abrió desde otra pestaña. Probá de nuevo.',
  },
  'sin-codigo': { ok: false, message: 'Google no nos devolvió el permiso. Probá de nuevo.' },
  error: { ok: false, message: 'No pudimos completar la conexión. Probá de nuevo.' },
}

export default async function ProfilePage({ searchParams }: PageProps<'/perfil'>) {
  const { practitioner } = await currentSession()
  const [google, params] = await Promise.all([
    findGoogleAccount(practitioner.id),
    searchParams,
  ])

  const result =
    typeof params.google === 'string' ? GOOGLE_RESULTS[params.google] : undefined

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
        <CardContent className="space-y-5">
          {result ? (
            <p
              role="status"
              className={
                result.ok
                  ? 'rounded-[11px] bg-green-soft px-3.5 py-2.5 text-[12.5px] text-[#1a8f57]'
                  : 'rounded-[11px] bg-red-soft px-3.5 py-2.5 text-[12.5px] text-[#c0392b]'
              }
            >
              {result.message}
            </p>
          ) : null}

          <div className="rounded-xl border border-border p-3.5">
            {google ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold">Google Calendar conectado</p>
                  <p className="truncate text-[12.5px] text-muted-foreground">
                    {google.googleEmail}
                  </p>
                </div>
                <form action={disconnectGoogleAction}>
                  <Button type="submit" variant="outline" size="sm">
                    Desconectar
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Dice lo que hace hoy, no lo que va a hacer. La versión
                    anterior prometía la sincronización en las dos direcciones,
                    que todavía se está escribiendo — y una pantalla que promete
                    algo que no pasa es peor que una que no lo ofrece. */}
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold">Google Calendar</p>
                  <p className="text-[12.5px] text-muted-foreground">
                    Conectá tu cuenta. La sincronización de tus sesiones se está
                    terminando; esto deja lista la parte de los permisos.
                  </p>
                </div>
                {/* Un enlace y no un botón con acción: el final del camino es
                    una redirección al dominio de Google. */}
                <Button asChild size="sm">
                  <a href="/api/google/conectar">Conectar</a>
                </Button>
              </div>
            )}
          </div>

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
