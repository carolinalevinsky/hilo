import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { publicConfig } from '@/lib/env'

/**
 * Session refresh and the signed-in / signed-out redirect.
 *
 * (In Next.js 16 this file convention is called `proxy`; it is what earlier
 * versions called `middleware`.)
 *
 * Two jobs, and only these two:
 *
 * 1. **Refresh the auth cookie.** Supabase access tokens expire after an hour.
 *    Server Components cannot write cookies, so without this a practitioner
 *    gets silently signed out mid-afternoon.
 *
 * 2. **Send people to the right place.** Signed out at `/pacientes` → the sign-in
 *    screen. Signed in at `/entrar` → the dashboard.
 *
 * ─── This is convenience, not security ─────────────────────────────────────
 *
 * The redirect below is a nicety. What actually protects clinical data is Row
 * Level Security in Postgres plus `requireUser()` in every page and action. A
 * proxy that failed open would be an inconvenience; RLS failing open would be a
 * breach, which is why the protection does not live here.
 *
 * This is also the one file outside `src/server/` allowed to import
 * `@supabase/ssr` — refreshing the cookie is transport work and there is no
 * other way to do it. `eslint.config.mjs` scopes rule 2 to `src/app/` and
 * `src/components/` for exactly this reason.
 */

/** Routes a signed-out visitor may reach. Everything else needs a session. */
const PUBLIC_PREFIXES = [
  '/', // the landing page
  '/entrar',
  '/crear-cuenta',
  '/reservar', // the public booking link a family opens
  '/terminos',
  '/privacidad',
]

/**
 * Route handlers are never redirected.
 *
 * Each one decides its own answer: the AI routes return a 401 as JSON, the
 * public booking route is open by design, and the Mercado Pago webhook
 * authenticates with a signature rather than a session. Redirecting them to the
 * sign-in page turns "unauthorised" into a 200 with an HTML body — which is
 * exactly what happened here, and the booking form read it as success and told a
 * family their request had arrived when nothing had been saved.
 */
function isApi(pathname: string) {
  return pathname === '/api' || pathname.startsWith('/api/')
}

function isPublic(pathname: string) {
  return (
    isApi(pathname) ||
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  )
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // Do not remove or reorder: this call is what refreshes the token, and the
  // refreshed cookie has to be written onto the response above.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    // So that signing in lands where they were headed.
    url.searchParams.set('volver', pathname)
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/entrar' || pathname === '/crear-cuenta' || pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/inicio'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files. Running on those would
     * cost a Supabase round trip per icon.
     *
     * `robots.txt` and `manifest.webmanifest` are generated routes, not files in
     * `public/`, so the extension rule above does not catch them — and being
     * caught here meant a signed-out request for either got an HTML redirect to
     * `/entrar`. A crawler read that instead of the disallow rules, and the
     * browser read it instead of the manifest, so Hilo was not installable from
     * the landing page. Same shape as the `/api/*` bug: a redirect turning a
     * machine-readable answer into a page for a human.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
