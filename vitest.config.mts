import { fileURLToPath } from 'node:url'

import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * `loadEnv` is what lets a test import anything that reaches `src/lib/env.ts` —
 * which, through `db.ts`, is most of `src/server/`. Vitest does not read
 * `.env.local` on its own, and without this every such import throws a Zod error
 * about a missing `SUPABASE_SERVICE_ROLE_KEY` that has nothing to do with the
 * test that failed.
 *
 * CI has no `.env.local`; it sets the same variables to placeholders in the
 * workflow. The RLS test deliberately ignores both and asks the running Supabase
 * stack for its real keys.
 */
export default defineConfig(({ mode }) => ({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: loadEnv(mode, process.cwd(), ''),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
