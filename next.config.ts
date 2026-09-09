import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Who may ask this dev server for its client bundles.
   *
   * The dev server runs inside the container on `0.0.0.0` (see `./dx`), so a
   * browser on the host asking for `http://127.0.0.1:3000` is, as far as Next is
   * concerned, a different origin — and it answers **403 on every chunk**. The
   * page renders, because that is server HTML, and then nothing works: no
   * dialog opens, no filter chip responds, no form submits, because React never
   * hydrates. There is a warning about it in the dev server's output and no
   * error in the browser beyond a row of 403s, which is a genuinely awful hour
   * to spend.
   *
   * Development only — Next ignores this in a production build, and it is not a
   * relaxation of anything that protects real data.
   */
  allowedDevOrigins: ['127.0.0.1', 'localhost'],

  /**
   * Where this server writes its build, so a second Next can run beside the one
   * someone is working in.
   *
   * The end-to-end test starts its own dev server on port 3100
   * (`playwright.config.ts`). Two Next servers sharing `.next/` over the Docker
   * bind mount deadlock on the same file — Turbopack panics with "Resource
   * deadlock avoided (os error 35)" and neither server serves anything. Pointing
   * the test's server at its own directory is what keeps `./dx npm run test:e2e`
   * runnable while `npm run dev` is up, which is exactly when someone would run
   * it.
   *
   * Unset — every normal `dev`, `build` and `start` — this is the default
   * `.next`, so nothing else changes.
   */
  distDir: process.env.NEXT_DIST_DIR ?? '.next',

  /**
   * Cabeceras de seguridad.
   *
   * No había ninguna. Cuatro de las cinco de acá abajo no pueden romper nada y
   * van aplicándose; la quinta —la CSP— va en modo informe, y eso es una
   * decisión, no una tibieza. Ver abajo.
   *
   * `Strict-Transport-Security` no está a propósito: Vercel la agrega sola en
   * todos sus despliegues, y duplicar una cabecera que administra la plataforma
   * es la forma de terminar con dos fuentes de verdad sobre `preload`, que es
   * justo la que no se puede deshacer.
   */
  async headers() {
    // El origen de Supabase sale de la variable pública, que es de donde salen
    // las URLs firmadas de las fotos y de los archivos de material. Escribirlo a
    // mano acá sería un segundo lugar que hay que acordarse de cambiar.
    const supabase = (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin
      } catch {
        return ''
      }
    })()

    /**
     * La CSP, y por qué va en `Report-Only`.
     *
     * Next inyecta scripts en línea para hidratar, así que una CSP que sirva de
     * verdad necesita un nonce por petición generado en `src/proxy.ts`. Eso es
     * un cambio en el camino por el que pasa **toda** petición de la aplicación,
     * y equivocarse ahí no degrada nada: deja la app en blanco.
     *
     * En `Report-Only` el navegador no bloquea nada y anota en la consola lo que
     * habría bloqueado. Sirve para dos cosas: recoger la lista real de lo que
     * falta —que es más honesto que adivinarla— y no prometer una protección que
     * todavía no está puesta. Para pasarla a obligatoria hay que agregar el
     * nonce y cambiar el nombre de la cabecera; hasta entonces, esto no protege,
     * informa.
     */
    const csp = [
      "default-src 'self'",
      // `unsafe-inline` acá es lo que hace falta hasta que haya nonce, y es
      // exactamente el motivo por el que esto todavía no bloquea.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // `blob:` es la previsualización de la foto antes de subirla
      // (`photo-picker.tsx`); Supabase es de donde vienen las URLs firmadas.
      `img-src 'self' data: blob: ${supabase}`.trim(),
      // El visor de PDF de un material adjunto, que es un `iframe` a Supabase.
      `frame-src ${supabase}`.trim(),
      "font-src 'self' data:",
      `connect-src 'self' ${supabase}`.trim(),
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          // Sin esto, un archivo servido con el tipo equivocado puede terminar
          // ejecutándose como script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Hilo no se embebe en ningún lado. El `iframe` del material va en la
          // otra dirección: es Hilo mostrando algo de Supabase.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Es el default de los navegadores modernos; escrito, deja de depender
          // de cuál usa cada quien.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // El micrófono lo usan el botón de dictado y el registro por voz, los
          // dos dentro de Hilo. La cámara no la usa nada: la videollamada abre
          // `meet.jit.si` en otra pestaña, que es otro origen y tiene su propio
          // permiso.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), payment=()',
          },
          { key: 'Content-Security-Policy-Report-Only', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
