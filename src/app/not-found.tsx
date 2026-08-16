import { Compass } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = { title: 'No encontramos esta página · Hilo' }

/**
 * The 404 — and of the three screens added here, the one a real person actually
 * reaches. Every `notFound()` in the app is a row that was not found under the
 * practitioner's own RLS policy, which in practice means a bookmark to a patient
 * that was deleted, or a report opened from an email months later.
 *
 * Next.js resolves a 404 against the nearest `not-found.tsx` and this is the only
 * one, so it renders inside the root layout, without the sidebar. That is worth
 * knowing rather than worth fixing: the same file answers a signed-out visitor
 * following a dead link and a signed-in practitioner opening a stale bookmark,
 * and a shell only one of them can use would be wrong for the other. So it
 * carries its own way back — the two places anyone here actually wants.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <EmptyState
            icon={Compass}
            title="No encontramos esta página"
            text="El enlace puede estar viejo, o lo que buscabas ya no está en Hilo. Desde el inicio llegás a todo lo demás."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild>
                  <Link href="/inicio">Ir al inicio</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pacientes">Ver mis pacientes</Link>
                </Button>
              </div>
            }
          />
        </Card>
      </div>
    </div>
  )
}
