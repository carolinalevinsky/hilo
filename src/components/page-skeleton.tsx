import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * What a signed-in screen shows while the server is still answering.
 *
 * ─── Why every screen needs one ────────────────────────────────────────────
 *
 * Without a `loading.tsx` a click on the menu leaves the previous screen exactly
 * as it was until the new one is ready, and for that time the app looks like it
 * did not hear the click. Half a second like that reads as several. This swaps
 * the page for its outline on the same frame, so the answer to the click is
 * immediate even when the data is not.
 *
 * It has the rough shape of a screen — the `PageHeader`, then a card of rows —
 * and deliberately no more. A skeleton shaped like one particular screen is
 * wrong on all the others, and a wrong shape that snaps into a different one is
 * worse than a plain one.
 *
 * ─── Where it is mounted ───────────────────────────────────────────────────
 *
 * In each section's folder (`agenda/`, `pacientes/`, …), which covers arriving
 * at it, and in every folder that has both a page and folders under it
 * (`pacientes/[id]/`, …) for moving inside one. The leaf folders are covered by
 * their parent.
 *
 * Not once in `(app)/` for all of them, and not in `invitaciones/`, on purpose.
 * Under a `loading.tsx` the response has already started when a page calls
 * `notFound()`, so it goes out as a 200 that renders "No encontramos esta
 * página" instead of a 404. For a patient that does not exist that is only a
 * status code. For `/invitaciones` it is the answer to somebody who is not an
 * admin — "this screen does not exist" — and `e2e/invitation.spec.ts` checks
 * for the 404. A new section gets its own `loading.tsx`, by the same rule.
 *
 * Changing only the query string — a filter chip, the week arrows — does not
 * show it. That keeps the list on screen and dimmed instead of emptied, which is
 * what `docs/donde-corre-cada-cosa.md` asks for.
 */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Cargando…</span>

      <div aria-hidden className="mb-4 lg:mb-6">
        <Skeleton className="h-7 w-48 motion-reduce:animate-none lg:h-8" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full motion-reduce:animate-none" />
      </div>

      <Card aria-hidden>
        <CardContent className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full motion-reduce:animate-none" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-2/5 motion-reduce:animate-none" />
                <Skeleton className="h-3 w-3/5 motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
