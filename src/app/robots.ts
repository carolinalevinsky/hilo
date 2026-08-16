import type { MetadataRoute } from 'next'

import { publicConfig } from '@/lib/env'

/**
 * What a crawler is allowed to look at: the landing page and the two legal
 * pages. Nothing else.
 *
 * Everything under the app is behind a session and would only ever answer a
 * crawler with a redirect to `/entrar`, so allowing it buys nothing. The one
 * that matters is `/reservar/<slug>`: those pages are public by design — a
 * practitioner hands the link to a family — but they carry a named
 * professional's name and specialty on a page that collects a phone number, and
 * being *reachable* is not the same as wanting to be *found*. A practitioner who
 * wants to be searchable can say so; the default should not decide it for them.
 *
 * This is a request, not a control. It keeps honest crawlers out and does
 * nothing about anyone else — which is why the protection that counts is RLS,
 * not this file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/$', '/terminos', '/privacidad'],
      disallow: '/',
    },
    host: publicConfig.NEXT_PUBLIC_APP_URL,
  }
}
