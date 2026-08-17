import { getUser } from '@/server/auth'
import { buildPatientExport } from '@/server/patient-export'
import { getPractitioner } from '@/server/practitioners'

/**
 * The complete export, as a file.
 *
 * A route handler rather than a Server Action for one reason: an action cannot
 * return a file, and this has to arrive in the browser's downloads with a
 * filename on it. Everything else about it is the same as any read — the session
 * is resolved first, and `buildPatientExport` queries through RLS, so a patient
 * belonging to someone else is a 404 and not a smaller export.
 *
 * `Cache-Control: no-store` because this is the whole clinical history of a
 * child in one response, and the one place it should exist is the file the
 * person who asked for it now holds.
 */
export async function GET(_request: Request, { params }: RouteContext<'/api/pacientes/[id]/datos'>) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'No pudimos verificar tu sesión.' }, { status: 401 })
  }

  const { id } = await params
  const practitioner = await getPractitioner(user.id)
  const data = await buildPatientExport(user.id, id, practitioner)

  if (!data || !data.patient) {
    return Response.json({ error: 'No encontramos ese paciente.' }, { status: 404 })
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${filename(data.patient.full_name)}"`,
      'cache-control': 'no-store',
    },
  })
}

/**
 * A filename that survives every operating system.
 *
 * Accents are folded rather than stripped so "Malena Rodríguez" stays readable,
 * and anything that is not a letter, a digit or a dash becomes a dash — which
 * covers the separators (`/`, `\`, `:`) that would otherwise turn a name into a
 * path.
 */
function filename(fullName: string): string {
  const slug =
    fullName
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'paciente'

  return `hilo-datos-${slug}.json`
}
