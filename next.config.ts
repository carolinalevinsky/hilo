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
}

export default nextConfig
