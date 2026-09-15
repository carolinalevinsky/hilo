import type { MetadataRoute } from 'next'

import {
  BRAND_BACKGROUND,
  BRAND_COLORS,
  BRAND_LONG_DESCRIPTION,
  BRAND_NAME,
  BRAND_SHORT_NAME,
} from '@/lib/brand'

/**
 * The web app manifest, served at `/manifest.webmanifest`.
 *
 * Written as a route rather than a static JSON file so the values are typed —
 * a misspelt `display` or a size string that does not match the file on disk is
 * a build error instead of a browser that quietly refuses to offer the install.
 *
 * The icons are drawn by `scripts/make-icons.py`; the sizes below must match
 * what that script writes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_SHORT_NAME,
    description: BRAND_LONG_DESCRIPTION,
    // Not '/': the landing page redirects a signed-in practitioner anyway, and
    // an installed app that starts on a marketing page feels like a browser.
    start_url: '/inicio',
    display: 'standalone',
    background_color: BRAND_BACKGROUND,
    theme_color: BRAND_COLORS.violet,
    lang: 'es-UY',
    dir: 'ltr',
    // The app is used on a phone between sessions, one hand, standing up.
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android crops a maskable icon to whatever shape the launcher uses, so
      // this one carries a smaller mark with the safe zone left empty around it.
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
