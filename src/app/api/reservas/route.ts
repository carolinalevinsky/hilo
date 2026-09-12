import { publicConfig } from '@/lib/env'
import {
  BOOKINGS_PER_HOUR,
  createBookingRequest,
  practitionerBySlug,
  practitionerEmail,
  recentRequestCount,
  submitterHash,
} from '@/server/booking'
import { sendBookingNotification } from '@/server/notifications'

/**
 * The public booking form posts here. **Defects #6 and #10.**
 *
 * v1's form INSERTed straight from the browser with a caller-supplied `prof_id`.
 * Here the practitioner is resolved from the slug on the server, the payload is
 * validated, the sender is rate-limited, and only then does a row appear.
 *
 * The email is sent from this same function rather than from a Supabase Database
 * Webhook. That deletes a real liability: the webhook's URL, secret, table and
 * event lived in a dashboard and in no file — unreviewable, untestable, not
 * restored by any rollback, and silently broken the day the URL changed.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | (Record<string, unknown> & { slug?: string })
    | null

  const slug = typeof body?.slug === 'string' ? body.slug : ''
  if (!slug) {
    return Response.json({ error: 'Falta el profesional.' }, { status: 400 })
  }

  const practitioner = await practitionerBySlug(slug)
  if (!practitioner) {
    return Response.json({ error: 'Ese link no existe.' }, { status: 404 })
  }

  // La dirección de quien manda, para el contador — y de dónde se lee importa.
  //
  // Esto tomaba el **primer** valor de `x-forwarded-for`, que es justo el que no
  // hay que usar: el encabezado se concatena, así que lo que un proxy agrega va
  // al final y lo que el cliente mandó por su cuenta queda adelante. Con el
  // primero, quien quisiera saltear el límite sólo tenía que mandar
  // `X-Forwarded-For: 1.2.3.4` distinto en cada pedido para que
  // `submitterHash` diera otro y el contador arrancara de cero cada vez.
  //
  // `x-vercel-forwarded-for` lo escribe la plataforma y no se puede pisar desde
  // afuera, así que es el primero que se mira. El último valor de
  // `x-forwarded-for` es el reemplazo cuando no está —local, o cualquier otro
  // hosting—: es el que agregó el proxy más cercano y no quien llamó.
  //
  // Sin ninguno de los dos queda `'local'`, y ahí todos comparten un contador:
  // es la dirección segura en la que equivocarse.
  const forwarded =
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-forwarded-for')

  const hops =
    forwarded
      ?.split(',')
      .map((hop) => hop.trim())
      .filter(Boolean) ?? []

  const ip = hops.at(-1) ?? 'local'
  const hash = submitterHash(practitioner.id, ip)

  if ((await recentRequestCount(hash)) >= BOOKINGS_PER_HOUR) {
    return Response.json(
      { error: 'Ya enviaste varias solicitudes. Probá de nuevo en un rato.' },
      { status: 429 },
    )
  }

  let created
  try {
    created = await createBookingRequest(practitioner.id, body, hash)
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const issues = (error as { issues: { message: string }[] }).issues
      return Response.json(
        { error: issues[0]?.message ?? 'Revisá los datos.' },
        { status: 400 },
      )
    }
    console.error('[reservas] no se pudo guardar la solicitud', error)
    return Response.json({ error: 'No pudimos guardar tu solicitud.' }, { status: 500 })
  }

  // The email is best-effort and deliberately not awaited into the response's
  // success. The request is saved either way, and the practitioner sees it in
  // their inbox — a family should not get an error because Resend is down.
  const email = await practitionerEmail(practitioner.id)
  if (email) {
    // Sin `await`, que es lo que el comentario de arriba decía y el código no
    // hacía: con Resend lento, la familia se quedaba mirando el spinner por un
    // mail que no es para ella. El `catch` no es decorativo — una promesa
    // rechazada sin manejar tumba el proceso en Node.
    void sendBookingNotification({
      to: email,
      practitionerName: practitioner.full_name,
      request: created,
      appUrl: publicConfig.NEXT_PUBLIC_APP_URL,
    }).catch((error) => {
      console.error('[reservas] no se pudo avisar de la reserva', {
        practitionerId: practitioner.id,
        error,
      })
    })
  }

  return Response.json({ ok: true })
}
