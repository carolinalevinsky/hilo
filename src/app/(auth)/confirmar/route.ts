import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { internalPath } from '@/lib/safe-path'
import { confirmEmailLink, exchangeAuthCode } from '@/server/auth'

import { RECOVERY_COOKIE, RECOVERY_COOKIE_OPTIONS, RECOVERY_PATH } from '../recovery-cookie'

/**
 * Where every link Hilo emails comes back to.
 *
 * Supabase sends the practitioner to its own `/auth/v1/verify` first; this is
 * the address it hands them on afterwards. Without it the confirmation email has
 * nowhere to return to and the link appears to do nothing — which is the state
 * this app was in until now, and the reason email confirmation stayed off.
 *
 * It is a route handler, not a page: nothing is rendered here. It reads the
 * link, asks `src/server/auth.ts` to turn it into a session, and redirects.
 * Both link shapes are handled — the token hash Hilo's own templates send, and
 * the `?code=` of Supabase's stock ones — because which arrives depends on a
 * dashboard setting rather than on this repository.
 *
 * `redirect()` throws, so it stays outside every branch that could catch it.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  // Supabase reports its own failures — an expired link, mostly — as query
  // parameters on a 200. Reading `error` before anything else keeps that from
  // being mistaken for a link with no token.
  if (params.get('error') || params.get('error_description')) {
    redirect('/entrar?aviso=enlace-vencido')
  }

  const tokenHash = params.get('token_hash')
  const type = params.get('type')
  const code = params.get('code')

  const result = tokenHash
    ? await confirmEmailLink({ tokenHash, type })
    : code
      ? await exchangeAuthCode(code)
      : { ok: false as const }

  if (!result.ok) {
    redirect('/entrar?aviso=enlace-vencido')
  }

  const next = internalPath(params.get('next'), '/inicio')

  // A recovery link is the one case where the session it just created is allowed
  // to set a password without knowing the old one. The marker says so; see
  // `../recovery-cookie.ts` for why a session alone is not enough.
  if (type === 'recovery' || next === RECOVERY_PATH) {
    const store = await cookies()
    store.set(RECOVERY_COOKIE, '1', RECOVERY_COOKIE_OPTIONS)
    redirect(RECOVERY_PATH)
  }

  redirect(next)
}
