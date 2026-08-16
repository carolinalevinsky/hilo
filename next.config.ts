import type { NextConfig } from 'next'

/**
 * `distDir` is the only thing configured here, and only so that a second Next
 * server can run beside the one someone is working in.
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
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
}

export default nextConfig
