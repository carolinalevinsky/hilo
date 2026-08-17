'use client'

import { Printer } from '@/components/icons'

import { Button } from '@/components/ui/button'

/**
 * A one-line client island so the page around it can stay a Server Component.
 *
 * Printing matters more here than it looks: a material gets printed and handed
 * to a family, and a report gets printed or "saved as PDF" and sent to a school.
 * The print stylesheet in `globals.css` is what makes the result look like a
 * document instead of a screenshot of an app.
 */
export function PrintButton({ label = 'Imprimir' }: { label?: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="size-4" />
      {label}
    </Button>
  )
}
