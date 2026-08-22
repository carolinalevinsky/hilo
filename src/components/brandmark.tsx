import { cn } from '@/lib/utils'

/**
 * The Hilo mark: a rounded square with three lines that fade downwards — the
 * threads of the name.
 *
 * v1 drew it twice, with the colours swapped depending on what it sat on: violet
 * with white threads on a white card (`.brandmark`), white with violet threads
 * on the violet sidebar (`.brand .dot`). Both are here, because a mark that is
 * a plain square in one place and the real thing in another is worse than
 * either — and that is exactly what v2 had drifted into.
 *
 * The threads are one pseudo-element plus two box-shadows, which is how v1 drew
 * them and means the mark needs no image file and no request.
 */
export function Brandmark({
  variant = 'onLight',
  size = 30,
  className,
}: {
  /** `onLight` sits on a white card; `onViolet` sits on the sidebar. */
  variant?: 'onLight' | 'onViolet'
  size?: number
  className?: string
}) {
  // The threads are placed proportionally so the mark survives being resized.
  const inset = Math.round(size * 0.27)
  const top = Math.round(size * 0.27)
  const thickness = Math.max(2, Math.round(size * 0.083))
  const gap = Math.round(size * 0.2)

  const threads =
    variant === 'onViolet'
      ? { color: 'var(--hilo-violet)', second: '#a99cff', third: '#c9c1ff' }
      : { color: '#fff', second: 'rgb(255 255 255 / 60%)', third: 'rgb(255 255 255 / 35%)' }

  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-block shrink-0',
        variant === 'onViolet'
          ? 'bg-white shadow-[0_4px_12px_rgb(0_0_0_/_15%)]'
          : 'bg-violet',
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
      }}
    >
      <span
        className="absolute rounded-[3px]"
        style={{
          left: inset,
          right: inset,
          top,
          height: thickness,
          background: threads.color,
          boxShadow: `0 ${gap}px 0 ${threads.second}, 0 ${gap * 2}px 0 ${threads.third}`,
        }}
      />
    </span>
  )
}
