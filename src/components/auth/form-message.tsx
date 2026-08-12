import { cn } from '@/lib/utils'

/**
 * The error strip above a form. Coral background, v1's shape
 * (`legacy/index.html:511`).
 *
 * It renders nothing when there is no message, so a form can mount it
 * unconditionally.
 */
export function FormMessage({
  message,
  className,
}: {
  message: string | null | undefined
  className?: string
}) {
  if (!message) return null

  return (
    <p
      role="alert"
      className={cn(
        'rounded-[11px] bg-coral-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#c0392b]',
        className,
      )}
    >
      {message}
    </p>
  )
}
