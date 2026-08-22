import type { MetadataRoute } from 'next'

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
    name: 'Hilo',
    short_name: 'Hilo',
    description:
      'Historias clínicas, agenda, objetivos, informes y cobros — todo tu consultorio en un solo lugar.',
    // Not '/': the landing page redirects a signed-in practitioner anyway, and
    // an installed app that starts on a marketing page feels like a browser.
    start_url: '/inicio',
    display: 'standalone',
    background_color: '#f5f6fb', // --background
    theme_color: '#6c5ce7', // --hilo-violet
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
