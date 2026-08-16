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
}

export default nextConfig
