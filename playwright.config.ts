import { defineConfig, devices } from '@playwright/test'

/**
 * The end-to-end test, and there is deliberately only one of it.
 *
 * Everything else in this project is tested where it is cheapest to test:
 * business rules as unit tests against `src/server/`, the policies as a real
 * two-practitioner RLS test, the prompts as snapshots. What none of those can
 * say is whether the *product* works — whether someone can sign up, load a
 * patient, write down a session and get a report out. That is one path, it is
 * the path Hilo exists for, and it is the one thing worth paying browser time
 * for. See `docs/plan-02-migration.md` §8.
 *
 * ─── Why the browser lives in the repo ─────────────────────────────────────
 *
 * The `test:e2e` script sets `PLAYWRIGHT_BROWSERS_PATH=.playwright`
 * (git-ignored) instead of the default `~/.cache`. Node runs inside a `--rm`
 * container here, so a home directory does not survive the command that created
 * it and the 111 MB browser would be downloaded on every single run. It is set
 * in the script rather than here because `playwright install` reads it too, and
 * that runs before this file is ever loaded.
 */

const PORT = 3100
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',

  // The flow is one story told in order — sign up, then a patient, then a
  // session on that patient, then a report about it. Running the steps in
  // parallel would mean four unrelated accounts and no story.
  fullyParallel: false,
  workers: 1,

  // A failing end-to-end test is a real failure. Retrying it once locally hides
  // flakiness that is worth seeing; in CI, one retry separates "the app is
  // broken" from "the runner was slow", which is a distinction worth having
  // when nobody is watching.
  retries: process.env.CI ? 1 : 0,

  reporter: process.env.CI ? [['github'], ['list']] : [['list']],

  use: {
    baseURL: BASE_URL,
    // Rioplatense Spanish, Montevideo — the same locale a practitioner has, so
    // the dates the app formats are the dates the test reads.
    locale: 'es-UY',
    timezoneId: 'America/Montevideo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  /**
   * A production build, on its own port, in its own directory.
   *
   * **Not `next dev`.** Node runs in a container here and the repo is a Docker
   * bind mount, and Turbopack's dev server locks files on it: a second instance
   * — even with the first one stopped — dies reading its own `node_modules`
   * with "Resource deadlock avoided (os error 35)" and every request answers
   * 500. The failure looks exactly like a broken application, which is the worst
   * possible way for a test harness to fail.
   *
   * `next build` plus `next start` sidesteps it entirely, and it is the better
   * thing to test anyway: it is what production runs. It costs a couple of
   * minutes, which is why the timeout below is generous and why this is one
   * test rather than a suite.
   *
   * Port 3100 and `.next-e2e` so that a dev server someone is working in is
   * neither reused nor disturbed — signing up an account and writing a session
   * is not something to do inside a window somebody is looking at.
   */
  webServer: {
    command: `npx next build && npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
    // `next.config.ts` reads this.
    env: { NEXT_DIST_DIR: '.next-e2e' },
  },
})
